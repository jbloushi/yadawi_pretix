import os
import sys
import django
from django.utils.timezone import now
from datetime import timedelta
import secrets

# Setup path and settings for standalone image
sys.path.insert(0, '/pretix/src')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'production_settings')

try:
    django.setup()
    from i18nfield.strings import LazyI18nString
    from django_scopes import scope
    from pretix.base.models import Organizer, Event, Item, Quota, Team, TeamAPIToken, Order, OrderPosition, SalesChannel
except Exception as e:
    print(f"Import error: {e}")
    sys.exit(1)

def seed():
    token_val = '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz'
    
    # Clean up any existing tokens with this value to ensure we can re-assign them properly
    TeamAPIToken.objects.filter(token=token_val).delete()

    for org_slug, org_name in [('yadawi', 'Yadawi'), ('yadawi-sa', 'Yadawi KSA')]:
        organizer, _ = Organizer.objects.get_or_create(
            slug=org_slug,
            defaults={'name': LazyI18nString({'en': org_name})}
        )
        
        with scope(organizer=organizer):
            # Admin setup with FULL PERMISSIONS
            team, _ = Team.objects.get_or_create(
                organizer=organizer, 
                name=f'API Full Access ({org_slug})', 
                defaults={
                    'all_events': True, 
                    'can_view_orders': True,
                    'can_change_orders': True,
                    'can_view_vouchers': True,
                    'can_change_vouchers': True,
                    'can_change_items': True,
                    'can_change_event_settings': True,
                    'can_checkin_orders': True,
                }
            )
            # Force permissions refresh
            team.can_change_orders = True
            team.can_view_orders = True
            team.all_events = True
            team.save()

            # Assign token to this specific organizer's team
            TeamAPIToken.objects.create(team=team, token=token_val, name='Unified Token', active=True)

            # Workshop setup for each org
            event_slug = f'workshop-{org_slug}'
            event, _ = Event.objects.get_or_create(
                organizer=organizer,
                slug=event_slug,
                defaults={
                    'name': LazyI18nString({'en': f'Glass Workshop ({org_name})'}),
                    'date_from': now() + timedelta(days=5),
                    'live': True,
                    'is_public': True,
                    'currency': 'SAR'
                }
            )
            
            quota, _ = Quota.objects.get_or_create(event=event, name='Default', size=100)
            item, _ = Item.objects.get_or_create(
                event=event, 
                name=LazyI18nString({'en': 'Standard', 'ar': 'عادي'}),
                defaults={'default_price': 100}
            )
            item.quotas.add(quota)

            # Sales Channel
            sc, _ = SalesChannel.objects.get_or_create(organizer=organizer, identifier='web')

            print(f"Seeded {org_slug} with full permissions and event {event_slug}")

    print("Unified multi-org seed completed successfully.")

if __name__ == "__main__":
    seed()
