import { AdminShell } from '@/components/admin-shell';
import { AdminSellerForm } from '@/components/admin-seller-form';

export default function Sellers() {
  return <AdminShell>
    <div className="eyebrow">Acessos ao painel</div>
    <h1 className="display" style={{ fontSize: 58, margin: '8px 0 12px' }}>Vendedores</h1>
    <p className="text-muted seller-intro">Cadastre um vendedor para que ele entre no painel com e-mail e senha próprios.</p>
    <AdminSellerForm />
  </AdminShell>;
}
