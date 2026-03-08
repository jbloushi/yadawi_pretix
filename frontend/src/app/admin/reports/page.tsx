'use client';

import { useState } from 'react';
import { Download, Calendar, TrendingUp, DollarSign, Users, Ticket } from 'lucide-react';

const COLORS = {
  terracotta: '#C8622A',
  terracottaLight: 'rgba(200, 98, 42, 0.1)',
  bark: '#3D2B1A',
  sand: '#F2EAD8',
  cream: '#FAF6F0',
  smoke: '#8B7B6E',
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.1)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.1)',
};

const salesData = [
  { date: 'Mar 1', revenue: 2400, orders: 12 },
  { date: 'Mar 2', revenue: 1800, orders: 8 },
  { date: 'Mar 3', revenue: 3200, orders: 18 },
  { date: 'Mar 4', revenue: 2800, orders: 14 },
  { date: 'Mar 5', revenue: 4200, orders: 22 },
  { date: 'Mar 6', revenue: 3600, orders: 19 },
  { date: 'Mar 7', revenue: 3100, orders: 16 },
];

const topWorkshops = [
  { name: 'Glass Fusing Kiln', tickets: 45, revenue: 6750 },
  { name: 'Beadmaking Taster', tickets: 38, revenue: 3800 },
  { name: 'Torch Time Membership', tickets: 25, revenue: 5000 },
  { name: 'Fusing Basics', tickets: 18, revenue: 9000 },
  { name: 'Tubular Beads', tickets: 12, revenue: 1800 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7days');

  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalRevenue / totalOrders;

  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: COLORS.bark, marginBottom: 8 }}>Reports</h2>
          <p style={{ color: COLORS.smoke, fontSize: 15 }}>Analytics and insights for your workshops</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ padding: '12px 16px', background: 'white', borderRadius: 12, border: `1px solid ${COLORS.sand}`, fontSize: 14, color: COLORS.bark, outline: 'none', cursor: 'pointer' }}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', color: COLORS.bark, padding: '12px 24px', borderRadius: 12, border: `1px solid ${COLORS.sand}`, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} color={COLORS.success} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.success }}>+12.5%</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.smoke, marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.bark, fontFamily: "'Playfair Display', serif" }}>{totalRevenue.toLocaleString()} SAR</div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.terracottaLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={24} color={COLORS.terracotta} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.success }}>+8.2%</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.smoke, marginBottom: 4 }}>Total Orders</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.bark, fontFamily: "'Playfair Display', serif" }}>{totalOrders}</div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color={COLORS.info} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.success }}>+5.1%</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.smoke, marginBottom: 4 }}>Avg Order Value</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.bark, fontFamily: "'Playfair Display', serif" }}>{avgOrder.toFixed(0)} SAR</div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.sand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color={COLORS.smoke} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: COLORS.smoke, marginBottom: 4 }}>Unique Customers</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.bark, fontFamily: "'Playfair Display', serif" }}>156</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Revenue Chart */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.bark, marginBottom: 24 }}>Revenue Overview</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {salesData.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '60%', 
                    height: (day.revenue / maxRevenue) * 160, 
                    background: `linear-gradient(to top, ${COLORS.terracotta}, #E8873A)`, 
                    borderRadius: 6,
                    transition: 'height 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: 11, color: COLORS.smoke }}>{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Workshops */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.bark, marginBottom: 24 }}>Top Workshops</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topWorkshops.map((workshop, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? COLORS.terracotta : COLORS.sand, color: i === 0 ? 'white' : COLORS.smoke, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: COLORS.bark, fontSize: 14 }}>{workshop.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.smoke }}>{workshop.tickets} tickets</div>
                </div>
                <div style={{ fontWeight: 700, color: COLORS.success, fontSize: 14 }}>{workshop.revenue.toLocaleString()} SAR</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.bark, marginBottom: 24 }}>Category Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { category: 'Glass Art', count: 65, revenue: 18500, color: '#3B82F6' },
            { category: 'Jewelry', count: 38, revenue: 5600, color: '#8B5CF6' },
            { category: 'Membership', count: 25, revenue: 5000, color: '#F59E0B' },
            { category: 'Classes', count: 12, revenue: 3600, color: '#22C55E' },
          ].map((cat, i) => (
            <div key={i} style={{ padding: 20, background: COLORS.sand, borderRadius: 12, borderLeft: `4px solid ${cat.color}` }}>
              <div style={{ fontWeight: 700, color: COLORS.bark, marginBottom: 4 }}>{cat.category}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: cat.color, fontFamily: "'Playfair Display', serif" }}>{cat.revenue.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: COLORS.smoke }}>{cat.count} tickets</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
