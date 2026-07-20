'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  RefreshCw,
  Mail,
  X
} from 'lucide-react';
import { COLORS } from '@/lib/theme';


interface Order {
  id: string;
  code: string;
  branch: string;         // 'KWT' | 'KSA'
  name: string;
  email: string;
  phone: string;
  event_name: string;
  event_slug: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  payment_method: string;
  created_at: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const userRole = (session?.user as any)?.role || 'viewer';
  const userBranch = (session?.user as any)?.branch || 'ALL';
  const [marking, setMarking] = useState<string | null>(null);

  const handleMarkPaid = async (order: Order) => {
    if (marking === order.code) return;
    if (!confirm(`Mark ${order.code} as paid and WhatsApp the customer the invoice + calendar invite?`)) return;
    setMarking(order.code);
    try {
      const res = await fetch('/api/admin/orders/mark-paid', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: order.event_slug, code: order.code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setOrders(prev => prev.map(o => o.code === order.code ? { ...o, status: 'paid' } : o));
        const s = data.sent || {};
        alert(`✅ ${order.code} marked paid.\nSent → invoice: ${!!s.invoice}, calendar: ${!!s.ics}` +
          (data.warning ? `\n⚠️ ${data.warning}` : ''));
      } else {
        alert(`Failed: ${data.error || data.detail || res.status}`);
      }
    } catch (e) {
      alert(`Error: ${e}`);
    } finally {
      setMarking(null);
    }
  };

  useEffect(() => {
    if (status === 'loading' || !session?.user?.email) return;

    async function fetchOrders() {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('status', filter);
        if (search) params.set('search', search);
        if (userBranch === 'ALL' && branchFilter !== 'ALL') params.set('branch', branchFilter);

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          credentials: 'include',
          headers: {
            'x-user-role': userRole,
            'x-user-email': session?.user?.email || '',
            'x-user-branch': userBranch,
          },
        });
        const data = await res.json();

        console.log('Orders API response:', res.status, data);

        if (data.results) {
          setOrders(data.results);
        } else if (data.error) {
          console.error('API Error:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filter, search, status, branchFilter, userRole, userBranch]);

  const filteredOrders = orders;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return { bg: COLORS.successLight, color: COLORS.success };
      case 'pending': return { bg: COLORS.warningLight, color: COLORS.warning };
      case 'cancelled':
      case 'refunded': return { bg: COLORS.dangerLight, color: COLORS.danger };
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
            Orders
          </h2>
          <p style={{ color: COLORS.smoke, fontSize: 15 }}>
            Manage and track all workshop orders
          </p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'white',
          color: COLORS.bark,
          padding: '12px 24px',
          borderRadius: 12,
          border: `1px solid ${COLORS.sand}`,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', borderRadius: 12, border: `1px solid ${COLORS.sand}`, minWidth: 200 }}>
          <Search size={20} color={COLORS.smoke} />
          <input
            type="text"
            placeholder="Search by name, email, order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: COLORS.bark, width: '100%' }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '12px 16px', background: 'white', borderRadius: 12, border: `1px solid ${COLORS.sand}`, fontSize: 14, color: COLORS.bark, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        {userBranch === 'ALL' && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{ padding: '12px 16px', background: 'white', borderRadius: 12, border: `1px solid ${COLORS.sand}`, fontSize: 14, color: COLORS.bark, outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">All Branches</option>
            <option value="KWT">🇰🇼 Kuwait</option>
            <option value="KSA">🇸🇦 Saudi Arabia</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(61,43,26,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.sand }}>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Order</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Branch</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${COLORS.sand}` }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: COLORS.terracotta }}>{order.code}</div>
                      <div style={{ fontSize: 12, color: COLORS.smoke, textTransform: 'capitalize' }}>{order.payment_method}</div>
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
                        background: order.branch === 'KWT' ? 'rgba(0,100,255,0.08)' : 'rgba(0,150,50,0.08)',
                        color: order.branch === 'KWT' ? '#1a56db' : '#057a55',
                      }}>
                        {order.branch === 'KWT' ? '🇰🇼 KW' : '🇸🇦 SA'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: COLORS.bark }}>{order.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.smoke }}>{order.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.bark }}>{order.event_name}</td>
                    <td style={{ padding: '16px 24px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ fontSize: 13, color: COLORS.bark }}>{item.name} × {item.quantity}</div>
                      ))}
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: COLORS.bark }}>{order.total} SAR</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize', background: statusStyle.bg, color: statusStyle.color }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.smoke, fontSize: 13 }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.infoLight, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.info, cursor: 'pointer' }}>
                          <Eye size={16} />
                        </button>
                        {order.status === 'pending' && userRole === 'admin' && (
                          <button
                            onClick={() => handleMarkPaid(order)}
                            disabled={marking === order.code}
                            title="Mark paid + send WhatsApp confirmation"
                            style={{ height: 32, padding: '0 12px', borderRadius: 8, background: COLORS.terracotta, border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: marking ? 'wait' : 'pointer', opacity: marking === order.code ? 0.6 : 1 }}
                          >
                            {marking === order.code ? '…' : 'Mark Paid'}
                          </button>
                        )}
                        {order.status === 'paid' && (
                          <button style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.warningLight, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.warning, cursor: 'pointer' }}>
                            <RefreshCw size={16} />
                          </button>
                        )}
                        <button style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.terracottaLight, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.terracotta, cursor: 'pointer' }}>
                          <Mail size={16} />
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedOrder(null)}>
          <div style={{ background: 'white', borderRadius: 20, width: '90%', maxWidth: 500, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${COLORS.sand}` }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: COLORS.bark }}>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.sand, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: COLORS.smoke, textTransform: 'uppercase', marginBottom: 4 }}>Order Number</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.terracotta, fontFamily: "'Playfair Display', serif" }}>{selectedOrder.code}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: COLORS.smoke, textTransform: 'uppercase', marginBottom: 8 }}>Customer</div>
                <div style={{ padding: 16, background: COLORS.sand, borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, color: COLORS.bark, marginBottom: 4 }}>{selectedOrder.name}</div>
                  <div style={{ fontSize: 14, color: COLORS.smoke }}>{selectedOrder.email}</div>
                  <div style={{ fontSize: 14, color: COLORS.smoke }}>{selectedOrder.phone}</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: COLORS.smoke, textTransform: 'uppercase', marginBottom: 8 }}>Items</div>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${COLORS.sand}` }}>
                    <span style={{ color: COLORS.bark }}>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600, color: COLORS.bark }}>{item.price * item.quantity} SAR</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700 }}>
                  <span style={{ color: COLORS.bark }}>Total</span>
                  <span style={{ fontSize: 20, color: COLORS.terracotta, fontFamily: "'Playfair Display', serif" }}>{selectedOrder.total} SAR</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ flex: 1, padding: 14, borderRadius: 12, background: COLORS.terracotta, color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Refund</button>
                <button style={{ flex: 1, padding: 14, borderRadius: 12, background: COLORS.sand, color: COLORS.bark, border: 'none', fontWeight: 600, cursor: 'pointer' }}>Send Email</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
