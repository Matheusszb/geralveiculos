import { createClient } from '@/lib/supabase/server';
import type { Vehicle } from '@/lib/types';

export type UserProfile = { id: string; role: 'admin' | 'seller'; full_name: string | null };
export type Seller = Pick<UserProfile, 'id' | 'full_name'>;
export type Sale = {
  id: string; vehicle_id: string; seller_id: string; advertised_price: number; sale_price: number; sale_date: string;
  customer_name: string | null; notes: string | null; status: 'completed' | 'cancelled'; created_at: string;
  cancelled_at: string | null; vehicle?: Pick<Vehicle, 'brand' | 'model' | 'version' | 'year' | 'plate_end' | 'cover_image'> | null;
  seller?: Seller | null;
};

export async function getCurrentProfile() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data, error } = await db.from('profiles').select('id,role,full_name').eq('id', user.id).single();
  if (!error) return data as UserProfile | null;
  const { data: legacyProfile } = await db.from('profiles').select('id,role').eq('id', user.id).single();
  return legacyProfile ? { ...(legacyProfile as Omit<UserProfile, 'full_name'>), full_name: null } : null;
}

export async function getSellers() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [] as Seller[];
  const db = await createClient();
  const { data, error } = await db.from('profiles').select('id,full_name').eq('role', 'seller').order('full_name');
  if (!error) return (data || []) as Seller[];
  return [] as Seller[];
}

export async function getSales() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [] as Sale[];
  const db = await createClient();
  const { data } = await db.from('sales').select('id,vehicle_id,seller_id,advertised_price,sale_price,sale_date,customer_name,notes,status,created_at,cancelled_at,vehicle:vehicles!sales_vehicle_id_fkey(brand,model,version,year,plate_end,cover_image),seller:profiles!sales_seller_id_fkey(id,full_name)').order('sale_date', { ascending: false }).order('created_at', { ascending: false });
  return (data || []) as Sale[];
}

export function salesMetrics(sales: Sale[], monthOnly = false) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const completed = sales.filter(sale => sale.status === 'completed' && (!monthOnly || sale.sale_date.slice(0, 7) === currentMonth));
  const total = completed.reduce((sum, sale) => sum + Number(sale.sale_price), 0);
  return { count: completed.length, total, average: completed.length ? total / completed.length : 0 };
}
