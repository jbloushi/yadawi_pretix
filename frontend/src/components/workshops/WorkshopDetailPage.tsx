'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useBranch } from '@/lib/branch';
import { track } from '@/lib/analytics';
import { useCart } from '@/lib/cart';
import { Calendar, MapPin, Clock, Minus, Plus, Check, Loader2, ArrowRight, Sparkles, Flame, Zap, Award, ShoppingCart, Star, Share2 } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getLocalizedName } from '@/lib/utils';
import type { PretixEvent, PretixItem } from '@/types/pretix';

const icons = [Flame, Zap, Sparkles, Award];
const verifiedReviews: Array<{ name: string; text: string; stars: number }> = [];

export function WorkshopDetailPage({ slug, initialMarket }: { slug: string; initialMarket?: 'KWT' | 'KSA' }) {
  const { t, locale } = useTranslation();
  const { branch, setBranch } = useBranch();
  const effectiveMarket = initialMarket || branch;
  const router = useRouter();
  const { addItem } = useCart();
  const [event, setEvent] = useState<PretixEvent | null>(null);
  const [items, setItems] = useState<PretixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [eventDetails, setEventDetails] = useState({
    duration: '',
    instructorName: '',
    instructorExperience: '',
    syllabus: [] as string[],
    description: '',
    coverImage: ''
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setEvent(null);
      setItems([]);
      setEventDetails({ duration: '', instructorName: '', instructorExperience: '', syllabus: [], description: '', coverImage: '' });
      try {
        const eventsRes = await fetch(`/api/pretix/events?market=${effectiveMarket}`);
        const eventsData = await eventsRes.json();
        if (!eventsRes.ok) {
          console.error('Workshop detail API debug payload:', eventsData);
          throw new Error(eventsData.error || 'Failed to load events');
        }
        const foundEvent = (eventsData.results || []).find((e: PretixEvent) => e.slug === slug);

        if (!foundEvent) {
          throw new Error('Event not found');
        }

        setEvent(foundEvent);
        track('workshop_viewed', { market: effectiveMarket, workshop_id: foundEvent.slug, currency: foundEvent.currency });

        // Parse extended details from description if it is JSON
        try {
          // getLocalizedString is technically not here, we can just grab the stringified JSON
          const descObj = foundEvent.description;
          const descStr = typeof descObj === 'string' ? descObj : (descObj?.en || descObj?.ar || '');
          if (descStr.trim().startsWith('{')) {
            const parsed = JSON.parse(descStr);
            setEventDetails(prev => ({
              ...prev,
              description: parsed.description || parsed.about || '',
              duration: parsed.duration || '',
              instructorName: parsed.instructorName || parsed.instructor || '',
              instructorExperience: parsed.instructorExperience || '',
              syllabus: Array.isArray(parsed.syllabus) ? parsed.syllabus : (parsed.syllabus ? parsed.syllabus.split('\n') : []),
            }));
          } else if (descStr) {
            setEventDetails(prev => ({ ...prev, description: descStr }));
          }
        } catch (e) {
          // It was just a normal string description or missing
        }

        const itemsRes = await fetch(`/api/pretix/events/${slug}/items?organizer=${foundEvent.organizer}`);
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData.results || []);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Workshop not found');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, effectiveMarket]);

  useEffect(() => {
    if (initialMarket && initialMarket !== branch) setBranch(initialMarket);
  }, [initialMarket, branch, setBranch]);

  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev => {
      // If clicking the already selected item, deselect it
      if (prev[itemId]) return {};
      // Otherwise select it with quantity 1
      return { [itemId]: 1 };
    });
    // Reset modal quantity when selecting a new ticket
    setModalQuantity(1);
  };

  const selectedPriceInfo = Object.keys(selectedItems).length > 0
    ? parseFloat(items.find(i => i.id === parseInt(Object.keys(selectedItems)[0]))?.default_price || items.find(i => i.id === parseInt(Object.keys(selectedItems)[0]))?.price || '0')
    : 0;

  const totalAmount = selectedPriceInfo * modalQuantity;

  const hasSelectedItems = Object.keys(selectedItems).length > 0;

  const handleAddToCart = () => {
    if (!event || items.length === 0) return;

    const firstItemId = Object.keys(selectedItems)[0];
    if (!firstItemId) return;

    const item = items.find(i => i.id === parseInt(firstItemId));
    if (!item) return;

    const quantity = selectedItems[parseInt(firstItemId)];
    const eventName = getLocalizedName(event.name, locale);
    const itemName = getLocalizedName(item.name, locale);

    addItem({
      eventSlug: event.slug,
      organizerSlug: event.organizer,
      eventName,
      itemId: parseInt(firstItemId),
      itemName: itemName || 'Standard',
      price: parseFloat(item.default_price || item.price || '0'),
      quantity: modalQuantity,
      currency: event.currency || (event.organizer === 'yadawi' ? 'KWD' : 'SAR'),
      date: event.date_from || '',
    });

    setAddedToCart(true);
    setSelectedItems({});
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('addToCart'));
    }
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAF6F0' }}>
        <div style={{ width: 32, height: 32, border: '4px solid #F2EAD8', borderTopColor: '#C8622A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ textAlign: 'center', padding: 48, background: '#FAF6F0', minHeight: '100vh' }}>
        <p style={{ color: '#8B7B6E' }}>{error || 'Workshop not found'}</p>
        <Link href="/workshops" style={{ fontWeight: 700, marginTop: 16, display: 'inline-block', color: '#C8622A', textDecoration: 'none' }}>
          ← Back to workshops
        </Link>
      </div>
    );
  }

  const eventName = getLocalizedName(event.name, locale);
  const currency = event.currency || 'SAR';
  const tags = [event.category, event.skillLevel, event.ageGroup, event.language].filter(Boolean) as string[];
  const knownAvailability = items.map(item => item.quantity_left).filter((value): value is number => typeof value === 'number');
  const seatsLeft = knownAvailability.length ? knownAvailability.reduce((sum, value) => sum + value, 0) : null;
  const IconComponent = icons[event.id % icons.length];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0' }}>
      {/* DETAIL HERO */}
      <div style={{
        height: 260,
        background: eventDetails.coverImage
          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${eventDetails.coverImage}) center/cover no-repeat`
          : 'linear-gradient(160deg, #7A4A2E 0%, #C8622A 60%, #E8873A 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 80,
        overflow: 'hidden',
      }}>
        {!eventDetails.coverImage && <span style={{ opacity: 0.9 }}>🔥</span>}

        <Link href="/workshops" style={{
          position: 'absolute',
          top: 50,
          left: 16,
          width: 36,
          height: 36,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          color: 'white',
          fontSize: 18,
          textDecoration: 'none',
        }}>
          ←
        </Link>

        <button style={{
          position: 'absolute',
          top: 50,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          color: 'white',
          fontSize: 16,
        }}>
          ↗
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 20 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            background: 'rgba(200,98,42,0.12)',
            color: '#C8622A',
          }}>
            Workshop
          </span>
          <span style={{
            display: event.skillLevel ? 'inline-flex' : 'none',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            background: 'rgba(212,148,26,0.12)',
            color: '#D4941A',
          }}>
            {event.skillLevel}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 900,
          color: '#3D2B1A',
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          {eventName}
        </h1>

        {/* Rating */}
        <div aria-hidden="true" style={{ display: 'none' }}>
          <span style={{ color: '#F5A623', fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3D2B1A' }}>4.9</span>
          <span style={{ fontSize: 12, color: '#8B7B6E' }}>(42 reviews)</span>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#F2EAD8', borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 9, color: '#8B7B6E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>📅 Date</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3D2B1A' }}>{formatDate(event.date_from, locale)}</div>
          </div>
          <div style={{ background: '#F2EAD8', borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 9, color: '#8B7B6E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>📍 Location</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3D2B1A' }}>{event.location || 'Location to be confirmed'}</div>
          </div>
          <div style={{ background: '#F2EAD8', borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 9, color: '#8B7B6E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>⏱ Duration</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3D2B1A' }}>{eventDetails.duration || 'Not specified'}</div>
          </div>
          <div style={{ background: '#F2EAD8', borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 9, color: '#8B7B6E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>👥 Spots Left</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C8622A' }}>{seatsLeft === null ? 'Check ticket availability' : `${seatsLeft} available`}</div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: '#F2EAD8',
              color: '#8B7B6E',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* About */}
        <div style={{ marginBottom: eventDetails.description ? 20 : 0, display: eventDetails.description ? 'block' : 'none' }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#3D2B1A',
            marginBottom: 10,
          }}>
            About This Workshop
          </h3>
          <p style={{ fontSize: 13, color: '#8B7B6E', lineHeight: 1.7, marginBottom: 20 }}>
            {eventDetails.description}
          </p>
        </div>

        {/* What You'll Learn */}
        <div style={{ marginBottom: eventDetails.syllabus.length ? 20 : 0, display: eventDetails.syllabus.length ? 'block' : 'none' }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#3D2B1A',
            marginBottom: 10,
          }}>
            What You'll Learn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {eventDetails.syllabus.map((item) => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: 'rgba(200,98,42,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  <span style={{ color: '#C8622A', fontSize: 12 }}>✓</span>
                </div>
                <span style={{ fontSize: 13, color: '#8B7B6E', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor */}
        <div style={{ marginBottom: eventDetails.instructorName ? 20 : 0, display: eventDetails.instructorName ? 'block' : 'none' }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#3D2B1A',
            marginBottom: 10,
          }}>
            Your Instructor
          </h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#F2EAD8', borderRadius: 16, padding: 14 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #C8622A, #E8873A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}>
              👩‍🎨
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3D2B1A', marginBottom: 2 }}>{eventDetails.instructorName}</div>
              <div style={{ fontSize: 11, color: '#8B7B6E', marginBottom: 6 }}>{eventDetails.instructorExperience}</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div aria-hidden="true" style={{ display: 'none' }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#3D2B1A',
            marginBottom: 10,
          }}>
            Reviews
          </h3>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 20 }}>
            {verifiedReviews.map((r, i) => (
              <div key={i} style={{
                flexShrink: 0,
                width: 200,
                background: '#F2EAD8',
                borderRadius: 16,
                padding: 14,
              }}>
                <div style={{ color: '#F5A623', fontSize: 12, marginBottom: 6 }}>{"★".repeat(r.stars)}</div>
                <div style={{ fontSize: 11, color: '#8B7B6E', lineHeight: 1.5, marginBottom: 8 }}>"{r.text}"</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3D2B1A' }}>— {r.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#3D2B1A',
            marginBottom: 14,
          }}>
            Select Tickets
          </h3>

          {items.length === 0 ? (
            <p style={{ color: '#8B7B6E' }}>No tickets available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => {
                const itemName = getLocalizedName(item.name, locale);
                const price = parseFloat(item.default_price || item.price || '0');
                const isSelected = selectedItems[item.id] > 0;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => item.quantity_left !== 0 && handleItemSelect(item.id)}
                    aria-pressed={isSelected}
                    disabled={item.quantity_left === 0}
                    style={{
                      width: '100%',
                      textAlign: 'start',
                      border: `2px solid ${isSelected ? '#C8622A' : '#F2EAD8'}`,
                      borderRadius: 16,
                      padding: 16,
                      background: isSelected ? 'rgba(200,98,42,0.03)' : 'white',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 style={{ fontWeight: 700, color: '#3D2B1A' }}>
                            {itemName || 'Standard Ticket'}
                          </h4>
                          {isSelected && <Check size={16} color="#C8622A" />}
                        </div>
                        {(item.description || item.quantity_left === 0) && <p style={{ fontSize: 12, marginTop: 4, color: '#8B7B6E' }}>{item.quantity_left === 0 ? 'Sold out' : item.description}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#C8622A' }}>
                          {formatCurrency(price, currency, locale)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* STICKY BOOK */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        padding: '14px 20px 20px',
        background: 'rgba(250,246,240,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(61,43,26,0.08)',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#3D2B1A' }}>
            {formatCurrency(totalAmount, currency)}
          </div>
          <div style={{ fontSize: 10, color: '#8B7B6E' }}>per person</div>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          disabled={!hasSelectedItems}
          style={{
            flex: 2,
            background: hasSelectedItems ? 'linear-gradient(135deg, #C8622A, #E8873A)' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: 16,
            padding: 14,
            fontWeight: 700,
            fontSize: 14,
            cursor: hasSelectedItems ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {hasSelectedItems ? `Enroll Now →` : 'Select a ticket'}
        </button>
      </div>

      {/* ENROLLMENT MODAL */}
      {showEnrollModal && (
        <div
          onClick={() => setShowEnrollModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(26,14,7,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FAF6F0',
              borderRadius: '28px 28px 0 0',
              width: '100%',
              maxHeight: '85%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: 'rgba(61,43,26,0.2)',
              margin: '14px auto 8px',
            }} />

            {/* Close button */}
            <button
              onClick={() => setShowEnrollModal(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#F2EAD8',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: '#8B7B6E',
              }}
            >
              ✕
            </button>

            <div style={{ padding: '0 20px 20px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#3D2B1A',
                marginBottom: 16
              }}>
                {locale === 'ar' ? 'تأكيد التسجيل' : 'Confirm Enrollment'}
              </h2>

              {/* Workshop Summary */}
              <div style={{ background: '#F2EAD8', borderRadius: 16, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#3D2B1A', fontSize: 15, marginBottom: 4 }}>{eventName}</div>
                <div style={{ fontSize: 12, color: '#8B7B6E' }}>
                  📅 {event?.date_from ? new Date(event.date_from).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  {' · '}📍 {event?.location || 'Riyadh'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#C8622A', marginTop: 8, fontFamily: "'Playfair Display', serif" }}>
                  {formatCurrency(totalAmount, currency)}
                </div>
              </div>

              {/* Guest Selector */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#8B7B6E', marginBottom: 4 }}>
                    {locale === 'ar' ? 'عدد الأشخاص' : 'Guests'}
                  </div>
                  <select
                    value={modalQuantity}
                    onChange={(e) => setModalQuantity(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#F2EAD8',
                      border: 'none',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: '#3D2B1A',
                      cursor: 'pointer',
                    }}>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  handleAddToCart();
                  setShowEnrollModal(false);
                  router.push('/cart');
                }}
                style={{
                  margin: 0,
                  width: '100%',
                  marginBottom: 10,
                  background: 'linear-gradient(135deg, #C8622A, #E8873A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 16,
                  padding: 16,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer'
                }}
              >
                {locale === 'ar' ? 'أضف إلى السلة والدفع' : 'Add to Cart & Checkout'}
              </button>

              <button
                onClick={() => setShowEnrollModal(false)}
                style={{
                  width: '100%',
                  background: '#F2EAD8',
                  color: '#3D2B1A',
                  border: 'none',
                  borderRadius: 14,
                  padding: 13,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                {locale === 'ar' ? 'تصفح المزيد' : 'Keep Browsing'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}
