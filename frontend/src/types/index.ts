export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: "customer" | "worker" | "supplier" | "admin";
  verified: boolean;
  created_at: string;
}

export interface ServiceCategory {
  id: number;
  group: string;
  name: string;
  fee_type: string;
  shop_visit_allowed: boolean;
  active: boolean;
  coming_soon: boolean;
  base_service_charge: number;
  market_rate_estimate: number;
  icon: string;
  description: string;
}

export interface WorkerProvider {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  verified: boolean;
  category_id: number;
  base_rate: number;
  rating: number;
  available_today: boolean;
  experience_years: number;
  bio: string;
}

export interface Booking {
  id: number;
  customer_id: number;
  worker_id: number | null;
  category_id: number;
  mode: string;
  status: string;
  scheduled_at: string | null;
  address: string | null;
  service_charge: number;
  parts_total: number;
  fee: number;
  total: number;
  market_price_estimate: number;
  savings: number;
  notes: string | null;
  created_at: string;
}

export interface LabourEstimate {
  work_type: string;
  workers_count: number;
  days: number;
  start_date: string;
  team_lead?: string;
  base_rate_per_worker_per_day: number;
  subtotal: number;
  discount_pct: number;
  discount_amount: number;
  total: number;
  slab_table: Array<{ workers: number; discount_pct: number }>;
}

export interface PartResult {
  supplier_price_id: number;
  part_id: number;
  part_name: string;
  part_category: string;
  shop_id: number;
  shop_name: string;
  shop_address: string;
  lat: number;
  lng: number;
  distance_km: number;
  price: number;
  stock: number;
  is_cheapest: boolean;
}

export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  type: string;
  gstin?: string;
  address?: string;
  lat?: number;
  lng?: number;
  verified: boolean;
  distance_km?: number;
}

export interface SavingsSummary {
  booking_id: number;
  service_charge: number;
  parts_total: number;
  fee: number;
  total: number;
  market_price_estimate: number;
  savings: number;
  savings_pct: number;
  worker_amount: number;
  supplier_amount: number;
  platform_amount: number;
}
