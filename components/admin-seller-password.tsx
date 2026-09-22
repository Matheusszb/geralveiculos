'use client';

import { useState, type FormEvent } from 'react';

export function AdminSellerPassword({ sellerId }: { sellerId: string }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage(''); const form = new FormData(event.currentTarget); const password = String(form.get('password') || ''); const confirmation = String(form.get('confirmation') || '');
    if (password !== confirmation) { setError('As senhas não conferem.'); return; } setBusy(true);
    const response = await fetch(`/api/admin/sellers/${sellerId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error || 'Não foi possível alterar a senha.'); return; } event.currentTarget.reset(); setMessage('Senha redefinida com sucesso.');
  }
  return <form className="form-card seller-form" style={{ marginTop: 34 }} onSubmit={submit}><div className="eyebrow">Acesso do vendedor</div><h2 className="display" style={{ fontSize: 36, margin: '8px 0 20px' }}>Redefinir senha</h2><div className="form-fields"><label>Nova senha<input type="password" name="password" minLength={6} required /></label><label>Confirmar senha<input type="password" name="confirmation" minLength={6} required /></label></div>{error && <p className="seller-error">{error}</p>}{message && <p className="seller-success">{message}</p>}<button className="btn" disabled={busy}>{busy ? 'Salvando…' : 'Redefinir senha'}</button></form>;
}
