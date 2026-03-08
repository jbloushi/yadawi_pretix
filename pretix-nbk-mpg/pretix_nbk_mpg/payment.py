import json
import logging
import requests
from django import forms
from django.utils.translation import gettext_lazy as _
from django.template.loader import render_to_string
from pretix.base.payment import BasePaymentProvider, PaymentException
from pretix.multidomain.urlreverse import build_absolute_uri

logger = logging.getLogger(__name__)

MPGS_BASE = 'https://nbkpayment.gateway.mastercard.com/api/rest/version/73'

class NBKMPGPaymentProvider(BasePaymentProvider):
    identifier = 'nbk_mpg'
    verbose_name = _('NBK Online Payment (Card + Apple Pay)')
    public_name = _('Credit Card / Mada / Knet / Apple Pay')

    @property
    def settings_form_fields(self):
        fields = super().settings_form_fields
        fields['merchant_id'] = forms.CharField(
            label=_('NBK Merchant ID'),
            help_text=_('Your Mastercard Payment Gateway Services Merchant ID'),
        )
        fields['api_password'] = forms.CharField(
            label=_('API Password'),
            widget=forms.PasswordInput(render_value=True),
        )
        fields['currency'] = forms.ChoiceField(
            label=_('Currency'),
            choices=[('KWD', 'KWD'), ('SAR', 'SAR')],
            help_text=_('Match this with your organizer currency setting.'),
        )
        # We need a webhook secret if we plan to verify webhooks. For simplicity here,
        # we'll rely on querying the transaction status when the user returns.
        return fields

    def payment_is_valid_session(self, request):
        return True

    def payment_form_render(self, request, total, order=None):
        try:
            session_id = self._create_mpgs_session(request, order, total)
        except Exception as e:
            logger.exception("Failed to create MPGS session")
            return f'<div class="alert alert-danger">Payment gateway unavailable: {str(e)}</div>'

        return_url = build_absolute_uri(
            request.event,
            'plugins:nbk_mpg:return',
            kwargs={'order': order.code, 'hash': order.secret}
        )

        template_ctx = {
            'session_id': session_id,
            'currency': self.settings.get('currency', 'KWD'),
            'amount': str(total),
            'return_url': return_url,
            'merchant_id': self.settings.get('merchant_id'),
        }
        return render_to_string('pretix_nbk_mpg/checkout.html', template_ctx)

    def checkout_prepare(self, request, cart):
        return True

    def payment_prepare(self, request, payment):
        return True

    def execute_payment(self, request, payment):
        # In hosted checkout, execute_payment is called when the user clicks 'Pay'.
        # Since we render the Apple Pay / Hosted Checkout block directly on the confirm page
        # instead of redirecting, the actual confirmation happens in the return view or webhook.
        pass

    def _create_mpgs_session(self, request, order, total):
        merchant_id = self.settings.get('merchant_id')
        password = self.settings.get('api_password')
        currency = self.settings.get('currency', 'KWD')

        return_url = build_absolute_uri(
            request.event,
            'plugins:nbk_mpg:return',
            kwargs={'order': order.code, 'hash': order.secret}
        )

        payload = {
            'apiOperation': 'CREATE_CHECKOUT_SESSION',
            'order': {
                'id': order.code,
                'amount': str(total),
                'currency': currency,
                'description': f'Order {order.code} for {request.event.name}',
            },
            'interaction': {
                'operation': 'PURCHASE',
                'merchant': {
                    'name': request.organizer.name,
                },
                'returnUrl': return_url,
                'displayControl': {
                    'billingAddress': 'HIDE',
                    'shipping': 'HIDE'
                }
            }
        }

        resp = requests.post(
            f'{MPGS_BASE}/merchant/{merchant_id}/session',
            json=payload,
            auth=(f'merchant.{merchant_id}', password),
            timeout=10,
        )
        
        if resp.status_code != 200 and resp.status_code != 201:
            logger.error(f"MPGS session creation failed: {resp.text}")
            resp.raise_for_status()

        data = resp.json()
        if data.get('result') != 'SUCCESS':
            raise Exception(f"Failed to initialize payment: {data.get('error', {}).get('explanation', 'Unknown error')}")

        return data['session']['id']

    def confirm_payment_from_gateway(self, payment, result_indicator):
        merchant_id = self.settings.get('merchant_id')
        password = self.settings.get('api_password')
        order_code = payment.order.code

        # Query the order transaction to verify the result indicator
        resp = requests.get(
            f'{MPGS_BASE}/merchant/{merchant_id}/order/{order_code}',
            auth=(f'merchant.{merchant_id}', password),
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        # Check if the payment was successful
        if data.get('result') == 'SUCCESS' and data.get('status') == 'CAPTURED':
            # Check if we have already confirmed it
            if payment.state != payment.STATE_CONFIRMED:
                payment.confirm()
            return True
        elif data.get('result') == 'PENDING':
            payment.state = payment.STATE_PENDING
            payment.save()
            return False
        else:
            raise PaymentException(f"Payment declined by gateway: {data.get('result')}")
