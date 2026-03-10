'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useBranch } from '@/lib/branch';
import { Award, Flame, Zap, Sparkles, Gem } from 'lucide-react';
import { formatDate, formatCurrency, getLocalizedName } from '@/lib/utils';
import type { PretixEvent } from '@/types/pretix';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame: Flame,
  Zap: Zap,
  Sparkles: Sparkles,
  Award: Award,
  Gem: Gem,
};

const categories = [
  { label: 'All', icon: '🏠' },
  { label: 'Glass', icon: '🔵' },
  { label: 'Jewelry', icon: '💎' },
  { label: 'Clay', icon: '🏺' },
  { label: 'Textile', icon: '🧶' },
  { label: 'Wood', icon: '🪵' },
];

const features = [
  { icon: '🏺', title: 'Expert Artisans', desc: 'Learn from skilled professionals' },
  { icon: '🤝', title: 'Community', desc: 'Connect with fellow makers' },
  { icon: '📦', title: 'Quality Materials', desc: 'Premium tools & supplies' },
];

interface EventWithPrice extends PretixEvent {
  minPrice?: number;
}

export function HomePage() {
  const { t, locale } = useTranslation();
  const { branch } = useBranch();
  const [activeCat, setActiveCat] = useState(0);
  const [events, setEvents] = useState<EventWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/pretix/events?debug=1');
        const data = await res.json();
        if (!res.ok) {
          console.error('Home API debug payload:', data);
          throw new Error(data.error || 'Failed to fetch');
        }
        setEvents(data.results || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  /** Filter by the globally-selected branch */
  const displayEvents = events.filter((e) => {
    if (branch === 'KWT') return e.organizer === 'yadawi';
    return e.organizer === 'yadawi-sa';
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      {/* HERO */}
      <div style={{
        margin: '0 20px 20px',
        borderRadius: 24,
        background: 'linear-gradient(135deg, #3D2B1A 0%, #7A4A2E 50%, #C8622A 100%)',
        padding: '28px 24px 24px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
      }}>
        <div style={{
          position: 'absolute',
          right: -20,
          top: -20,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.3) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 20,
            padding: '4px 10px',
            fontSize: 10,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            ✦ Featured This Week
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.2,
            marginBottom: 8,
          }}>
            Glass Fusing<br />Masterclass
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
            marginBottom: 20,
          }}>
            Transform molten glass into wearable art.<br />Limited spots — April 1, Riyadh.
          </div>
          <Link href={`/workshops/${displayEvents[0]?.slug || 'glass-fusing'}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#F5A623',
            color: '#3D2B1A',
            borderRadius: 14,
            padding: '11px 20px',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
          }}>
            Explore Workshop →
          </Link>
        </div>
        <div style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          fontSize: 60,
          opacity: 0.15,
        }}>
          🔥
        </div>
      </div>

      {/* SECTION HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 20px 14px',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: '#3D2B1A',
        }}>
          Browse
        </div>
      </div>

      {/* CATEGORY SCROLL */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '0 20px 20px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {categories.map((cat, i) => (
          <div
            key={i}
            onClick={() => setActiveCat(i)}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              transition: 'all 0.2s',
              background: activeCat === i ? '#C8622A' : '#F2EAD8',
              boxShadow: activeCat === i ? '0 8px 20px rgba(200,98,42,0.35)' : 'none',
            }}>
              {cat.icon}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: activeCat === i ? '#C8622A' : '#8B7B6E',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
            }}>
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* UPCOMING EVENTS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 20px 14px',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: '#3D2B1A',
        }}>
          Upcoming Events
        </div>
        <Link href="/workshops" style={{
          fontSize: 12,
          color: '#C8622A',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          View all
        </Link>
      </div>

      <div style={{
        display: 'flex',
        gap: 14,
        padding: '0 20px 24px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading...</div>
        ) : displayEvents.slice(0, 4).map((event, idx) => {
          const eventName = getLocalizedName(event.name, locale);
          const IconComponent = icons[Object.keys(icons)[idx % 4]];
          const price = event.minPrice ? formatCurrency(event.minPrice, event.currency) : 'View Details';

          return (
            <Link
              key={event.slug}
              href={`/workshops/${event.slug}`}
              style={{
                flexShrink: 0,
                width: 240,
                borderRadius: 20,
                background: 'white',
                overflow: 'hidden',
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(61,43,26,0.08)',
              }}
            >
              <div style={{
                height: 120,
                background: event.coverImage
                  ? `url(${event.coverImage}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${['#7A4A2E', '#C8622A', '#E8873A', '#4FC3F7'][idx % 4]} 0%, ${['#C8622A', '#E8873A', '#FFB74D', '#81D4FA'][idx % 4]} 100%)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
              }}>
                {!event.coverImage && ['🔥', '✨', '⚡', '🏆'][idx % 4]}
                {/* Workshop label */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: '#F5A623',
                  color: '#3D2B1A',
                  borderRadius: 8,
                  padding: '3px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Workshop
                </div>
                {/* Branch flag badge */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(255,255,255,0.92)',
                  borderRadius: 8,
                  padding: '4px 6px',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img src={event.organizer === 'yadawi' ? 'https://flagcdn.com/w20/kw.png' : 'https://flagcdn.com/w20/sa.png'} alt={event.organizer === 'yadawi' ? 'Kuwait' : 'Saudi Arabia'} style={{ width: 14, height: 'auto', borderRadius: 2 }} />
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  borderRadius: 10,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}>
                  {price}
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#3D2B1A',
                  marginBottom: 6,
                }}>
                  {eventName}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: '#8B7B6E',
                  marginBottom: 3,
                }}>
                  📅 {formatDate(event.date_from, locale)}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: '#8B7B6E',
                  marginBottom: 12,
                }}>
                  📍 {event.location || 'Riyadh'}
                </div>
                <button style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '9px',
                  background: 'linear-gradient(135deg, #C8622A, #E8873A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  letterSpacing: 0.3,
                }}>
                  View & Enroll →
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* FEATURED GRID */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 20px 14px',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: '#3D2B1A',
        }}>
          Popular Classes
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        padding: '0 20px 24px',
      }}>
        {displayEvents.slice(0, 4).map((event, idx) => {
          const eventName = getLocalizedName(event.name, locale);
          const price = event.minPrice ? formatCurrency(event.minPrice, event.currency) : '';

          return (
            <Link
              key={`feat-${event.slug}`}
              href={`/workshops/${event.slug}`}
              style={{
                borderRadius: 18,
                background: 'white',
                overflow: 'hidden',
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(61,43,26,0.07)',
              }}
            >
              <div style={{
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                position: 'relative',
                background: event.coverImage
                  ? `url(${event.coverImage}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${['#7EB8D0', '#C4956A', '#FF7043', '#8D6E63'][idx % 4]} 0%, ${['#A8D4E0', '#E8B88A', '#FF9800', '#BCAAA4'][idx % 4]} 100%)`,
              }}>
                {!event.coverImage && ['🔵', '✨', '⚡', '🏆'][idx % 4]}
                {/* Branch flag */}
                <div style={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 6,
                  padding: '3px 5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img src={event.organizer === 'yadawi' ? 'https://flagcdn.com/w20/kw.png' : 'https://flagcdn.com/w20/sa.png'} alt={event.organizer === 'yadawi' ? 'Kuwait' : 'Saudi Arabia'} style={{ width: 12, height: 'auto', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{
                  fontSize: 9,
                  color: '#8B7B6E',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}>
                  Workshop
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#3D2B1A',
                  marginBottom: 3,
                  lineHeight: 1.3,
                }}>
                  {eventName}
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#C8622A',
                  fontWeight: 700,
                }}>
                  {price}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* MEMBERSHIP BANNER */}
      <div style={{
        margin: '0 20px 24px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #3D2B1A 0%, #5D3A22 100%)',
        padding: '22px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          right: -10,
          top: -20,
          fontSize: 120,
          color: 'rgba(212,148,26,0.1)',
        }}>
          ◆
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 900,
          color: 'white',
          marginBottom: 6,
        }}>
          Torch Time<br />Membership ✦
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          Unlimited studio access, exclusive workshops, and priority booking for one monthly fee.
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}>
          {['∞ Studio Access', 'Early Booking', 'Member Pricing', 'Guest Passes'].map(perk => (
            <div key={perk} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: '4px 10px',
              fontSize: 10,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
            }}>
              {perk}
            </div>
          ))}
        </div>
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#F5A623',
          color: '#3D2B1A',
          borderRadius: 12,
          padding: '10px 18px',
          fontWeight: 700,
          fontSize: 12,
          border: 'none',
          cursor: 'pointer',
        }}>
          From 200 SAR/mo →
        </button>
      </div>

      {/* WHY US */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 20px 14px',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: '#3D2B1A',
        }}>
          Why Yadawi?
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
        padding: '0 20px 24px',
      }}>
        {features.map((feature) => (
          <div key={feature.title} style={{
            background: '#F2EAD8',
            borderRadius: 16,
            padding: '14px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{feature.icon}</div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#3D2B1A',
              marginBottom: 4,
              lineHeight: 1.2,
            }}>
              {feature.title}
            </div>
            <div style={{
              fontSize: 10,
              color: '#8B7B6E',
              lineHeight: 1.4,
            }}>
              {feature.desc}
            </div>
          </div>
        ))}
      </div>

      {/* NEWSLETTER */}
      <div style={{
        margin: '0 20px 24px',
        background: 'linear-gradient(135deg, #E8873A, #F5A623)',
        borderRadius: 20,
        padding: '22px 20px',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          fontWeight: 700,
          color: '#3D2B1A',
          marginBottom: 6,
        }}>
          Stay Updated ✉️
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(61,43,26,0.7)',
          marginBottom: 14,
        }}>
          New workshops & events — straight to your inbox.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="your@email.com"
            style={{
              flex: 1,
              background: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '10px 14px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              outline: 'none',
              color: '#3D2B1A',
            }}
          />
          <button style={{
            background: '#3D2B1A',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            Join
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        background: '#3D2B1A',
        padding: '24px 20px 32px',
      }}>
        <img
          src="/logo.png"
          alt="Yadawi"
          style={{ height: 28, width: 'auto', display: 'block', filter: 'invert(1) brightness(2)', marginBottom: 6 }}
        />
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 20,
          fontStyle: 'italic',
        }}>
          Craft Something Beautiful
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px 20px',
          marginBottom: 20,
        }}>
          {['Account', 'Workshops', 'Membership', 'Shop', 'Events', 'About Us', 'Contact', 'FAQs'].map(link => (
            <div key={link} style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.65)',
              cursor: 'pointer',
              padding: '2px 0',
            }}>
              {link}
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.3)',
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          Yadawi © 2026 · Kuwait & Saudi Arabia
        </div>
      </footer>

      <div style={{ height: 100 }} />
    </div>
  );
}
