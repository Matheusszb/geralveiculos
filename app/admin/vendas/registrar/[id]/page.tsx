import { notFound, redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { SaleRegisterForm } from '@/components/sale-register-form';
import { getAdminVehicle } from '@/lib/vehicles';
import { getCurrentProfile, getSellers } from '@/lib/sales';

export default async function RegisterSale({ params }: { params: { id: string } }) {
  const [vehicle, profile] = await Promise.all([getAdminVehicle(params.id), getCurrentProfile()]);
  if (!vehicle || vehicle.status === 'sold') return notFound();
  if (!profile) redirect('/admin/login');
  const sellers = profile.role === 'admin' ? await getSellers() : [{ id: profile.id, full_name: profile.full_name }];
  return <AdminShell><div className="eyebrow">Controle de vendas</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 30px' }}>Registrar venda</h1><SaleRegisterForm vehicle={vehicle} sellers={sellers} currentSellerId={profile.id} isAdmin={profile.role === 'admin'} /></AdminShell>;
}
