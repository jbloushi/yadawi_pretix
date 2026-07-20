'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { useBranch } from '@/lib/branch';
import { Search, ShoppingBag, Globe2 } from 'lucide-react';
import type { Branch } from '@/lib/branch';

export function Header() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const { itemCount, clearCart } = useCart();
  const { branch, setBranch, confirmed, recommendedBranch } = useBranch();
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const [query, setQuery] = useState('');

  const requestBranch = (next: Branch) => {
    if (next === branch && confirmed) return;
    setPendingBranch(next);
  };

  const finishBranchChange = (clearCurrent: boolean) => {
    if (!pendingBranch) return;
    if (clearCurrent) clearCart();
    setBranch(pendingBranch);
    setPendingBranch(null);
  };

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
            <Link
              href="/cart"
              aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart, empty'}
              style={{
                width: 44,
                height: 44,
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
                }}
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#F2EAD8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}>
              <Globe2 size={18} color="#3D2B1A" />
              <span className="sr-only">{locale === 'en' ? 'العربية' : 'English'}</span>
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
            type="button"
            onClick={() => requestBranch('KWT')}
            aria-pressed={branch === 'KWT'}
            aria-label="Show Kuwait branch"
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
              gap: 6,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            <img src="https://flagcdn.com/w20/kw.png" alt="" aria-hidden="true" width={14} height={10} style={{ width: 14, height: 'auto', borderRadius: 2 }} />
            Kuwait
          </button>
          <button
            type="button"
            onClick={() => requestBranch('KSA')}
            aria-pressed={branch === 'KSA'}
            aria-label="Show Saudi Arabia branch"
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
              gap: 6,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            <img src="https://flagcdn.com/w20/sa.png" alt="" aria-hidden="true" width={14} height={10} style={{ width: 14, height: 'auto', borderRadius: 2 }} />
            Saudi Arabia
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ padding: '12px 20px' }}>
        <form onSubmit={(event) => { event.preventDefault(); router.push(`/workshops?q=${encodeURIComponent(query.trim())}`); }} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#F2EAD8',
          borderRadius: 16,
          padding: '10px 14px',
          border: '1.5px solid transparent',
          transition: 'all 0.2s',
        }}>
          <Search size={16} color="#6F6154" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search workshops, classes and products"
            placeholder="Search workshops, classes, products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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
        </form>
      </div>

      {(!confirmed || pendingBranch) && (
        <div className="market-dialog-backdrop" role="presentation">
          <section className="market-dialog" role="dialog" aria-modal="true" aria-labelledby="market-dialog-title">
            <div className="market-dialog-kicker">Your market</div>
            <h2 id="market-dialog-title">
              {!confirmed ? `Show workshops and prices for ${recommendedBranch === 'KWT' ? 'Kuwait' : 'Saudi Arabia'}?` : 'Switch market?'}
            </h2>
            <p>
              {itemCount > 0 && pendingBranch
                ? `Your ${branch === 'KWT' ? 'Kuwait' : 'Saudi Arabia'} cart has ${itemCount} item${itemCount === 1 ? '' : 's'}. Keep it for later or clear it before switching.`
                : 'You can switch any time. Prices, availability, payment methods and policies are kept separate by market.'}
            </p>
            <div className="market-dialog-actions">
              {itemCount > 0 && pendingBranch && (
                <button type="button" className="market-secondary" onClick={() => finishBranchChange(true)}>Clear cart & switch</button>
              )}
              <button type="button" className="market-primary" onClick={() => {
                const target = pendingBranch || recommendedBranch;
                setBranch(target);
                setPendingBranch(null);
              }}>
                {itemCount > 0 && pendingBranch ? 'Keep cart for later & switch' : `Continue with ${(pendingBranch || recommendedBranch) === 'KWT' ? 'Kuwait' : 'Saudi Arabia'}`}
              </button>
              {!confirmed && (
                <button type="button" className="market-link" onClick={() => setPendingBranch(recommendedBranch === 'KWT' ? 'KSA' : 'KWT')}>
                  Choose {recommendedBranch === 'KWT' ? 'Saudi Arabia' : 'Kuwait'} instead
                </button>
              )}
              {confirmed && <button type="button" className="market-link" onClick={() => setPendingBranch(null)}>Cancel</button>}
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
