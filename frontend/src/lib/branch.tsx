'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MARKETS, Market, recommendMarket } from './market';
import { track } from './analytics';

export type Branch = Market;

interface BranchContextType {
  branch: Branch;
  setBranch: (branch: Branch) => void;
  confirmBranch: (branch: Branch) => void;
  orgSlug: string;
  confirmed: boolean;
  recommendedBranch: Branch;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<Branch>('KWT');
  const [confirmed, setConfirmed] = useState(false);
  const [recommendedBranch, setRecommendedBranch] = useState<Branch>('KWT');

  useEffect(() => {
    let saved: Branch | null = null;
    try { saved = localStorage.getItem('yadawi-market') as Branch | null; } catch { /* Storage can be disabled by privacy settings. */ }
    if (saved !== 'KWT' && saved !== 'KSA') {
      const cookieValue = document.cookie.split('; ').find(value => value.startsWith('yadawi-market='))?.split('=')[1];
      if (cookieValue === 'KWT' || cookieValue === 'KSA') saved = cookieValue;
    }
    const recommendation = recommendMarket(navigator.language);
    setRecommendedBranch(recommendation);
    if (saved === 'KWT' || saved === 'KSA') {
      setBranchState(saved);
      setConfirmed(true);
    } else {
      setBranchState(recommendation);
      track('market_recommended', { market: recommendation });
    }
  }, []);

  const confirmBranch = (next: Branch) => {
    const changed = confirmed && branch !== next;
    setBranchState(next);
    setConfirmed(true);
    try { localStorage.setItem('yadawi-market', next); } catch { /* The in-memory choice still works for this visit. */ }
    document.cookie = `yadawi-market=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    track(changed ? 'market_changed' : 'market_confirmed', { market: next });
  };

  return (
    <BranchContext.Provider value={{ branch, setBranch: confirmBranch, confirmBranch, orgSlug: MARKETS[branch].organizer, confirmed, recommendedBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch(): BranchContextType {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}

export function orgSlugToBranch(slug: string): Branch {
  return slug === MARKETS.KWT.organizer ? 'KWT' : 'KSA';
}

export function branchLabel(branch: Branch) {
  return branch === 'KWT' ? { flag: '🇰🇼', label: 'Kuwait' } : { flag: '🇸🇦', label: 'Saudi Arabia' };
}
