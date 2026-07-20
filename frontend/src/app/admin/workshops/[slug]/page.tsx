'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Calendar } from 'lucide-react';
import { COLORS } from '@/lib/theme';


interface TicketType {
  id: number;
  name: string;
  price: string;
  quota: string;
}

export default function EditWorkshopPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    dateFrom: '',
    timeFrom: '',
    dateTo: '',
    timeTo: '',
    duration: '',
    instructorName: '',
    instructorExperience: '',
    syllabus: '',
    location: 'Riyadh',
    category: 'workshop',
    coverImage: '',
    status: 'draft',
  });

  const [tickets, setTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    if (!slug) return;

    async function loadEvent() {
      try {
        const res = await fetch(`/api/admin/events/${slug}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        const event = data.event;
        const items = data.items || [];

        let parsedMeta: any = {};
        try {
          const descStr = typeof event.description === 'string' ? event.description : (event.description?.en || event.description?.ar || '');
          if (descStr.trim().startsWith('{')) {
            parsedMeta = JSON.parse(descStr);
          } else {
            parsedMeta.description = descStr;
          }
        } catch (e) {
          // ignore
        }

        const dateFromObj = new Date(event.date_from);
        const dateFrom = dateFromObj.toISOString().split('T')[0];
        const timeFrom = dateFromObj.toISOString().split('T')[1].substring(0, 5);

        let dateTo = '';
        let timeTo = '';
        if (event.date_to) {
          const dateToObj = new Date(event.date_to);
          dateTo = dateToObj.toISOString().split('T')[0];
          timeTo = dateToObj.toISOString().split('T')[1].substring(0, 5);
        }

        const locationStr = typeof event.location === 'string' ? event.location : (event.location?.en || event.location?.ar || 'Riyadh');
        const nameStr = typeof event.name === 'string' ? event.name : (event.name?.en || event.name?.ar || '');

        setFormData(prev => ({
          ...prev,
          name: nameStr,
          slug: event.slug,
          status: event.live ? 'live' : 'draft',
          dateFrom,
          timeFrom,
          dateTo,
          timeTo,
          location: locationStr,
          description: parsedMeta.description || '',
          duration: parsedMeta.duration || '',
          instructorName: parsedMeta.instructorName || '',
          instructorExperience: parsedMeta.instructorExperience || '',
          syllabus: Array.isArray(parsedMeta.syllabus) ? parsedMeta.syllabus.join('\n') : (parsedMeta.syllabus || ''),
          coverImage: parsedMeta.coverImage || '',
        }));

        if (items.length > 0) {
          setTickets(items.map((item: any) => ({
            id: item.id,
            name: typeof item.name === 'string' ? item.name : (item.name?.en || item.name?.ar || ''),
            price: item.default_price,
            quota: '' // Quota handling requires deeper Pretix logic, hard to extract easily without quota endpoints
          })));
        } else {
          setTickets([{ id: 1, name: 'General Admission', price: '150', quota: '10' }]);
        }

      } catch (err) {
        console.error('Error loading event:', err);
      } finally {
        setFetching(false);
      }
    }

    loadEvent();
  }, [slug]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    const newId = Math.max(...tickets.map(t => t.id), 0) + 1;
    setTickets([...tickets, { id: newId, name: '', price: '', quota: '' }]);
  };

  const removeTicketType = (id: number) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const updateTicket = (id: number, field: keyof TicketType, value: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tickets,
      };

      const res = await fetch(`/api/admin/events/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update workshop');
      }

      router.push('/admin/workshops');
    } catch (err: any) {
      console.error('Error updating workshop:', err);
      alert('Error updating workshop: ' + err.message);
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading workshop...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: COLORS.sand,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: COLORS.bark,
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.bark,
            }}>
              Create Workshop
            </h2>
            <p style={{ color: COLORS.smoke, fontSize: 14, marginTop: 4 }}>
              Add a new workshop event
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: COLORS.sand,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.bark,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: loading ? '#9CA3AF' : `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
              color: 'white',
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(200,98,42,0.3)',
            }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Publish Workshop'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
        }}>
          {/* Main Content */}
          <div>
            {/* Basic Info */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.bark,
                marginBottom: 20,
              }}>
                Basic Information
              </h3>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  Workshop Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="e.g., Glass Fusing Masterclass"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.bark,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="auto-generated-from-name"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.smoke,
                    outline: 'none',
                  }}
                />
                <p style={{ fontSize: 12, color: COLORS.smoke, marginTop: 6 }}>
                  yadawi.com/workshops/{formData.slug || 'your-workshop'}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  placeholder="Describe your workshop..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.bark,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.bark,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Date & Location */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.bark,
                marginBottom: 20,
              }}>
                Date & Location
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${COLORS.sand}`,
                      background: COLORS.sand,
                      fontSize: 15,
                      color: COLORS.bark,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${COLORS.sand}`,
                      background: COLORS.sand,
                      fontSize: 15,
                      color: COLORS.bark,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.bark,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Riyadh">Riyadh, Saudi Arabia</option>
                  <option value="Kuwait">Kuwait City, Kuwait</option>
                  <option value="Jeddah">Jeddah, Saudi Arabia</option>
                  <option value="Doha">Doha, Qatar</option>
                </select>
              </div>
            </div>

            {/* Additional Details */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.bark,
                marginBottom: 20,
              }}>
                Workshop Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 3 hours"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${COLORS.sand}`,
                      background: COLORS.sand,
                      fontSize: 15,
                      color: COLORS.bark,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => handleInputChange('instructorName', e.target.value)}
                    placeholder="e.g., Sara Al-Rashidi"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${COLORS.sand}`,
                      background: COLORS.sand,
                      fontSize: 15,
                      color: COLORS.bark,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  Instructor Experience / Title
                </label>
                <input
                  type="text"
                  value={formData.instructorExperience}
                  onChange={(e) => handleInputChange('instructorExperience', e.target.value)}
                  placeholder="e.g., Master Glass Artist · 12 yrs experience"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.bark,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>
                  What You'll Learn (one per line)
                </label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => handleInputChange('syllabus', e.target.value)}
                  rows={4}
                  placeholder="Foundational techniques...&#10;Safety practices..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `2px solid ${COLORS.sand}`,
                    background: COLORS.sand,
                    fontSize: 15,
                    color: COLORS.bark,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
            {/* Ticket Types */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.bark,
                }}>
                  Ticket Types
                </h3>
                <button
                  type="button"
                  onClick={addTicketType}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: COLORS.terracottaLight,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.terracotta,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                  Add Ticket
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr auto',
                      gap: 12,
                      padding: 16,
                      background: COLORS.sand,
                      borderRadius: 12,
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COLORS.smoke, marginBottom: 6, textTransform: 'uppercase' }}>
                        Ticket Name
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                        placeholder="e.g., General Admission"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'white',
                          fontSize: 14,
                          color: COLORS.bark,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COLORS.smoke, marginBottom: 6, textTransform: 'uppercase' }}>
                        Price (SAR)
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => updateTicket(ticket.id, 'price', e.target.value)}
                        placeholder="150"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'white',
                          fontSize: 14,
                          color: COLORS.bark,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: COLORS.smoke, marginBottom: 6, textTransform: 'uppercase' }}>
                        Quota
                      </label>
                      <input
                        type="number"
                        value={ticket.quota}
                        onChange={(e) => updateTicket(ticket.id, 'quota', e.target.value)}
                        placeholder="10"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'white',
                          fontSize: 14,
                          color: COLORS.bark,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => removeTicketType(ticket.id)}
                        disabled={tickets.length === 1}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: tickets.length === 1 ? COLORS.sand : COLORS.dangerLight,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: tickets.length === 1 ? 'not-allowed' : 'pointer',
                          color: tickets.length === 1 ? COLORS.smoke : COLORS.danger,
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Status */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.bark,
                marginBottom: 20,
              }}>
                Status
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: formData.status === 'draft' ? COLORS.terracottaLight : 'transparent',
                  border: `2px solid ${formData.status === 'draft' ? COLORS.terracotta : 'transparent'}`,
                  cursor: 'pointer',
                }}>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{ accentColor: COLORS.terracotta }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.bark, fontSize: 14 }}>Draft</div>
                    <div style={{ fontSize: 12, color: COLORS.smoke }}>Save and edit later</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: formData.status === 'live' ? COLORS.success + '10' : 'transparent',
                  border: `2px solid ${formData.status === 'live' ? COLORS.success : 'transparent'}`,
                  cursor: 'pointer',
                }}>
                  <input
                    type="radio"
                    name="status"
                    value="live"
                    checked={formData.status === 'live'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{ accentColor: COLORS.success }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.bark, fontSize: 14 }}>Live</div>
                    <div style={{ fontSize: 12, color: COLORS.smoke }}>Publish immediately</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.bark,
                marginBottom: 20,
              }}>
                Preview
              </h3>

              <div style={{
                padding: 20,
                background: `linear-gradient(135deg, #7A4A2E, ${COLORS.terracotta})`,
                borderRadius: 12,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
                  {formData.name || 'Workshop Name'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
                  {formData.dateFrom ? new Date(formData.dateFrom).toLocaleDateString() : 'Date not set'}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 12, background: COLORS.sand, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: COLORS.smoke, fontSize: 13 }}>Tickets:</span>
                  <span style={{ fontWeight: 600, color: COLORS.bark }}>{tickets.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: COLORS.smoke, fontSize: 13 }}>From:</span>
                  <span style={{ fontWeight: 700, color: COLORS.terracotta }}>
                    {tickets.length > 0 && tickets[0].price ? `${tickets[0].price} SAR` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
