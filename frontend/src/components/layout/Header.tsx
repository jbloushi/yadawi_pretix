'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { useBranch } from '@/lib/branch';
import { Search, Bell, ShoppingBag } from 'lucide-react';

export function Header() {
  const { locale } = useTranslation();
  const { itemCount } = useCart();
  const { branch, setBranch } = useBranch();

  return (
    <header>
      {/* TOP NAV */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(250, 246, 240, 0.95)',
        backdropFilter: 'blur(12px)',
        padding: '14px 20px 10px',
        borderBottom: '1px solid rgba(61, 43, 26, 0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
            <img src="/logo.png" alt="Yadawi" style={{ height: 38, width: 'auto', display: 'block' }} />
          </Link>

          {/* Nav Icons */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/cart" style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#F2EAD8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              textDecoration: 'none',
            }}>
              <ShoppingBag size={18} color="#3D2B1A" />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#C8622A',
                  color: 'white',
                  fontSize: 9,
                  fontWeight: 700,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FAF6F0',
                }}>
                  {itemCount}
                </span>
              )}
            </Link>
            <button style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#F2EAD8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}>
              <Bell size={18} color="#3D2B1A" />
            </button>
          </div>
        </div>

        {/* Branch Pills Container */}
        <div style={{
          background: '#3D2B1A',
          borderRadius: 24,
          padding: 4,
          display: 'flex',
          gap: 4,
          marginTop: -6, // pull up slightly
        }}>
          <button
            onClick={() => setBranch('KWT')}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              cursor: 'pointer',
              background: branch === 'KWT' ? 'white' : 'transparent',
              color: branch === 'KWT' ? '#3D2B1A' : 'rgba(255,255,255,0.7)',
              border: 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <img src="https://flagcdn.com/w20/kw.png" alt="KW" style={{ width: 14, height: 'auto', borderRadius: 2 }} />
            Kuwait
          </button>
          <button
            onClick={() => setBranch('KSA')}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              cursor: 'pointer',
              background: branch === 'KSA' ? '#F2EAD8' : 'transparent',
              color: branch === 'KSA' ? '#3D2B1A' : 'rgba(255,255,255,0.7)',
              border: 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <img src="https://flagcdn.com/w20/sa.png" alt="SA" style={{ width: 14, height: 'auto', borderRadius: 2 }} />
            Saudi Arabia
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#F2EAD8',
          borderRadius: 16,
          padding: '10px 14px',
          border: '1.5px solid transparent',
          transition: 'all 0.2s',
        }}>
          <Search size={16} color="#8B7B6E" />
          <input
            placeholder="Search workshops, classes, products..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#3D2B1A',
            }}
          />
        </div>
      </div>
    </header>
  );
}
