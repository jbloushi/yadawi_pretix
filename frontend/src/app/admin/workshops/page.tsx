'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const COLORS = {
  terracotta: '#C8622A',
  terracottaLight: 'rgba(200, 98, 42, 0.1)',
  bark: '#3D2B1A',
  sand: '#F2EAD8',
  cream: '#FAF6F0',
  smoke: '#8B7B6E',
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
};

interface Workshop {
  id: number;
  slug: string;
  name: string;
  branch: string;        // 'KWT' | 'KSA'
  date_from: string;
  location: string;
  status: 'live' | 'draft' | 'archived';
  total_sold: number;
  total_revenue: number;
  price: number;
}

export default function WorkshopsPage() {
  const { data: session, status } = useSession();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const userRole = (session?.user as any)?.role || 'viewer';
  const userBranch = (session?.user as any)?.branch || 'ALL';

  useEffect(() => {
    if (status === 'loading' || !session?.user?.email) return;

    async function fetchWorkshops() {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('status', filter);
        if (search) params.set('search', search);
        // For ALL-users, pass the manual branch filter
        if (userBranch === 'ALL' && branchFilter !== 'ALL') params.set('branch', branchFilter);

        const res = await fetch(`/api/admin/events?${params.toString()}`, {
          credentials: 'include',
          headers: {
            'x-user-role': userRole,
            'x-user-email': session?.user?.email || '',
            'x-user-branch': userBranch,
          },
        });
        const data = await res.json();

        console.log('Workshops API response:', res.status, data);

        if (data.results) {
          setWorkshops(data.results);
        } else if (data.error) {
          console.error('API Error:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch workshops:', err);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchWorkshops();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filter, search, status, session, userRole, branchFilter]);

  const filteredWorkshops = workshops.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || w.status === filter;
    // Client-side branch filter (only meaningful for ALL users doing manual filter)
    const matchesBranch = userBranch !== 'ALL' || branchFilter === 'ALL' || w.branch === branchFilter;
    return matchesSearch && matchesFilter && matchesBranch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'live': return { bg: COLORS.successLight, color: COLORS.success };
      case 'draft': return { bg: COLORS.terracottaLight, color: COLORS.terracotta };
      case 'archived': return { bg: COLORS.sand, color: COLORS.smoke };
      default: return { bg: COLORS.sand, color: COLORS.smoke };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.bark,
            marginBottom: 8,
          }}>
            Workshops
          </h2>
          <p style={{ color: COLORS.smoke, fontSize: 15 }}>
            Manage your workshop events and tickets
          </p>
        </div>
        <Link href="/admin/workshops/new" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
          color: 'white',
          padding: '12px 24px',
          borderRadius: 12,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
          boxShadow: '0 4px 12px rgba(200,98,42,0.3)',
        }}>
          <Plus size={20} />
          Create Workshop
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'white',
          borderRadius: 12,
          border: `1px solid ${COLORS.sand}`,
          minWidth: 200,
        }}>
          <Search size={20} color={COLORS.smoke} />
          <input
            type="text"
            placeholder="Search workshops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 14,
              color: COLORS.bark,
              width: '100%',
            }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'white',
            borderRadius: 12,
            border: `1px solid ${COLORS.sand}`,
            fontSize: 14,
            color: COLORS.bark,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Status</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        {/* Branch filter — only shown for ALL users */}
        {userBranch === 'ALL' && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'white',
              borderRadius: 12,
              border: `1px solid ${COLORS.sand}`,
              fontSize: 14,
              color: COLORS.bark,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Branches</option>
            <option value="KWT">🇰🇼 Kuwait</option>
            <option value="KSA">🇸🇦 Saudi Arabia</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.sand }}>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Workshop</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Branch</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Tickets</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Revenue</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkshops.map((workshop) => {
                const statusStyle = getStatusStyle(workshop.status);
                // Handle Pretix multi-lingual name objects correctly
                const workshopName = typeof workshop.name === 'string'
                  ? workshop.name
                  : (workshop.name as any)?.en || (workshop.name as any)?.ar || 'Unnamed Workshop';

                // Handle Pretix multi-lingual location objects correctly and null/empty object cases
                let workshopLocation = '';
                if (typeof workshop.location === 'string') {
                  workshopLocation = workshop.location;
                } else if (workshop.location && typeof workshop.location === 'object') {
                  workshopLocation = (workshop.location as any)?.en || (workshop.location as any)?.ar || '';
                }

                return (
                  <tr key={workshop.id} style={{ borderBottom: `1px solid ${COLORS.sand}` }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, color: COLORS.bark }}>{workshopName}</div>
                      <div style={{ fontSize: 12, color: COLORS.smoke }}>{workshop.price} SAR</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: workshop.branch === 'KWT' ? 'rgba(0,100,255,0.08)' : 'rgba(0,150,50,0.08)',
                        color: workshop.branch === 'KWT' ? '#1a56db' : '#057a55',
                      }}>
                        {workshop.branch === 'KWT' ? '🇰🇼 KW' : '🇸🇦 SA'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.bark }}>
                      {new Date(workshop.date_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.bark }}>{workshopLocation || '-'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: COLORS.bark }}>{workshop.total_sold}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: COLORS.success }}>{workshop.total_revenue} SAR</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}>
                        {workshop.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <Link href={`/workshops/${workshop.slug}`} target="_blank" style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: COLORS.sand,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: COLORS.smoke,
                          textDecoration: 'none',
                        }}>
                          <Eye size={16} />
                        </Link>
                        <Link href={`/admin/workshops/${workshop.slug}`} style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: COLORS.terracottaLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: COLORS.terracotta,
                          textDecoration: 'none',
                        }}>
                          <Edit size={16} />
                        </Link>
                        <button style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: COLORS.dangerLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: COLORS.danger,
                          border: 'none',
                          cursor: 'pointer',
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
