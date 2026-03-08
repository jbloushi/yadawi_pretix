'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Mail, Ticket, Loader2, Calendar, MapPin, Check } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { PretixOrder } from '@/types/pretix';

const mockOrders: PretixOrder[] = [
  {
    code: 'ABC12',
    status: 'paid',
    testmode: false,
    email: 'test@example.com',
    phone: '+965 12345678',
    locale: 'ar',
    created_at: '2026-02-15T10:00:00Z',
    modified_at: '2026-02-15T10:00:00Z',
    expires: '2026-02-20T10:00:00Z',
    total: '299.00',
    currency: 'SAR',
    payment_info: null,
    positions: [
      {
        id: 1,
        order: 'ABC12',
        item: 1,
        variation: null,
        price: '299.00',
        quantity: 1,
        attendee_name: 'أحمد محمد',
        attendee_email: 'test@example.com',
        secret: 'abc123secret',
        checked_in: false,
        checkin_secret: 'xyz789',
        subevent: null,
      },
    ],
    customer: null,
    checkin_attended: false,
  },
];

export function AccountPage() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [orderCode, setOrderCode] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoggedIn(true);
    setIsLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="px-3.5 py-5">
        <div className="card p-5">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <Ticket size={24} className="text-primary" />
            </div>
            <h1 className="text-lg font-extrabold text-secondary-900">{t('account.title')}</h1>
            <p className="text-xs text-secondary-500 mt-1.5">{t('account.loginSubtitle')}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-secondary-700 mb-1.5">
                {t('account.email')}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute top-1/2 -translate-y-1/2 end-3 text-secondary-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 mb-1.5">
                {t('account.orderCode')}
              </label>
              <div className="relative">
                <Ticket size={16} className="absolute top-1/2 -translate-y-1/2 end-3 text-secondary-400" />
                <input
                  type="text"
                  placeholder="ABC12"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full btn-lg mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('account.findOrders')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3.5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-extrabold text-secondary-900">{t('account.myTickets')}</h1>
        <button onClick={() => setIsLoggedIn(false)} className="text-xs text-secondary-500">
          {t('nav.logout')}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {mockOrders.map((order) => (
          <div key={order.code} className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-purple-500 px-3 py-2 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm">{order.code}</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">✓ {t('account.paid')}</span>
            </div>

            <div className="p-3">
              <h3 className="text-sm font-extrabold text-secondary-900 mb-2">
                {order.positions[0].attendee_name}
              </h3>

              <div className="flex gap-3 text-[11px] text-secondary-600 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(order.created_at, 'ar')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="font-extrabold text-primary">
                  {formatCurrency(order.total, order.currency)}
                </span>
                <button className="btn btn-sm btn-outline text-xs py-1.5">
                  {t('account.viewTicket')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
