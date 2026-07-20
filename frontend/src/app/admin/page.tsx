'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';


interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalWorkshops: number;
  totalUsers: number;
  todayOrders: number;
  todayRevenue: number;
  ordersChange: number;
  revenueChange: number;
}

interface RecentOrder {
  id: string;
  code: string;
  name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
  event_name: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalWorkshops: 0,
    totalUsers: 0,
    todayOrders: 0,
    todayRevenue: 0,
    ordersChange: 0,
    revenueChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role || 'viewer';

  useEffect(() => {
    if (!session?.user?.email) return;

    async function fetchData() {
      try {
        const headers = {
          'x-user-role': userRole,
          'x-user-email': session?.user?.email || '',
        };

        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/orders?limit=5', { headers }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.results?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session, userRole]);

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: COLORS.terracotta,
      bgColor: COLORS.terracottaLight,
      href: '/admin/orders',
    },
    {
      title: "Today's Revenue",
      value: `${stats.todayRevenue.toLocaleString()} SAR`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: COLORS.success,
      bgColor: COLORS.successLight,
      href: '/admin/reports',
    },
    {
      title: 'Total Workshops',
      value: stats.totalWorkshops,
      change: 4.2,
      icon: Calendar,
      color: COLORS.info,
      bgColor: COLORS.infoLight,
      href: '/admin/workshops',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: 2.8,
      icon: Users,
      color: COLORS.warning,
      bgColor: COLORS.warningLight,
      href: '/admin/users',
    },
  ];

  const getStatusColor = (status: string) => {
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
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.bark,
          marginBottom: 8,
        }}>
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}!
        </h2>
        <p style={{ color: COLORS.smoke, fontSize: 15 }}>
          Here's what's happening with your workshops today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 24,
        marginBottom: 32,
      }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <Link
              key={index}
              href={stat.href}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isPositive ? COLORS.success : COLORS.danger,
                }}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div style={{
                fontSize: 13,
                color: COLORS.smoke,
                marginBottom: 8,
              }}>
                {stat.title}
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: 800,
                color: COLORS.bark,
                fontFamily: "'Playfair Display', serif",
              }}>
                {stat.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(61,43,26,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${COLORS.sand}`,
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.bark,
          }}>
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            style={{
              color: COLORS.terracotta,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View All <ArrowUpRight size={16} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.sand }}>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Order</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                return (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${COLORS.sand}` }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: COLORS.terracotta }}>{order.code}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: COLORS.bark }}>{order.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.smoke }}>{order.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.bark }}>{order.event_name}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: COLORS.bark }}>{order.total} SAR</td>
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
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.smoke, fontSize: 13 }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      {userRole === 'admin' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 32,
        }}>
          <Link href="/admin/workshops/new" style={{
            background: `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
            borderRadius: 16,
            padding: 24,
            textDecoration: 'none',
            color: 'white',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Create Workshop</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Add new workshop event</div>
          </Link>
          <Link href="/admin/checkin" style={{
            background: `linear-gradient(135deg, ${COLORS.info}, #2563EB)`,
            borderRadius: 16,
            padding: 24,
            textDecoration: 'none',
            color: 'white',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Check-in</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Scan tickets for attendees</div>
          </Link>
          <Link href="/admin/reports" style={{
            background: `linear-gradient(135deg, ${COLORS.bark}, #5D3A22)`,
            borderRadius: 16,
            padding: 24,
            textDecoration: 'none',
            color: 'white',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>View Reports</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Analytics & insights</div>
          </Link>
        </div>
      )}
    </div>
  );
}
