import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { getAdminVehicles } from '@/lib/vehicles';
import { getCurrentProfile, getSales, salesMetrics } from '@/lib/sales';
import { money } from '@/lib/format';

export default async function Admin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin/login');
  const [vehicles, sales] = await Promise.all([getAdminVehicles(), getSales()]);
  const available = vehicles.filter(vehicle => vehicle.status === 'available').length;
  const sold = vehicles.filter(vehicle => vehicle.status === 'sold').length;
  const month = salesMetrics(sales, true); const total = salesMetrics(sales);
  const isAdmin = profile.role === 'admin';
  const cards = isAdmin ? [['Vendas este mês', `${month.count} veículos`], ['Faturamento em vendas', money(total.total)], ['Ticket médio', money(total.average)], ['Veículos disponíveis', available], ['Veículos vendidos', sold]] : [['Minhas vendas este mês', month.count], ['Valor vendido no mês', money(month.total)], ['Meu ticket médio', money(month.average)], ['Veículos disponíveis', available]];
  return <AdminShell><div className="eyebrow">Painel administrativo</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 30px' }}>{isAdmin ? 'Dashboard' : `Olá, ${profile.full_name || 'vendedor'}`}</h1><div className="admin-stats dashboard-stats">{cards.map(([label, value]) => <div className="stat" key={label as string}><small>{label as string}</small><strong>{value as string | number}</strong></div>)}</div><div className="dashboard-links"><Link className="btn" href="/admin/veiculos">{isAdmin ? 'Gerenciar estoque' : 'Veículos disponíveis'}</Link><Link className="btn btn-outline" href="/admin/vendas">{isAdmin ? 'Ver vendas' : 'Minhas vendas'}</Link></div><section className="dashboard-recent"><div className="eyebrow">Vendas recentes</div><h2 className="display">{isAdmin ? 'Últimas vendas' : 'Minhas últimas vendas'}</h2>{sales.slice(0, 5).map(sale => <div className="recent-sale" key={sale.id}><span>{sale.vehicle?.brand} {sale.vehicle?.model}</span><b>{money(Number(sale.sale_price))}</b><small>{sale.status === 'completed' ? 'Concluída' : 'Cancelada'}</small></div>)}{!sales.length && <p className="text-muted">Ainda não há vendas registradas.</p>}</section></AdminShell>;
}
