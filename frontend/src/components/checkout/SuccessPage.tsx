'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Check, Home } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  
  const orderCode = searchParams.get('order') || '';
  
  const locale = 'ar';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f3' }}>
      <div className="h-48 relative" style={{ background: 'linear-gradient(to bottom right, #22c55e, #16a34a, #15803d)' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center mb-3">
            <Check size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">{locale === 'ar' ? 'تم التسجيل!' : 'Registration Complete!'}</h1>
          <p className="text-white/80 mt-1">{locale === 'ar' ? 'تم حجز مكانك' : 'Your spot has been reserved'}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ border: '2px solid #bbf7d0' }}>
          {orderCode ? (
            <>
              <div className="text-center mb-6">
                <p className="text-sm" style={{ color: '#92400e' }}>{locale === 'ar' ? 'رقم الطلب' : 'Order Number'}</p>
                <p className="text-3xl font-bold tracking-wider" style={{ color: '#166534' }}>{orderCode}</p>
              </div>

              <div className="p-4 rounded-xl mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}>
                    <Check size={20} style={{ color: '#16a34a' }} />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#166534' }}>{locale === 'ar' ? 'الدفع: عند الاستلام' : 'Payment: Cash on Delivery'}</p>
                    <p className="text-sm" style={{ color: '#15803d' }}>{locale === 'ar' ? 'سيتم التواصل معك للدفع' : 'We will contact you for payment'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3" style={{ color: '#78350f' }}>
                <p className="font-bold">{locale === 'ar' ? 'مهم: سنقوم بالتواصل معك عبر واتساب لتأكيد حجزك وترتيب الدفع.' : 'Important: We will contact you on WhatsApp to confirm your booking and arrange payment.'}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: '#92400e' }}>{locale === 'ar' ? 'لا تتوفر معلومات الطلب' : 'No order information available'}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full font-bold py-4 rounded-xl text-lg text-center"
            style={{ 
              background: 'linear-gradient(to right, #d97706, #f97316)',
              color: 'white',
            }}
          >
            <Home size={20} className="inline ml-2" />
            {locale === 'ar' ? 'الرئيسية' : 'Back to Home'}
          </Link>
          
          <Link
            href="/workshops"
            className="block w-full font-bold py-4 rounded-xl text-lg text-center border-2"
            style={{ 
              borderColor: '#fed7aa',
              color: '#78350f',
              background: '#fffbeb',
            }}
          >
            {locale === 'ar' ? 'تصفح المزيد من الورش' : 'Browse More Workshops'}
          </Link>
        </div>

        <div className="mt-8 p-4 rounded-xl text-center" style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}>
          <p className="text-sm" style={{ color: '#92400e' }}>
            {locale === 'ar' ? 'أسئلة؟' : 'Questions?'} <a href="https://wa.me/9665xxxxxxxx" style={{ color: '#d97706' }}>{locale === 'ar' ? 'تواصل معنا على واتساب' : 'Contact us on WhatsApp'}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf8f3' }}>
        <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
