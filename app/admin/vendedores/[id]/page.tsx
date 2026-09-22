import { notFound, redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, getSales, salesMetrics, type Seller } from '@/lib/sales';
import { money } from '@/lib/format';
import { AdminSellerPassword } from '@/components/admin-seller-password';

export default async function SellerDetail({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') redirect('/admin');
  const db = await createClient();
  const { data: seller } = await db.from('profiles').select('id,full_name').eq('id', params.id).eq('role', 'seller').single();
  if (!seller) notFound();
  const sales = (await getSales()).filter(sale => sale.seller_id === params.id);
  const month = salesMetrics(sales, true); const total = salesMetrics(sales);
  return <AdminShell><div className="eyebrow">Desempenho do vendedor</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 30px' }}>{(seller as Seller).full_name || 'Vendedor'}</h1><div className="admin-stats seller-stats">{[['Vendas no mês', month.count], ['Vendas totais', total.count], ['Valor no mês', money(month.total)], ['Valor total', money(total.total)], ['Ticket médio', money(total.average)]].map(([label, value]) => <div className="stat" key={label as string}><small>{label as string}</small><strong>{value as string | number}</strong></div>)}</div><AdminSellerPassword sellerId={params.id} /><h2 className="display" style={{ marginTop: 42, fontSize: 40 }}>Histórico</h2><table className="admin-table"><thead><tr><th>Veículo</th><th>Valor vendido</th><th>Data</th><th>Status</th></tr></thead><tbody>{sales.map(sale => <tr key={sale.id}><td>{sale.vehicle?.brand} {sale.vehicle?.model} {sale.vehicle?.year}</td><td>{money(Number(sale.sale_price))}</td><td>{new Intl.DateTimeFormat('pt-BR').format(new Date(`${sale.sale_date}T12:00:00`))}</td><td>{sale.status === 'completed' ? 'Concluída' : 'Cancelada'}</td></tr>)}</tbody></table>{!sales.length && <p className="text-muted">Nenhuma venda registrada para este vendedor.</p>}</AdminShell>;
}
