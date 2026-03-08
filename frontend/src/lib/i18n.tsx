'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Language = 'ar' | 'en';

interface I18nContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const translationsAr: Record<string, string> = {
  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.search': 'بحث',
  'common.viewAll': 'عرض الكل',
  'nav.workshops': 'ورش العمل',
  'nav.shop': 'المتجر',
  'nav.membership': 'العضوية',
  'nav.login': 'تسجيل الدخول',
  'nav.account': 'حسابي',
  'nav.logout': 'تسجيل الخروج',
  'home.title': 'ياداوي',
  'home.searchPlaceholder': 'ابحث عن ورش عمل أو منتجات...',
  'home.upcomingWorkshops': 'ورش قادمة',
  'home.viewAllWorkshops': 'عرض الكل',
  'home.featuredWorkshops': 'لماذا تختار ياداوي؟',
  'workshops.title': 'ورش العمل',
  'workshops.viewDetails': 'عرض التفاصيل',
  'workshops.materials': 'المواد متضمنة',
  'workshops.beginner': 'مبتدئ',
  'workshops.onlySpots': 'بقي {count} فقط',
  'workshop.about': 'عن هذه الورشة',
  'workshop.instructor': 'المدرب',
  'workshop.tickets': 'التذاكر',
  'workshop.provided': 'متضمن',
  'workshop.registerNow': 'سجل الآن',
  'workshop.noExperience': 'لا خبرة مطلوبة',
  'checkout.redirecting': 'جاري التحويل للدفع...',
  'checkout.pleaseWait': 'يرجى الانتظار...',
  'success.title': 'تم!',
  'success.subtitle': 'أنت مسجل!',
  'success.showAtEntry': 'أظهر هذا عند الدخول',
  'success.orderNumber': 'الطلب',
  'success.addToCalendar': 'إضافة للتقويم',
  'success.viewMyTickets': 'عرض تذاكرني',
  'success.backToHome': 'الرئيسية',
  'account.title': 'حسابي',
  'account.loginSubtitle': 'أدخل بريدك الإلكتروني ورقم الطلب للبحث عن طلباتك',
  'account.email': 'البريد الإلكتروني',
  'account.orderCode': 'رقم الطلب',
  'account.findOrders': 'البحث عن الطلبات',
  'account.myTickets': 'تذاكرني',
  'account.paid': 'مدفوع',
  'account.viewTicket': 'عرض التذكرة',
};

const translationsEn: Record<string, string> = {
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.search': 'Search',
  'common.viewAll': 'View All',
  'nav.workshops': 'Workshops',
  'nav.shop': 'Shop',
  'nav.membership': 'Membership',
  'nav.login': 'Login',
  'nav.account': 'My Account',
  'nav.logout': 'Logout',
  'home.title': 'Yadawi',
  'home.searchPlaceholder': 'Search workshops or products…',
  'home.upcomingWorkshops': 'Upcoming Workshops',
  'home.viewAllWorkshops': 'View All',
  'home.featuredWorkshops': 'Why Join Yadawi?',
  'workshops.title': 'Workshops',
  'workshops.viewDetails': 'View Details',
  'workshops.materials': 'Materials Provided',
  'workshops.beginner': 'Beginner',
  'workshops.onlySpots': 'Only {count} spots',
  'workshop.about': 'About this workshop',
  'workshop.instructor': 'Instructor',
  'workshop.tickets': 'Tickets',
  'workshop.provided': 'Provided',
  'workshop.registerNow': 'Register Now',
  'workshop.noExperience': 'No Experience Needed',
  'checkout.redirecting': 'Redirecting to payment...',
  'checkout.pleaseWait': 'Please wait...',
  'success.title': 'Success!',
  'success.subtitle': "You're Registered!",
  'success.showAtEntry': 'Show this at entry',
  'success.orderNumber': 'Order',
  'success.addToCalendar': 'Add to Calendar',
  'success.viewMyTickets': 'View My Tickets',
  'success.backToHome': 'Back to Home',
  'account.title': 'My Account',
  'account.loginSubtitle': 'Enter your email and order code to find your orders',
  'account.email': 'Email',
  'account.orderCode': 'Order Code',
  'account.findOrders': 'Find Orders',
  'account.myTickets': 'My Tickets',
  'account.paid': 'Paid',
  'account.viewTicket': 'View Ticket',
};

const translations = { ar: translationsAr, en: translationsEn };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, initialLocale = 'ar' }: { children: ReactNode; initialLocale?: Language }) {
  const [locale, setLocale] = useState<Language>(initialLocale);
  const pathname = usePathname();

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[locale][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const isAdminPanel = pathname?.startsWith('/admin');
  const dir = isAdminPanel ? 'ltr' : (locale === 'ar' ? 'rtl' : 'ltr');

  // Sync <html> dir and lang attributes so the entire page reflects the current language
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, dir, setLocale } = useI18n();
  return { t, locale, dir, setLocale };
}
