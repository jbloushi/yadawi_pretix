'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useBranch } from '@/lib/branch';
import { Calendar, MapPin, Heart, Search, Loader2 } from 'lucide-react';
import { formatDate, getLocalizedName } from '@/lib/utils';
import type { PretixEvent } from '@/types/pretix';

const filterChips = [
  { key: 'all', label: 'All', labelAr: 'الكل' },
  { key: 'upcoming', label: 'Upcoming', labelAr: 'القادمة' },
  { key: 'beginner', label: 'Beginner', labelAr: 'مبتدئ' },
  { key: 'filters', label: 'Filters', labelAr: 'تصفية' },
];

export function WorkshopsPage() {
  const { t, locale } = useTranslation();
  const { branch } = useBranch();
  const [activeFilter, setActiveFilter] = useState('all');
  const [events, setEvents] = useState<PretixEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/pretix/events?debug=1');
        const data = await res.json();
        if (!res.ok) {
          console.error('Workshops API debug payload:', data);
          throw new Error(data.error || 'Failed to fetch');
        }
        setEvents(data.results || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load workshops');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  /** Filter by the global branch selection */
  const filteredEvents = events.filter((e) => {
    if (branch === 'KWT') return e.organizer === 'yadawi';
    return e.organizer === 'yadawi-sa';
  });

  return (
    <div>
      {/* List Header */}
      <div className="bg-white px-3.5 py-3 border-b border-line">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-extrabold text-secondary-900">
            {t('workshops.title')}
          </h1>
          <div className="flex gap-2.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-line bg-white">
              <Heart size={14} className="text-secondary-600" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-line bg-white">
              <Search size={14} className="text-secondary-600" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`chip ${activeFilter === chip.key ? 'chip-active' : ''}`}
            >
              {locale === 'ar' ? chip.labelAr : chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workshop List */}
      <div className="p-3.5 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-secondary-600">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-secondary-600">{t('workshops.noWorkshops')}</div>
        ) : (
          filteredEvents.map((event) => (
            <WorkshopRowCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function WorkshopRowCard({ event }: { event: PretixEvent }) {
  const { t, locale } = useTranslation();
  const eventName = getLocalizedName(event.name, locale);

  const gradients = [
    'bg-gradient-to-br from-primary to-cyan-400',
    'bg-gradient-to-br from-cyan-400 to-purple-400',
    'bg-gradient-to-br from-orange-300 to-primary',
    'bg-gradient-to-br from-pink-300 to-rose-400',
  ];

  const gradient = gradients[event.id % gradients.length];
  const branchBadge = event.organizer === 'yadawi' ? '🇰🇼 KW' : '🇸🇦 SA';

  return (
    <Link href={`/workshops/${event.slug}`} className="card grid grid-cols-[1.1fr_1.4fr] gap-2.5">
      <div
        className={`h-24 rounded-[16px] ${event.coverImage ? 'bg-cover bg-center' : gradient} relative overflow-hidden`}
        style={event.coverImage ? { backgroundImage: `url(${event.coverImage})` } : {}}
      >
        {!event.coverImage && <div className="absolute inset-0 bg-white/20"></div>}
        {/* Branch flag badge */}
        <div style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1.4,
        }}>
          {branchBadge}
        </div>
      </div>

      <div className="p-2.5 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-extrabold text-secondary-900 mb-1 leading-tight">
            {eventName}
          </h3>

          <div className="flex gap-2.5 text-[11px] text-secondary-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(event.date_from, locale)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {event.location || 'Riyadh'}
            </span>
          </div>
        </div>

        <div className="mt-2">
          <button className="btn btn-primary w-full text-xs py-2">
            {t('workshops.viewDetails')} →
          </button>
        </div>
      </div>
    </Link>
  );
}
