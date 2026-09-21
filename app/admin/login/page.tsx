'use client';
import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import logo from '@/public/assets/logo3dsemfundo.png';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({
        email: String(form.get('email')).trim(),
        password: String(form.get('password')),
      });
      if (authError) {
        if (authError.message.toLowerCase().includes('not confirmed')) setError('Este e-mail ainda não foi confirmado no Supabase.');
        else if (authError.message.toLowerCase().includes('invalid login')) setError('E-mail ou senha incorretos. Confirme a senha definida no Supabase Auth.');
        else setError(authError.message);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Não foi possível conectar ao Supabase. Confirme as variáveis da Vercel e faça um redeploy.');
    }
  }

  return <main className="login"><form className="login-card" onSubmit={login}>
    <Image src={logo} alt="Geral Veículos" priority />
    <h1 className="display" style={{ fontSize: 42 }}>Área administrativa</h1>
    <label>E-mail<input required name="email" type="email" autoComplete="email" /></label>
    <label>Senha<input required name="password" type="password" autoComplete="current-password" /></label>
    {error && <p style={{ color: '#c51f2b', fontSize: 13 }}>{error}</p>}
    <button className="btn" style={{ width: '100%' }}>Entrar</button>
  </form></main>;
}
