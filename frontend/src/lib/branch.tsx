'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Branch = 'KWT' | 'KSA';

interface BranchContextType {
    branch: Branch;
    setBranch: (branch: Branch) => void;
    /** Pretix organizer slug for the current branch */
    orgSlug: string;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
    const [branch, setBranch] = useState<Branch>('KWT');

    useEffect(() => {
        console.log(`BranchProvider: Current branch is ${branch}`);
    }, [branch]);

    const orgSlug = branch === 'KWT' ? 'yadawi' : 'yadawi-sa';

    return (
        <BranchContext.Provider value={{ branch, setBranch, orgSlug }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranch(): BranchContextType {
    const ctx = useContext(BranchContext);
    if (!ctx) throw new Error('useBranch must be used within BranchProvider');
    return ctx;
}

/** Map organizer slug → branch code */
export function orgSlugToBranch(slug: string): Branch {
    return slug === 'yadawi' ? 'KWT' : 'KSA';
}

/** Flag emoji + label for a branch */
export function branchLabel(branch: Branch) {
    return branch === 'KWT' ? { flag: '🇰🇼', label: 'Kuwait' } : { flag: '🇸🇦', label: 'Saudi Arabia' };
}
