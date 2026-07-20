'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Package, Sparkles, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useBranch } from '@/lib/branch';
import { formatCurrency, formatDate, getLocalizedName } from '@/lib/utils';
import { track } from '@/lib/analytics';
import type { PretixEvent } from '@/types/pretix';

export function HomePage() {
  const { locale } = useTranslation();
  const { branch } = useBranch();
  const [events, setEvents] = useState<PretixEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch(`/api/pretix/events?market=${branch}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setEvents(data.results || []);
      })
      .catch(error => { if (error.name !== 'AbortError') setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [branch]);

  const categories = useMemo(() => Array.from(new Set(events.map(event => event.category).filter(Boolean))) as string[], [events]);
  const featured = events[0];
  const isArabic = locale === 'ar';

  return (
    <main className="home-redesign">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> {isArabic ? 'تجارب إبداعية عملية' : 'Hands-on creative experiences'}</span>
          <h1 id="home-title">{isArabic ? 'اكتشف حرفة. اصنع شيئاً. واصل الإبداع.' : 'Discover a craft. Make something. Keep creating.'}</h1>
          <p>{isArabic ? 'ورش عملية وأدوات مختارة بعناية للمبدعين في الكويت والسعودية.' : 'Book a hands-on workshop, then find the right tools and kits to continue at home.'}</p>
          <div className="hero-actions">
            <Link href="/workshops" className="hero-primary">{isArabic ? 'ابحث عن ورشة' : 'Find a workshop'} <ArrowRight size={17} /></Link>
            <Link href="/shop" className="hero-secondary">{isArabic ? 'تسوق مستلزمات الحرف' : 'Shop craft supplies'}</Link>
          </div>
          <small>{branch === 'KWT' ? (isArabic ? 'نعرض توفر وأسعار الكويت' : 'Showing Kuwait availability and KWD prices') : (isArabic ? 'نعرض توفر وأسعار السعودية' : 'Showing Saudi availability and SAR prices')}</small>
        </div>
        {featured && (
          <Link href={`/workshops/${featured.slug}?market=${branch}`} className="featured-workshop">
            <div className="featured-image" style={featured.coverImage ? { backgroundImage: `url(${featured.coverImage})` } : undefined}>
              {!featured.coverImage && <Sparkles size={42} aria-hidden="true" />}
              <span>{isArabic ? 'الأقرب موعداً' : 'Next available'}</span>
            </div>
            <div className="featured-copy">
              <h2>{getLocalizedName(featured.name, locale)}</h2>
              <div><CalendarDays size={15} /> {formatDate(featured.date_from, locale)}</div>
              {featured.location && <div><MapPin size={15} /> {featured.location}</div>}
              <strong>{featured.minPrice !== undefined ? `${isArabic ? 'من ' : 'From '}${formatCurrency(featured.minPrice, featured.currency, locale)}` : (isArabic ? 'اعرض الخيارات' : 'View options')}</strong>
            </div>
          </Link>
        )}
      </section>

      <section className="home-section" aria-labelledby="upcoming-title">
        <div className="section-heading">
          <div><span className="eyebrow">{isArabic ? 'متاح قريباً' : 'Available soon'}</span><h2 id="upcoming-title">{isArabic ? 'اختر ما ستصنعه' : 'Choose what you’ll make'}</h2></div>
          <Link href="/workshops">{isArabic ? 'عرض الكل' : 'View all'} <ArrowRight size={15} /></Link>
        </div>
        {loading ? <div className="workshop-status">{isArabic ? 'جاري تحميل الورش…' : 'Loading current workshops…'}</div>
          : error ? <div className="workshop-status" role="alert">{isArabic ? 'تعذر تحميل الورش الآن. حاول مرة أخرى.' : 'Workshops are temporarily unavailable. Please try again.'}</div>
          : events.length === 0 ? <div className="workshop-status">{isArabic ? 'لا توجد ورش قادمة حالياً. تحقق مرة أخرى قريباً.' : 'No upcoming workshops are published for this market yet.'}</div>
          : <div className="home-workshop-grid">{events.slice(0, 6).map(event => <HomeWorkshopCard key={event.slug} event={event} locale={locale} market={branch} />)}</div>}
      </section>

      {categories.length > 0 && (
        <section className="home-section" aria-labelledby="craft-title">
          <div className="section-heading"><div><span className="eyebrow">{isArabic ? 'استكشف' : 'Explore'}</span><h2 id="craft-title">{isArabic ? 'تسوق حسب الحرفة' : 'Browse by craft'}</h2></div></div>
          <div className="craft-links">{categories.map(category => <Link key={category} href={`/workshops?category=${encodeURIComponent(category)}`}>{category}<ArrowRight size={16} /></Link>)}</div>
        </section>
      )}

      <section className="journey-band" aria-label={isArabic ? 'رحلتك الإبداعية' : 'Your creative journey'}>
        <div><Users /><h2>{isArabic ? 'اصنعها معنا' : 'Make it with us'}</h2><p>{isArabic ? 'اختر ورشة مناسبة لمستواك وموعدك.' : 'Choose a workshop that fits your level and schedule.'}</p></div>
        <div><Package /><h2>{isArabic ? 'واصلها في المنزل' : 'Continue at home'}</h2><p>{isArabic ? 'اعثر على الأدوات والمواد المرتبطة بتجربتك.' : 'Find the tools and materials connected to your experience.'}</p></div>
        <div><Sparkles /><h2>{isArabic ? 'عد للمستوى التالي' : 'Return for the next level'}</h2><p>{isArabic ? 'طوّر مهارتك مع تجربة جديدة.' : 'Build your skills with your next creative experience.'}</p></div>
      </section>
    </main>
  );
}

function HomeWorkshopCard({ event, locale, market }: { event: PretixEvent; locale: string; market: 'KWT' | 'KSA' }) {
  return (
    <Link href={`/workshops/${event.slug}?market=${market}`} className="home-workshop-card" onClick={() => track('workshop_viewed', { market, workshop_id: event.slug, currency: event.currency })}>
      <div className="card-image" style={event.coverImage ? { backgroundImage: `url(${event.coverImage})` } : undefined}>{!event.coverImage && <Sparkles size={28} />}</div>
      <div className="card-copy">
        <h3>{getLocalizedName(event.name, locale)}</h3>
        <p><CalendarDays size={14} /> {formatDate(event.date_from, locale)}</p>
        {event.location && <p><MapPin size={14} /> {event.location}</p>}
        <div>{event.skillLevel && <span>{event.skillLevel}</span>}<strong>{event.minPrice !== undefined ? formatCurrency(event.minPrice, event.currency, locale) : (locale === 'ar' ? 'التفاصيل' : 'Details')}</strong></div>
      </div>
    </Link>
  );
}
