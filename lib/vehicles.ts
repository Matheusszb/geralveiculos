import { createClient } from '@/lib/supabase/server';
import type { Vehicle } from '@/lib/types';

const modernImages = 'vehicle_images(id,url,position,object_position)';
const legacyImages = 'vehicle_images(id,url,position)';

function withDefaultPosition(data: unknown) {
  return ((data || []) as Vehicle[]).map(vehicle => ({
    ...vehicle,
    vehicle_images: vehicle.vehicle_images?.map(image => ({ ...image, object_position: image.object_position || '50% 50%' })),
  }));
}

export async function getVehicles(featured = false) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [] as Vehicle[];
  const db = await createClient();
  let query = db.from('vehicles').select(`*,${modernImages}`).eq('status', 'available').order('created_at', { ascending: false });
  if (featured) query = query.eq('featured', true).limit(9);
  const { data, error } = await query;
  if (!error) return withDefaultPosition(data);

  let fallback = db.from('vehicles').select(`*,${legacyImages}`).eq('status', 'available').order('created_at', { ascending: false });
  if (featured) fallback = fallback.eq('featured', true).limit(9);
  const { data: legacyData } = await fallback;
  return withDefaultPosition(legacyData);
}

export async function getAdminVehicles() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [] as Vehicle[];
  const db = await createClient();
  const { data, error } = await db.from('vehicles').select(`*,${modernImages}`).order('created_at', { ascending: false });
  if (!error) return withDefaultPosition(data);
  const { data: legacyData } = await db.from('vehicles').select(`*,${legacyImages}`).order('created_at', { ascending: false });
  return withDefaultPosition(legacyData);
}

export async function getVehicle(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createClient();
  const { data, error } = await db.from('vehicles').select(`*,${modernImages}`).eq('slug', slug).eq('status', 'available').single();
  if (!error) return withDefaultPosition([data])[0] || null;
  const { data: legacyData } = await db.from('vehicles').select(`*,${legacyImages}`).eq('slug', slug).eq('status', 'available').single();
  return withDefaultPosition(legacyData ? [legacyData] : [])[0] || null;
}

export async function getAdminVehicle(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createClient();
  const { data, error } = await db.from('vehicles').select(`*,${modernImages}`).eq('id', id).single();
  if (!error) return withDefaultPosition([data])[0] || null;
  const { data: legacyData } = await db.from('vehicles').select(`*,${legacyImages}`).eq('id', id).single();
  return withDefaultPosition(legacyData ? [legacyData] : [])[0] || null;
}
