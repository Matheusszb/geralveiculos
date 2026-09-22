import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminVehicleForm } from '@/components/admin-vehicle-form';
import { getAdminVehicle } from '@/lib/vehicles';

export default async function EditVehicle({ params }: { params: { id: string } }) {
  const vehicle = await getAdminVehicle(params.id);
  if (!vehicle) return notFound();
  return <AdminShell>
    <div className="eyebrow">Estoque</div>
    <h1 className="display" style={{ fontSize: 58, margin: '8px 0 30px' }}>Editar veículo</h1>
    <AdminVehicleForm vehicle={vehicle} />
  </AdminShell>;
}
