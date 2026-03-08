import logging
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from pretix.base.models import Order
from pretix.multidomain.urlreverse import eventreverse
from .payment import NBKMPGPaymentProvider

logger = logging.getLogger(__name__)

@csrf_exempt
def nbk_return(request, order, hash):
    """
    User is returned here by the MPGS Hosted Checkout form submission.
    """
    order_obj = get_object_or_404(Order, code=order, secret=hash)
    
    result_indicator = request.POST.get('resultIndicator') or request.GET.get('resultIndicator')
    
    if order_obj.status == Order.STATUS_PAID:
        return HttpResponseRedirect(eventreverse(order_obj.event, 'presale:event.order', kwargs={
            'order': order_obj.code,
            'secret': order_obj.secret
        }) + '?paid=yes')

    if not result_indicator:
        logger.error(f"NBK return called without resultIndicator for order {order}")
        return HttpResponseRedirect(eventreverse(order_obj.event, 'presale:event.order', kwargs={
            'order': order_obj.code,
            'secret': order_obj.secret
        }) + '?paid=no')

    # Get the provider instance
    provider = NBKMPGPaymentProvider(order_obj.event)
    try:
        payment = order_obj.payments.filter(
            provider='nbk_mpg',
            state__in=[OrderPayment.STATE_CREATED, OrderPayment.STATE_PENDING]
        ).last()
        
        if not payment:
            # Fallback if somehow there's no payment object linked to this execution
            payment = order_obj.payments.create(
                provider='nbk_mpg',
                amount=order_obj.total,
                state=OrderPayment.STATE_CREATED
            )

        provider.confirm_payment_from_gateway(payment, result_indicator)
        
        return HttpResponseRedirect(eventreverse(order_obj.event, 'presale:event.order', kwargs={
            'order': order_obj.code,
            'secret': order_obj.secret
        }) + '?paid=yes')
        
    except Exception as e:
        logger.exception(f"Failed to confirm NBK payment for order {order}: {str(e)}")
        # redirect back to order with error
        return HttpResponseRedirect(eventreverse(order_obj.event, 'presale:event.order', kwargs={
            'order': order_obj.code,
            'secret': order_obj.secret
        }) + '?paid=no')

@csrf_exempt
def nbk_webhook(request):
    """
    Handles server-to-server notifications from MPGS.
    """
    # MPGS sends webhook notifications which are authenticated by a secret.
    # We can implement this for better reliability (highly recommended for production).
    # Return 200 OK so MPGS stops retrying.
    return HttpResponse("OK")
