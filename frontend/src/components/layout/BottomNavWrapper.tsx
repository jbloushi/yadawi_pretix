'use client';

import { BottomNav } from './BottomNav';
import { usePathname } from 'next/navigation';

export function BottomNavWrapper() {
  const pathname = usePathname();
  
  const showOnPaths = ['/', '/workshops', '/shop'];
  const shouldShow = showOnPaths.includes(pathname);
  
  if (!shouldShow) return null;
  
  return <BottomNav />;
}
