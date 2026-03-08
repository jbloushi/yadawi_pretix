'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

const COLORS = {
  terracotta: '#C8622A',
  bark: '#3D2B1A',
  sand: '#F2EAD8',
  cream: '#FAF6F0',
};

export function Footer() {
  const { t, locale } = useTranslation();

  return (
    <footer className="py-8 px-4 mt-auto" style={{ backgroundColor: COLORS.bark }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: COLORS.terracotta }}>
            <span className="text-white text-lg font-bold" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>ي</span>
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Yadawi</span>
        </div>
        
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          {locale === 'ar' 
            ? 'منصة تعليمية توفر ورش عمل متنوعة في الكويت والسعودية'
            : 'An educational platform providing various workshops in Kuwait and Saudi Arabia'}
        </p>

        <div className="flex gap-6 text-sm text-white/60 mb-6">
          <Link href="/workshops" className="hover:text-white transition-colors">{t('nav.workshops')}</Link>
          <Link href="/account" className="hover:text-white transition-colors">{t('nav.account')}</Link>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Yadawi Workshops. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
