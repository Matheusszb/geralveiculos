import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminSalesHistory } from '@/components/admin-sales-history';
import { getCurrentProfile, getSales, getSellers } from '@/lib/sales';

export default async function SalesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin/login');
  const [sales, sellers] = await Promise.all([getSales(), getSellers()]);
  const isAdmin = profile.role === 'admin';
  return <AdminShell><div className="section-head"><div><div className="eyebrow">Controle de vendas</div><h1 className="display" style={{ fontSize: 58, margin: 8 }}>{isAdmin ? 'Vendas' : 'Minhas vendas'}</h1></div><Link className="btn" href="/admin/veiculos">Registrar venda</Link></div><AdminSalesHistory initialSales={sales} sellers={sellers} isAdmin={isAdmin} /></AdminShell>;
}
