import Link from 'next/link';
import { AdminShell } from '@/components/admin-shell';
import { AdminVehicleBoard } from '@/components/admin-vehicle-board';
import { getAdminVehicles } from '@/lib/vehicles';
import { getCurrentProfile } from '@/lib/sales';

export default async function AdminVehicles() {
  const [vehicles, profile] = await Promise.all([getAdminVehicles(), getCurrentProfile()]);
  return <AdminShell>
    <div className="section-head"><div><div className="eyebrow">Estoque</div><h1 className="display" style={{ fontSize: 58, margin: 8 }}>Veículos</h1></div><Link className="btn" href="/admin/veiculos/novo">Adicionar veículo</Link></div>
    <AdminVehicleBoard initialVehicles={vehicles} isAdmin={profile?.role === 'admin'} />
  </AdminShell>;
}
