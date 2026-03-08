'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  Users,
  BarChart3,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const COLORS = {
  terracotta: '#C8622A',
  bark: '#3D2B1A',
  sand: '#F2EAD8',
  cream: '#FAF6F0',
  smoke: '#8B7B6E',
};

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'usher', 'viewer'] },
  { href: '/admin/workshops', icon: Calendar, label: 'Workshops', roles: ['admin'] },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin'] },
  { href: '/admin/users', icon: Users, label: 'Users', roles: ['admin'] },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'viewer'] },
  { href: '/admin/checkin', icon: QrCode, label: 'Check-in', roles: ['admin', 'usher'] },
  { href: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = (session?.user as any)?.role || 'viewer';

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      minHeight: '100vh',
      background: COLORS.bark,
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      transition: 'width 0.3s ease',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {collapsed ? (
          <img
            src="/logo-icon.png"
            alt="Yadawi"
            style={{ width: 40, height: 40, objectFit: 'contain', display: 'block', filter: 'invert(1) brightness(2)' }}
          />
        ) : (
          <div>
            <img
              src="/logo.png"
              alt="Yadawi"
              style={{ height: 32, width: 'auto', display: 'block', filter: 'invert(1) brightness(2)' }}
            />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>
              Admin Panel
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: 12,
                marginBottom: 4,
                background: isActive ? `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)` : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          left: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: COLORS.terracotta,
          border: '3px solid #2A1E14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: 12,
        }}
      >
        {collapsed ? '←' : '→'}
      </button>

      {/* User & Logout */}
      <div style={{
        padding: collapsed ? '16px 12px' : '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        {!collapsed && session?.user && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>
              {session.user.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'capitalize' }}>
              {userRole}
            </div>
            {/* Branch badge */}
            {(() => {
              const b = (session?.user as any)?.branch || 'ALL';
              const label = b === 'KWT' ? '🇰🇼 Kuwait' : b === 'KSA' ? '🇸🇦 Saudi Arabia' : '🌐 All Branches';
              return (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  {label}
                </div>
              );
            })()}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: collapsed ? '100%' : 'auto',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px' : '10px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: 13,
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
