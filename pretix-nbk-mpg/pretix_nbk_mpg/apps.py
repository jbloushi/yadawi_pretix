from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class PluginApp(AppConfig):
    name = 'pretix_nbk_mpg'
    verbose_name = 'Yadawi NBK MPG'

    class PretixPluginMeta:
        name = _('Yadawi NBK MPG Payment')
        author = 'Yadawi'
        description = _('Pretix payment provider for NBK Mastercard Payment Gateway (MPGS) with Apple Pay support.')
        visible = True
        version = '1.0.0'
        category = 'PAYMENT'

    def ready(self):
        from . import signals  # noqa
