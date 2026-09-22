'use client';

import { useState, type FormEvent } from 'react';

export function AdminSellerForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(''); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/sellers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password') }) });
      const result = await response.json();
      if (!response.ok) setError(result.error || 'Não foi possível cadastrar o vendedor.');
      else { event.currentTarget.reset(); setMessage('Vendedor cadastrado. Ele já pode entrar no painel com este e-mail e senha.'); }
    } catch { setError('Não foi possível comunicar com o servidor.'); }
    setBusy(false);
  }

  return <form className="form-card seller-form" onSubmit={submit}><div className="form-fields">
    <label>Nome completo<input name="name" required autoComplete="name" /></label>
    <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
    <label className="full">Senha temporária<input name="password" type="password" minLength={6} required autoComplete="new-password" /><small>Use ao menos 6 caracteres. O vendedor usará estas credenciais em /admin/login.</small></label>
  </div>
  {error && <p className="seller-error">{error}</p>}{message && <p className="seller-success">{message}</p>}
  <button className="btn" disabled={busy}>{busy ? 'Cadastrando…' : 'Cadastrar vendedor'}</button>
  </form>;
}
