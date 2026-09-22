'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ChangePasswordForm() {
  const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('');
    const form = new FormData(event.currentTarget); const password = String(form.get('password') || ''); const confirmation = String(form.get('confirmation') || '');
    if (password.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); return; }
    if (password !== confirmation) { setError('As senhas não conferem.'); return; }
    setBusy(true); const { error: updateError } = await createClient().auth.updateUser({ password }); setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    event.currentTarget.reset(); setSuccess('Senha alterada com sucesso.');
  }
  return <form className="form-card seller-form" onSubmit={submit}><div className="form-fields"><label>Nova senha<input name="password" type="password" minLength={6} required autoComplete="new-password" /></label><label>Confirmar nova senha<input name="confirmation" type="password" minLength={6} required autoComplete="new-password" /></label></div>{error && <p className="seller-error">{error}</p>}{success && <p className="seller-success">{success}</p>}<button className="btn" disabled={busy}>{busy ? 'Salvando…' : 'Alterar senha'}</button></form>;
}
