'use client';

import { useState, useEffect } from 'react';
import { QrCode, Search, Check, X, Users, Camera, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { COLORS } from '@/lib/theme';


interface EventOption {
  slug: string;
  name: string;
  date_from: string;
}

interface Attendee {
  id: number;
  name: string;
  ticket: string;
  status: 'checked_in' | 'pending';
  code: string;
  order_code: string;
  checkin_secret: string;
}

export default function CheckinPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState({ total: 0, checked_in: 0 });
  const [loading, setLoading] = useState(true);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [scanError, setScanError] = useState<string>('');
  const [scannedCode, setScannedCode] = useState('');
  const [manualSearch, setManualSearch] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/admin/events?status=live');
        const data = await res.json();
        
        if (data.results) {
          setEvents(data.results);
          if (data.results.length > 0) {
            setSelectedEvent(data.results[0].slug);
          }
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    
    async function fetchAttendees() {
      setAttendeesLoading(true);
      try {
        const res = await fetch(`/api/admin/events/${selectedEvent}/checkin`);
        const data = await res.json();
        
        if (data.results) {
          setAttendees(data.results);
          setStats(data.stats || { total: data.results.length, checked_in: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch attendees:', err);
      } finally {
        setAttendeesLoading(false);
      }
    }
    
    fetchAttendees();
  }, [selectedEvent]);

  const handleCheckin = async (code: string, attendee?: Attendee) => {
    if (!attendee) {
      const found = attendees.find(a => a.code === code || a.checkin_secret === code);
      if (!found) {
        setScanResult('error');
        setScanError('Ticket not found');
        setTimeout(() => {
          setScanResult(null);
          setScanError('');
          setScannedCode('');
        }, 2000);
        return;
      }
      attendee = found;
    }

    setCheckingIn(true);
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: attendee.id,
          checkin_secret: attendee.checkin_secret,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setScanResult('success');
        setAttendees(prev => prev.map(a => 
          a.id === attendee!.id ? { ...a, status: 'checked_in' as const } : a
        ));
        setStats(prev => ({ ...prev, checked_in: prev.checked_in + 1 }));
      } else if (data.code === 'ALREADY_CHECKED_IN') {
        setScanResult('error');
        setScanError('Already checked in');
      } else {
        setScanResult('error');
        setScanError(data.error || 'Check-in failed');
      }
    } catch (err) {
      setScanResult('error');
      setScanError('Check-in failed');
    } finally {
      setCheckingIn(false);
      setTimeout(() => {
        setScanResult(null);
        setScanError('');
        setScannedCode('');
      }, 2000);
    }
  };

  const filteredAttendees = manualSearch
    ? attendees.filter(a => 
        a.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(manualSearch.toLowerCase()) ||
        a.order_code.toLowerCase().includes(manualSearch.toLowerCase())
      )
    : attendees;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
        <Loader2 size={32} color={COLORS.terracotta} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: COLORS.bark, marginBottom: 8 }}>Check-in</h2>
        <p style={{ color: COLORS.smoke, fontSize: 15 }}>Scan tickets to check in attendees</p>
      </div>

      {/* Event Selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: 'white', fontSize: 15, color: COLORS.bark, outline: 'none', cursor: 'pointer' }}
        >
          {events.map(event => (
            <option key={event.slug} value={event.slug}>
              {event.name} - {new Date(event.date_from).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: COLORS.successLight, borderRadius: 16, padding: 20, textAlign: 'center' }}>
              <Check size={32} color={COLORS.success} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.success, fontFamily: "'Playfair Display', serif" }}>{stats.checked_in}</div>
              <div style={{ fontSize: 13, color: COLORS.smoke }}>Checked In</div>
            </div>
            <div style={{ background: COLORS.sand, borderRadius: 16, padding: 20, textAlign: 'center' }}>
              <Users size={32} color={COLORS.smoke} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.bark, fontFamily: "'Playfair Display', serif" }}>{stats.total}</div>
              <div style={{ fontSize: 13, color: COLORS.smoke }}>Total</div>
            </div>
          </div>

          {/* Scanner */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.bark }}>Scan Ticket</h3>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: COLORS.terracotta, color: 'white', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                <Camera size={16} /> Open Scanner
              </button>
            </div>
            
            <div style={{ 
              padding: 40, 
              background: scanResult === 'success' ? COLORS.successLight : scanResult === 'error' ? COLORS.dangerLight : COLORS.sand, 
              borderRadius: 16, 
              textAlign: 'center',
              border: `2px dashed ${scanResult === 'success' ? COLORS.success : scanResult === 'error' ? COLORS.danger : COLORS.smoke}`,
              marginBottom: 16,
              transition: 'all 0.3s ease'
            }}>
              {checkingIn ? (
                <Loader2 size={48} color={COLORS.terracotta} className="animate-spin" style={{ marginBottom: 12 }} />
              ) : scanResult === 'success' ? (
                <>
                  <Check size={48} color={COLORS.success} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.success }}>Check-in Successful!</div>
                  <div style={{ fontSize: 14, color: COLORS.smoke, marginTop: 4 }}>{scannedCode}</div>
                </>
              ) : scanResult === 'error' ? (
                <>
                  <X size={48} color={COLORS.danger} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.danger }}>{scanError || 'Invalid Ticket'}</div>
                  <div style={{ fontSize: 14, color: COLORS.smoke, marginTop: 4 }}>This ticket has already been used or is invalid</div>
                </>
              ) : (
                <>
                  <QrCode size={48} color={COLORS.smoke} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.bark }}>Ready to Scan</div>
                  <div style={{ fontSize: 13, color: COLORS.smoke, marginTop: 4 }}>Point camera at QR code or enter code manually</div>
                </>
              )}
            </div>

            {/* Manual Entry */}
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                placeholder="Enter ticket code..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckin(manualSearch)}
                style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none' }}
              />
              <button 
                onClick={() => handleCheckin(manualSearch)} 
                disabled={checkingIn}
                style={{ padding: '14px 24px', background: COLORS.terracotta, color: 'white', borderRadius: 12, border: 'none', fontWeight: 600, cursor: checkingIn ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: checkingIn ? 0.7 : 1 }}
              >
                <Search size={18} /> Check
              </button>
            </div>
          </div>

          {/* Attendees List */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.bark, marginBottom: 20 }}>Attendees</h3>
            
            {attendeesLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Loader2 size={24} color={COLORS.terracotta} className="animate-spin" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredAttendees.map((attendee) => (
                  <div key={attendee.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: COLORS.sand, borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: attendee.status === 'checked_in' ? COLORS.successLight : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {attendee.status === 'checked_in' ? <Check size={20} color={COLORS.success} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.smoke }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: COLORS.bark }}>{attendee.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.smoke }}>{attendee.ticket} • {attendee.code}</div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: attendee.status === 'checked_in' ? COLORS.successLight : COLORS.cream, color: attendee.status === 'checked_in' ? COLORS.success : COLORS.smoke }}>
                      {attendee.status === 'checked_in' ? 'Checked In' : 'Pending'}
                    </span>
                  </div>
                ))}
                {filteredAttendees.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: COLORS.smoke }}>
                    No attendees found
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
