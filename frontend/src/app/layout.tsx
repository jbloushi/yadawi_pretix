import './globals.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n';
import { CartProvider } from '@/lib/cart';
import { BranchProvider } from '@/lib/branch';
import { CartPopupWrapper } from '@/components/cart/CartPopupWrapper';
import { Header } from '@/components/layout/Header';
import { BottomNavWrapper } from '@/components/layout/BottomNavWrapper';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

export const metadata: Metadata = {
  title: 'Yadawi - Workshops & Classes',
  description: 'Learn new skills with the best instructors in Kuwait and Saudi Arabia',
  keywords: ['workshops', 'training', 'courses', 'Kuwait', 'Saudi Arabia', 'ورش عمل', 'تدريب'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/logo-icon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NextAuthProvider>
          <I18nProvider initialLocale="en">
            <BranchProvider>
              <CartProvider>
                <Header />
                {children}
                <BottomNavWrapper />
                <CartPopupWrapper />
              </CartProvider>
            </BranchProvider>
          </I18nProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
