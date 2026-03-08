#!/usr/bin/env python3
"""
Seed script to create workshops in pretix from ksa.yadawi.org
Run: python3 seed_workshops.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pretix.settings')
sys.path.insert(0, '/opt/pretix')

try:
    django.setup()
except Exception as e:
    print(f"Django setup error: {e}")
    print("Make sure pretix is installed and configured")
    sys.exit(1)

from pretix.base.models import Organizer, Event, Item, ItemVariation, Quota
from django.contrib.auth import get_user_model

User = get_user_model()

WORKSHOPS = [
    {
        "name_ar": "الوصول إلى فرن صهر الزجاج",
        "name_en": "Glass Fusing Kiln Access",
        "slug": "glass-fusing-kiln-access",
        "description_ar": "احصل على الوصول إلى فرن صهر الزجاج لإنشاء قطع فنية فريدة من نوعها",
        "description_en": "Get access to the glass fusing kiln to create unique art pieces",
        "price_min": 875,
        "price_max": 1650,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "glass",
        "duration_hours": 4,
    },
    {
        "name_ar": "تجربة صناعة الخرز",
        "name_en": "Beadmaking Taster",
        "slug": "beadmaking-taster",
        "description_ar": "جلسة خاصة لتجربة صناعة الخرز على اللهب",
        "description_en": "Private session to experience beadmaking on the torch",
        "price_min": 375,
        "price_max": 375,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 2,
    },
    {
        "name_ar": "أساسيات صهر الزجاج",
        "name_en": "Fusing Basics In Glass",
        "slug": "fusing-basics-glass",
        "description_ar": "تعلم أساسيات صهر الزجاج وتقنياته",
        "description_en": "Learn the basics of glass fusing and its techniques",
        "price_min": 5000,
        "price_max": 5000,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "glass",
        "duration_hours": 8,
    },
    {
        "name_ar": "صناعة الخرز مع لبنا",
        "name_en": "Beadmaking with Lubna",
        "slug": "beadmaking-lubna",
        "description_ar": "ورشة عمل لصناعة الخرز مع المدربة لبنا",
        "description_en": "Beadmaking workshop with instructor Lubna",
        "price_min": 375,
        "price_max": 375,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 2,
    },
    {
        "name_ar": "عضوية وقت اللهب",
        "name_en": "Torch Time Memberships",
        "slug": "torch-time-memberships",
        "description_ar": "عضوية للوصول المستمر إلى وقت اللهب في الاستوديو",
        "description_en": "Membership for ongoing torch time access at the studio",
        "price_min": 675,
        "price_max": 1300,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "membership",
        "duration_hours": 0,
    },
    {
        "name_ar": "خرز أنبوبي",
        "name_en": "Tubular Beads",
        "slug": "tubular-beads",
        "description_ar": "تعلم تقنية صناعة الخرز الأنبوبي المتقدم",
        "description_en": "Learn advanced tubular bead making techniques",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 3,
    },
    {
        "name_ar": "خرز الزهور",
        "name_en": "Beads of Flowers",
        "slug": "beads-of-flowers",
        "description_ar": "صناعة خرز على شكل زهور جميلة",
        "description_en": "Create beautiful flower-shaped beads",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 3,
    },
    {
        "name_ar": "خرز الزهرة ثلاثية البتلات",
        "name_en": "Tri Petal Flower Beads",
        "slug": "tri-petal-flower-beads",
        "description_ar": "صناعة خرز زهرة ثلاثية البتلات",
        "description_en": "Create three-petal flower beads",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 3,
    },
    {
        "name_ar": "خرز الجاذبية",
        "name_en": "Gravity Beads",
        "slug": "gravity-beads",
        "description_ar": "تقنية متقدمة في صناعة الخرز باستخدام الجاذبية",
        "description_en": "Advanced beadmaking technique using gravity",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 3,
    },
    {
        "name_ar": "خرز الحفريات",
        "name_en": "Fossil Beads",
        "slug": "fossil-beads",
        "description_ar": "صناعة خرز بتقنية الحفريات",
        "description_en": "Create fossil-style beads",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 3,
    },
    {
        "name_ar": "النقاط والأنماط السطحية",
        "name_en": "Dots & Surface Patterns",
        "slug": "dots-surface-patterns",
        "description_ar": "تعلم تقنية النقاط والأنماط السطحية في صناعة الخرز",
        "description_en": "Learn dots and surface pattern techniques in beadmaking",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 3,
    },
    {
        "name_ar": "اصنع بلاط الزجاج الخاص بك",
        "name_en": "Make Your Own Glass Tile",
        "slug": "make-own-glass-tile",
        "description_ar": "اصنع بلاط زجاجي خاص بك يدوياً",
        "description_en": "Create your own handcrafted glass tile",
        "price_min": 245,
        "price_max": 245,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "glass",
        "duration_hours": 2,
    },
    {
        "name_ar": "أساسيات صناعة الخرز 101",
        "name_en": "Foundations in Bead Making 101",
        "slug": "foundations-beadmaking-101",
        "description_ar": "دورة أساسية شاملة في صناعة الخرز",
        "description_en": "Comprehensive foundation course in beadmaking",
        "price_min": 550,
        "price_max": 550,
        "currency": "SAR",
        "location": "الرياض، المملكة العربية السعودية",
        "location_en": "Riyadh, Saudi Arabia",
        "category": "beadmaking",
        "duration_hours": 4,
    },
]


def seed_organizers():
    """Create organizers"""
    organizer, created = Organizer.objects.get_or_create(
        slug='yadawi-sa',
        defaults={
            'name': 'Yadawi KSA',
            'name_ar': 'ياداوي السعودية',
        }
    )
    if created:
        print(f"Created organizer: {organizer.name}")
    else:
        print(f"Organizer already exists: {organizer.name}")
    
    return organizer


def seed_workshops(organizer):
    """Create workshop events"""
    base_date = datetime.now()
    
    for i, workshop in enumerate(WORKSHOPS):
        slug = workshop['slug']
        
        # Calculate event date (spread over next few months)
        event_date = base_date + timedelta(days=30 + (i * 14))
        
        event, created = Event.objects.get_or_create(
            slug=slug,
            organizer=organizer,
            defaults={
                'name': workshop['name_en'],
                'name_ar': workshop['name_ar'],
                'description': workshop['description_en'],
                'description_ar': workshop['description_ar'],
                'date_from': event_date,
                'date_to': event_date + timedelta(hours=workshop['duration_hours']),
                'location': workshop['location_en'],
                'location_ar': workshop['location'],
                'currency': workshop['currency'],
                'is_public': True,
                'presale_start': datetime.now(),
                'presale_end': event_date - timedelta(hours=2),
            }
        )
        
        if created:
            print(f"Created event: {event.name}")
            
            # Create quota
            quota, _ = Quota.objects.get_or_create(
                event=event,
                name='التوفر',
                defaults={
                    'size': 10,
                    'close_when_sold_out': True,
                }
            )
            
            # Create item/ticket
            item, _ = Item.objects.get_or_create(
                event=event,
                name='Standard',
                name_ar='عادي',
                defaults={
                    'default_price': workshop['price_min'],
                    'tax_rate': 15,
                    'description': workshop['description_en'],
                    'description_ar': workshop['description_ar'],
                }
            )
            
            # Add to quota
            item.quotas.add(quota)
            
            # If price range, create variations
            if workshop['price_min'] != workshop['price_max']:
                # VIP ticket
                vip_item, _ = Item.objects.get_or_create(
                    event=event,
                    name='VIP',
                    name_ar='VIP',
                    defaults={
                        'default_price': workshop['price_max'],
                        'tax_rate': 15,
                        'description': workshop['description_en'],
                        'description_ar': workshop['description_ar'],
                    }
                )
                vip_item.quotas.add(quota)
                
        else:
            print(f"Event already exists: {event.name}")
    
    print(f"\nTotal workshops created: {len(WORKSHOPS)}")


def main():
    print("=" * 50)
    print("Yadawi Workshops Seed Script")
    print("=" * 50)
    
    # Create organizer
    organizer = seed_organizers()
    
    # Create workshops
    seed_workshops(organizer)
    
    print("\n" + "=" * 50)
    print("Seed completed successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Login to admin: https://pretix.yadawi.com/control/")
    print("2. Verify workshops are created")
    print("3. Generate API token in Account Settings")


if __name__ == '__main__':
    main()
