'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useBranch } from '@/lib/branch';
import { formatCurrency, formatDate, getLocalizedName } from '@/lib/utils';
import { track } from '@/lib/analytics';
import type { PretixEvent } from '@/types/pretix';

type DateFilter = 'all' | 'week' | 'weekend';

export function WorkshopsPage() {
  const { locale } = useTranslation();
  const { branch } = useBranch();
  const [events, setEvents] = useState<PretixEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('soonest');
  const isArabic = locale === 'ar';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') || '');
    setCategory(params.get('category') || '');
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch(`/api/pretix/events?market=${branch}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setEvents(data.results || []);
        track('workshop_list_viewed', { market: branch });
      })
      .catch(error => { if (error.name !== 'AbortError') setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [branch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (dateFilter !== 'all') params.set('date', dateFilter);
    window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`);
  }, [query, category, location, dateFilter]);

  const categories = useMemo(() => Array.from(new Set(events.map(event => event.category).filter(Boolean))) as string[], [events]);
  const locations = useMemo(() => Array.from(new Set(events.map(event => event.location).filter(Boolean))) as string[], [events]);
  const visibleEvents = useMemo(() => {
    const now = new Date();
    const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + 7);
    const lowerQuery = query.trim().toLocaleLowerCase(locale);
    return events.filter(event => {
      const name = getLocalizedName(event.name, locale).toLocaleLowerCase(locale);
      const description = typeof event.description === 'string' ? event.description : getLocalizedName(event.description, locale);
      if (lowerQuery && !`${name} ${description} ${event.location || ''} ${event.instructor || ''}`.toLocaleLowerCase(locale).includes(lowerQuery)) return false;
      if (category && event.category !== category) return false;
      if (location && event.location !== location) return false;
      if (dateFilter !== 'all' && event.date_from) {
        const date = new Date(event.date_from);
        if (dateFilter === 'week' && date > endOfWeek) return false;
        if (dateFilter === 'weekend' && ![5, 6].includes(date.getDay())) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sort === 'price') return (a.minPrice ?? Number.MAX_VALUE) - (b.minPrice ?? Number.MAX_VALUE);
      return new Date(a.date_from || 0).getTime() - new Date(b.date_from || 0).getTime();
    });
  }, [events, query, category, location, dateFilter, sort, locale]);

  const updateFilter = (kind: string, value: string) => {
    track(kind === 'search' ? 'workshop_searched' : 'workshop_filter_applied', { market: branch, category: kind, filter_value: value });
  };

  return (
    <main className="catalog-page">
      <header className="catalog-heading">
        <span className="eyebrow">{branch === 'KWT' ? (isArabic ? 'الكويت' : 'Kuwait') : (isArabic ? 'السعودية' : 'Saudi Arabia')}</span>
        <h1>{isArabic ? 'اختر تجربتك القادمة' : 'Choose your next creative experience'}</h1>
        <p>{isArabic ? 'قارن المواعيد والمواقع والأسعار قبل الحجز.' : 'Compare dates, locations and prices without opening every workshop.'}</p>
      </header>

      <section className="catalog-controls" aria-label={isArabic ? 'تصفية الورش' : 'Workshop filters'}>
        <label className="catalog-search"><Search size={18} /><span className="sr-only">{isArabic ? 'بحث' : 'Search'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} onBlur={() => updateFilter('search', query)} placeholder={isArabic ? 'ابحث عن حرفة أو مدرب أو فرع' : 'Search craft, instructor or branch'} /></label>
        <div className="filter-row">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <select value={category} aria-label={isArabic ? 'الحرفة' : 'Craft'} onChange={event => { setCategory(event.target.value); updateFilter('category', event.target.value); }}><option value="">{isArabic ? 'كل الحرف' : 'All crafts'}</option>{categories.map(value => <option key={value}>{value}</option>)}</select>
          <select value={location} aria-label={isArabic ? 'الفرع' : 'Location'} onChange={event => { setLocation(event.target.value); updateFilter('location', event.target.value); }}><option value="">{isArabic ? 'كل الفروع' : 'All locations'}</option>{locations.map(value => <option key={value}>{value}</option>)}</select>
          <select value={sort} aria-label={isArabic ? 'الترتيب' : 'Sort'} onChange={event => setSort(event.target.value)}><option value="soonest">{isArabic ? 'الأقرب موعداً' : 'Soonest first'}</option><option value="price">{isArabic ? 'السعر الأقل' : 'Lowest price'}</option></select>
        </div>
        <div className="date-chips" aria-label={isArabic ? 'التاريخ' : 'Date'}>{(['all','week','weekend'] as DateFilter[]).map(value => <button key={value} type="button" aria-pressed={dateFilter === value} onClick={() => { setDateFilter(value); updateFilter('date', value); }}>{value === 'all' ? (isArabic ? 'كل المواعيد' : 'All dates') : value === 'week' ? (isArabic ? 'هذا الأسبوع' : 'This week') : (isArabic ? 'نهاية الأسبوع' : 'This weekend')}</button>)}</div>
      </section>

      <div className="results-summary" aria-live="polite">{isArabic ? `${visibleEvents.length} ورشة متاحة` : `${visibleEvents.length} workshop${visibleEvents.length === 1 ? '' : 's'} available`}</div>
      {loading ? <div className="workshop-status">{isArabic ? 'جاري تحميل التوفر الحالي…' : 'Loading current availability…'}</div>
        : error ? <div className="workshop-status" role="alert">{isArabic ? 'تعذر تحميل الورش. حاول مرة أخرى.' : 'We could not load workshops. Please try again.'}</div>
        : visibleEvents.length === 0 ? <div className="workshop-status"><h2>{isArabic ? 'لا توجد نتائج مطابقة' : 'No exact matches'}</h2><p>{isArabic ? 'جرّب إزالة أحد الفلاتر أو اختر كل المواعيد.' : 'Try removing a filter or viewing all dates.'}</p><button type="button" onClick={() => { setQuery(''); setCategory(''); setLocation(''); setDateFilter('all'); }}>{isArabic ? 'مسح الفلاتر' : 'Clear filters'}</button></div>
        : <div className="catalog-grid">{visibleEvents.map(event => <CatalogCard key={event.slug} event={event} locale={locale} market={branch} />)}</div>}
    </main>
  );
}

