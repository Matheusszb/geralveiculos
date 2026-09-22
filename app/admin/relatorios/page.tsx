import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminSalesHistory } from '@/components/admin-sales-history';
import { getCurrentProfile, getSales, getSellers } from '@/lib/sales';

export default async function ReportsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') redirect('/admin');
  const [sales, sellers] = await Promise.all([getSales(), getSellers()]);
  return <AdminShell><div className="eyebrow">Relatórios</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 30px' }}>Relatório de vendas</h1><AdminSalesHistory initialSales={sales} sellers={sellers} isAdmin exportEnabled /></AdminShell>;
}
