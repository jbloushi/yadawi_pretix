export interface PretixEvent {
  id: number;
  slug: string;
  name: Record<string, string>;
  description: string;
  date_from: string;
  date_to: string;
  location: string | null;
  organizer: string;
  currency: string;
  plugins: string[];
  has_logo: boolean;
  logo_url: string | null;
  frontpage_text: string;
  expiration: string | null;
  presale_has_started: boolean;
  presale_has_ended: boolean;
  sale_enabled: boolean;
  seats: number | null;
  seats_used: number | null;
  total_seats: number | null;
  status: string;
  meta_data: Record<string, string>;
  live: boolean;
  testmode: boolean;
  public_url: string;
  coverImage?: string;
}

export interface PretixItem {
  id: number;
  name: Record<string, string>;
  description: string;
  category: string | null;
  category_id: number | null;
  price: string;
  default_price: string;
  free_price: boolean;
  tax_rate: string;
  tax_name: string;
  available_from: string | null;
  available_until: string | null;
  max_per_order: number;
  min_per_order: number;
  quantity_left: number | null;
  hide_without_voucher: boolean;
  admission: boolean;
  position: number;
  variations: PretixVariation[];
}

export interface PretixVariation {
  id: number;
  value: string;
  name: string;
  price: string;
  quantity_left: number | null;
}

export interface PretixOrder {
  code: string;
  status: string;
  testmode: boolean;
  email: string;
  phone: string | null;
  locale: string;
  created_at: string;
  modified_at: string;
  expires: string;
  total: string;
  currency: string;
  payment_info: null;
  positions: PretixOrderPosition[];
  customer: string | null;
  checkin_attended: boolean;
}

export interface PretixOrderPosition {
  id: number;
  order: string;
  item: number;
  variation: number | null;
  price: string;
  quantity: number;
  attendee_name: string;
  attendee_email: string;
  secret: string;
  checked_in: boolean;
  checkin_secret: string;
  subevent: number | null;
}

export interface PretixCart {
  cart_id: string;
  email: string;
  positions: CartPosition[];
  total: string;
  expires: string;
}

export interface CartPosition {
  item: number;
  variation: number | null;
  quantity: number;
  price: string;
  subevent: number | null;
}

export interface WebhookPayload {
  notification_id: string;
  organizer: string;
  event: string;
  code: string;
  action: string;
  data: PretixOrder;
}
