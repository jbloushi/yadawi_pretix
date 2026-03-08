'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: Home, label: 'Home', href: '/', active: pathname === '/' },
    { icon: Compass, label: 'Explore', href: '/workshops', active: pathname.startsWith('/workshops') },
    { icon: ShoppingBag, label: 'Shop', href: '/shop', active: pathname.startsWith('/shop') },
    { icon: User, label: 'Profile', href: '/account', active: pathname.startsWith('/account') },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(250, 246, 240, 0.97)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(61,43,26,0.08)',
      display: 'flex',
      padding: '8px 0 16px',
      zIndex: 100,
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.active;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            <Icon 
              size={20} 
              color={isActive ? '#C8622A' : '#8B7B6E'} 
            />
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 0.3,
              color: isActive ? '#C8622A' : '#8B7B6E',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#C8622A',
                marginTop: 2,
              }} />
            )}
          </Link>
        );
      })}
    </div>
  );
}
