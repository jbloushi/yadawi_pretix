from pretix.base.models import User, Organizer
if not User.objects.filter(email='admin@yadawi.com').exists():
    User.objects.create_superuser('admin@yadawi.com', 'admin123')
Organizer.objects.get_or_create(slug='yadawi', name='Yadawi Kuwait')
Organizer.objects.get_or_create(slug='yadawi-sa', name='Yadawi KSA')
print("Successfully seeded admin and organizers")
