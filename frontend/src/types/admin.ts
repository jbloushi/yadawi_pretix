export type AdminRole = 'admin' | 'usher' | 'viewer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalWorkshops: number;
  totalUsers: number;
  todayOrders: number;
  todayRevenue: number;
  ordersChange: number;
  revenueChange: number;
}

export interface Order {
  id: string;
  code: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  email: string;
  name: string;
  phone?: string;
  positions: OrderPosition[];
  total: number;
  created_at: string;
  event_slug?: string;
}

export interface OrderPosition {
  item: string;
  quantity: number;
  price: number;
}

export interface Workshop {
  id: number;
  slug: string;
  name: string;
  description?: string;
  date_from: string;
  date_to?: string;
  location?: string;
  status: 'live' | 'draft' | 'archived';
  items: WorkshopItem[];
}

export interface WorkshopItem {
  id: number;
  name: string;
  price: number;
  quota?: number;
  sold?: number;
}

export interface ReportData {
  salesByDate: { date: string; revenue: number; orders: number }[];
  topWorkshops: { name: string; revenue: number; tickets: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
}
