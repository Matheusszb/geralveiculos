import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminSalesPanel } from '@/components/admin-sales-panel';
import { getAdminVehicles } from '@/lib/vehicles';
import { getCurrentProfile, getSales, getSellers } from '@/lib/sales';

export default async function SalesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin/login');
  const [sales, sellers, vehicles] = await Promise.all([getSales(), getSellers(), getAdminVehicles()]);
  return <AdminShell><AdminSalesPanel sales={sales} sellers={sellers} vehicles={vehicles} profile={profile} /></AdminShell>;
}
