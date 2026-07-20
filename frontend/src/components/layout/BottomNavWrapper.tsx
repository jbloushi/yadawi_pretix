'use client';

import { BottomNav, BOTTOM_NAV_HEIGHT } from './BottomNav';
import { usePathname } from 'next/navigation';

/**
 * The bottom nav belongs on top-level destinations only — sub-flows like cart,
 * checkout and workshop detail deliberately hide it so the user stays focused.
 *
 * Every destination the nav itself links to MUST appear here. `/account` was
 * missing, so tapping "Profile" navigated to a screen where the nav vanished,
 * leaving no way back and no tab ever showing as active.
 */
const TOP_LEVEL_PATHS = ['/', '/workshops', '/shop', '/account'];

export function BottomNavWrapper() {
  const pathname = usePathname();

  if (!TOP_LEVEL_PATHS.includes(pathname)) return null;

  return (
    <>
      {/* The bar is position:fixed, so without this spacer the last rows of page
          content sit underneath it and can't be scrolled into view. */}
      <div
        aria-hidden="true"
        style={{ height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }}
      />
      <BottomNav />
    </>
  );
}
