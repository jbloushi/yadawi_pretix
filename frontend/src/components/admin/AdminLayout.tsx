'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

const COLORS = {
  cream: '#FAF6F0',
  sand: '#F2EAD8',
  terracotta: '#C8622A',
  bark: '#3D2B1A',
  smoke: '#8B7B6E',
};

const rolePermissions: Record<string, string[]> = {
  admin: ['/admin', '/admin/workshops', '/admin/workshops/new', '/admin/workshops/[id]', '/admin/orders', '/admin/users', '/admin/reports', '/admin/checkin', '/admin/settings'],
  usher: ['/admin', '/admin/checkin'],
  viewer: ['/admin', '/admin/reports'],
};

function MobileBlocker() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: COLORS.cream,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      textAlign: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        marginBottom: 24,
      }}>
        💻
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 24,
        fontWeight: 700,
        color: COLORS.bark,
        marginBottom: 12,
      }}>
        Desktop Required
      </h2>
      <p style={{
        color: COLORS.smoke,
        fontSize: 15,
        lineHeight: 1.6,
        marginBottom: 24,
      }}>
        This feature is available on desktop or tablet devices.
      </p>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userRole = (session?.user as any)?.role || 'viewer';
  const allowedPaths = rolePermissions[userRole] || [];
  const isPathAllowed = allowedPaths.some(path => {
    if (path.includes('[id]')) {
      const basePath = path.replace('/[id]', '');
      return pathname.startsWith(basePath);
    }
    return pathname === path || pathname.startsWith(path + '/') || (path === '/admin' && pathname.startsWith('/admin'));
  });

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [mounted, status, router]);

  // Show loading only after mounted
  if (!mounted || status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.cream,
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `4px solid ${COLORS.sand}`,
          borderTopColor: COLORS.terracotta,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.includes('/workshops')) return 'Workshops';
    if (pathname.includes('/orders')) return 'Orders';
    if (pathname.includes('/users')) return 'Users';
    if (pathname.includes('/reports')) return 'Reports';
    if (pathname.includes('/checkin')) return 'Check-in';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Admin';
  };

  // Check if path is allowed
  if (!isPathAllowed) {
    if (isMobile) {
      return <MobileBlocker />;
    }
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.cream }}>
        <AdminSidebar />
        <main style={{ flex: 1, marginRight: 240 }}>
          <AdminHeader title="Access Denied" />
          <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: COLORS.bark, marginBottom: 12 }}>
                Access Denied
              </h2>
              <p style={{ color: COLORS.smoke, fontSize: 15, marginBottom: 24 }}>
                You don't have permission to access this page.
              </p>
              <a href="/admin" style={{ color: COLORS.terracotta, fontWeight: 600, textDecoration: 'none' }}>
                ← Go to Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mobile blocker for admin/viewer on non-dashboard pages
  if (isMobile && pathname !== '/admin') {
    return <MobileBlocker />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.cream }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginRight: 240, transition: 'margin-right 0.3s ease' }}>
        <AdminHeader title={getPageTitle()} />
        <div style={{ padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
