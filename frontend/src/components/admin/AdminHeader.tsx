'use client';

import { useSession } from 'next-auth/react';
import { Bell, User } from 'lucide-react';
import { COLORS } from '@/lib/theme';


export function AdminHeader({ title }: { title: string }) {
  const { data: session } = useSession();

  const userBranch: string = (session?.user as any)?.branch || 'ALL';
  const branchBadge =
    userBranch === 'KWT'
      ? { icon: '🇰🇼', label: 'KW', bg: 'rgba(0,100,255,0.10)', color: '#1a56db' }
      : userBranch === 'KSA'
        ? { icon: '🇸🇦', label: 'SA', bg: 'rgba(0,150,50,0.10)', color: '#057a55' }
        : { icon: '🌐', label: 'ALL', bg: COLORS.sand, color: COLORS.smoke };

  return (
    <header style={{
      height: 64,
      background: 'white',
      borderBottom: `1px solid ${COLORS.sand}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Title */}
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 24,
        fontWeight: 700,
        color: COLORS.bark,
      }}>
        {title}
      </h1>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 10,
          background: COLORS.sand,
          width: 280,
        }}>
          <input
            type="text"
            placeholder="Search..."
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

        {/* Branch Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '6px 14px',
          borderRadius: 20,
          background: branchBadge.bg,
          color: branchBadge.color,
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: 'nowrap',
        }}>
          {branchBadge.icon} {branchBadge.label}
        </div>

        {/* Notifications */}
        <button style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: COLORS.sand,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={20} color={COLORS.bark} />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: COLORS.terracotta,
          }} />
        </button>

        {/* User Avatar */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: 14,
        }}>
          {session?.user?.name?.[0] || <User size={20} />}
        </div>
      </div>
    </header>
  );
}
