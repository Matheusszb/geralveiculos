import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminBackupExport } from '@/components/admin-backup-export';
import { getAdminVehicles } from '@/lib/vehicles';
import { getCurrentProfile, getSales } from '@/lib/sales';

export default async function BackupPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') redirect('/admin');
  const [vehicles, sales] = await Promise.all([getAdminVehicles(), getSales()]);
  return <AdminShell><div className="eyebrow">Segurança dos dados</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 12px' }}>Backup e exportação</h1><p className="text-muted seller-intro">Baixe uma cópia dos dados cadastrados. O backup completo preserva veículos, fotos e histórico de vendas em um único arquivo.</p><AdminBackupExport vehicles={vehicles} sales={sales} /></AdminShell>;
}
