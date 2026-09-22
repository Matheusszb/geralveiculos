import { AdminShell } from '@/components/admin-shell';
import { ChangePasswordForm } from '@/components/change-password-form';

export default function MyAccount() {
  return <AdminShell><div className="eyebrow">Minha conta</div><h1 className="display" style={{ fontSize: 58, margin: '8px 0 30px' }}>Alterar senha</h1><ChangePasswordForm /></AdminShell>;
}
