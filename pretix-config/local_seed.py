import os
import sys
import django
from datetime import timedelta

# Bootstrap Django environment if run directly
if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pretix.settings")
    django.setup()

from django.utils.timezone import now
from i18nfield.strings import LazyI18nString
from django_scopes import scope
from pretix.base.models import Organizer, Event, Item, Quota, Team, TeamAPIToken

def seed():
    print("--- STARTING SEEDING PROCESS ---")
    try:
        # Create both organizers for compatibility
        tokens = {}
        for org_slug, org_name, org_name_ar in [
            ('yadawi-sa', 'Yadawi KSA', 'ياداوي السعودية'),
            ('yadawi', 'Yadawi', 'ياداوي')
        ]:
            organizer, created = Organizer.objects.get_or_create(
                slug=org_slug,
                defaults={'name': LazyI18nString({'en': org_name, 'ar': org_name_ar})}
            )
            if created:
                print(f"Created organizer: {org_slug}")

            with scope(organizer=organizer):
                # 2. Create Team and Token
                team, created = Team.objects.get_or_create(
                    organizer=organizer,
                    name='API Team',
                    defaults={
                        'all_events': True,
                        'can_view_orders': True,
                        'can_view_vouchers': True,
                        'can_change_items': True,
                        'can_change_vouchers': True,
                        'can_change_orders': True,
                        'can_change_event_settings': True,
                    }
                )
                if not team.all_events or created:
                    team.all_events = True
                    team.save()

                token_val = '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz'
                if org_slug == 'yadawi-sa':
                    token_val = 'SA_' + token_val

                token_obj, t_created = TeamAPIToken.objects.get_or_create(
                    team=team,
                    token=token_val,
                    defaults={'name': 'Frontend Token', 'active': True}
                )
                
                tokens[org_slug] = token_val
                
                if t_created:
                    print(f"Created API token for {org_slug}: {token_val}")
                else:
                    print(f"Verified API token for {org_slug}: {token_val}")

                # 3. Create Sample Events
                for i in range(1, 4):
                    slug = f'workshop-{i}'
                    name_en = f'Glass Workshop {i} ({org_slug})'
                    name_ar = f'ورشة عمل {i} ({org_slug})'
                    event, e_created = Event.objects.get_or_create(
                        organizer=organizer,
                        slug=slug,
                        defaults={
                            'name': LazyI18nString({'en': name_en, 'ar': name_ar}),
                            'date_from': now() + timedelta(days=7 + i),
                            'live': True,
                            'is_public': True,
                            'currency': 'KWD' if org_slug == 'yadawi' else 'SAR',
                            'plugins': 'pretix.plugins.sendmail,pretix.plugins.banktransfer'
                        }
                    )
                    if e_created:
                        print(f"Created event: {slug} for {org_slug}")
                        quota, _ = Quota.objects.get_or_create(event=event, name='Default', size=10)
                        item, _ = Item.objects.get_or_create(
                            event=event, 
                            name=LazyI18nString({'en': 'Standard', 'ar': 'عادي'}),
                            defaults={'default_price': 100}
                        )
                        item.quotas.add(quota)

        print("\n" + "="*60)
        print("🚀 SEEDING COMPLETED SUCCESSFULLY")
        print("="*60)
        print(f"KW Token: {tokens.get('yadawi')}")
        print(f"SA Token: {tokens.get('yadawi-sa')}")
        print("="*60)
        print("COPY THESE TO YOUR .env FILE ON THE VPS")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ ERROR DURING SEEDING: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    seed()