function CatalogCard({ event, locale, market }: { event: PretixEvent; locale: string; market: 'KWT' | 'KSA' }) {
  const isArabic = locale === 'ar';
  return <article className="catalog-card">
    <Link href={`/workshops/${event.slug}?market=${market}`} className="catalog-card-image" aria-label={getLocalizedName(event.name, locale)} style={event.coverImage ? { backgroundImage: `url(${event.coverImage})` } : undefined}>{!event.coverImage && <Sparkles size={34} />}</Link>
    <div className="catalog-card-copy">
      <div className="catalog-badges">{event.category && <span>{event.category}</span>}{event.skillLevel && <span>{event.skillLevel}</span>}{event.ageGroup && <span>{event.ageGroup}</span>}</div>
      <h2><Link href={`/workshops/${event.slug}?market=${market}`}>{getLocalizedName(event.name, locale)}</Link></h2>
      <p><CalendarDays size={15} /> {formatDate(event.date_from, locale)}</p>
      {event.location && <p><MapPin size={15} /> {event.location}</p>}
      <footer><strong>{event.minPrice !== undefined ? `${isArabic ? 'من ' : 'From '}${formatCurrency(event.minPrice, event.currency, locale)}` : (isArabic ? 'اعرض الأسعار' : 'View prices')}</strong><Link href={`/workshops/${event.slug}?market=${market}`}>{isArabic ? 'اختر موعداً' : 'Choose a date'}</Link></footer>
    </div>
  </article>;
}
