import os
from datetime import timedelta
from django.utils.timezone import now
from i18nfield.strings import LazyI18nString
from django_scopes import scope
from pretix.base.models import Organizer, Event, Item, Quota, Team, TeamAPIToken

def seed():
    # Create both organizers for compatibility
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
                    'can_view_orders': True,
                    'can_view_vouchers': True,
                    'can_change_items': True,
                    'can_change_vouchers': True,
                    'can_change_orders': True,
                    'can_change_event_settings': True,
                }
            )
            team.all_events = True
            team.save()

            token_val = '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz'
            if org_slug == 'yadawi-sa':
                token_val = 'SA_' + token_val

            token, t_created = TeamAPIToken.objects.get_or_create(
                team=team,
                token=token_val,
                defaults={'name': 'Frontend Token', 'active': True}
            )
            if t_created:
                print(f"Created API token for {org_slug}: {token_val}")
            else:
                print(f"Using existing API token for {org_slug}: {token.token}")

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

    print("Seed process completed.")

if __name__ == "__main__":
    seed()
