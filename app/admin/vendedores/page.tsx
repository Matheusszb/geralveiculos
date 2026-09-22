import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminSellerForm } from '@/components/admin-seller-form';
import { getCurrentProfile, getSales, getSellers, salesMetrics } from '@/lib/sales';
import { money } from '@/lib/format';

export default async function Sellers() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') redirect('/admin');
  const [sellers, sales] = await Promise.all([getSellers(), getSales()]);
  return <AdminShell><div className="eyebrow">Acessos ao painel</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 12px' }}>Vendedores</h1><p className="text-muted seller-intro">Cadastre vendedores e acompanhe o desempenho individual.</p><AdminSellerForm />
    <section className="seller-performance"><div className="eyebrow">Desempenho dos vendedores</div><div className="seller-performance-grid">{sellers.map(seller => { const metrics = salesMetrics(sales.filter(sale => sale.seller_id === seller.id)); return <Link href={`/admin/vendedores/${seller.id}`} className="seller-performance-card" key={seller.id}><small>{seller.full_name || 'Vendedor'}</small><strong>{metrics.count} veículos vendidos</strong><span>{money(metrics.total)} em vendas</span></Link>; })}</div>{!sellers.length && <p className="text-muted">Nenhum vendedor cadastrado.</p>}</section>
  </AdminShell>;
}
