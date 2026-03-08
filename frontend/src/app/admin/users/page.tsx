'use client';

import { useState } from 'react';
import { Search, Plus, MoreVertical, Mail, Shield } from 'lucide-react';

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

const users = [
  { id: '1', name: 'Ahmed Al-Rashid', email: 'ahmed@email.com', phone: '+966501234567', orders: 5, total_spent: 750, role: 'user', joined: '2025-06-15' },
  { id: '2', name: 'Fatima Hassan', email: 'fatima@email.com', phone: '+966551234567', orders: 3, total_spent: 450, role: 'user', joined: '2025-08-20' },
  { id: '3', name: 'Sarah Mohamed', email: 'sarah@email.com', phone: '+966561234567', orders: 8, total_spent: 1200, role: 'vip', joined: '2025-04-10' },
  { id: '4', name: 'Omar Khalil', email: 'omar@email.com', phone: '+966571234567', orders: 2, total_spent: 300, role: 'user', joined: '2025-11-05' },
  { id: '5', name: 'Layla Ahmed', email: 'layla@email.com', phone: '+966581234567', orders: 1, total_spent: 150, role: 'user', joined: '2026-01-20' },
  { id: '6', name: 'Admin User', email: 'admin@yadawi.com', phone: '-', orders: 0, total_spent: 0, role: 'admin', joined: '2025-01-01' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return { bg: COLORS.terracottaLight, color: COLORS.terracotta };
      case 'vip': return { bg: COLORS.infoLight, color: COLORS.info };
      default: return { bg: COLORS.sand, color: COLORS.smoke };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: COLORS.bark, marginBottom: 8 }}>Users</h2>
          <p style={{ color: COLORS.smoke, fontSize: 15 }}>Manage registered users and admins</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`, color: 'white', padding: '12px 24px', borderRadius: 12, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', borderRadius: 12, border: `1px solid ${COLORS.sand}` }}>
          <Search size={20} color={COLORS.smoke} />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: COLORS.bark, width: '100%' }} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(61,43,26,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.sand }}>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Orders</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Total Spent</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleStyle = getRoleStyle(user.role);
                return (
                  <tr key={user.id} style={{ borderBottom: `1px solid ${COLORS.sand}` }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: COLORS.bark }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.smoke }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.bark }}>{user.phone}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: COLORS.bark }}>{user.orders}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: COLORS.success }}>{user.total_spent} SAR</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize', background: roleStyle.bg, color: roleStyle.color }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.smoke, fontSize: 13 }}>{new Date(user.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.terracottaLight, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.terracotta, cursor: 'pointer' }}>
                          <Mail size={16} />
                        </button>
                        <button style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.infoLight, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.info, cursor: 'pointer' }}>
                          <Shield size={16} />
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
