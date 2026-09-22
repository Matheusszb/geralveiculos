import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return NextResponse.json({ error: 'Configuração pendente: adicione SUPABASE_SERVICE_ROLE_KEY nas variáveis da Vercel.' }, { status: 503 });

  const currentClient = await createClient();
  const { data: { user } } = await currentClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 });
  const { data: profile } = await currentClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Somente administradores podem cadastrar vendedores.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return NextResponse.json({ error: 'Informe nome, um e-mail válido e senha com pelo menos 6 caracteres.' }, { status: 400 });

  const admin = createAdminClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
  if (createError || !created.user) return NextResponse.json({ error: createError?.message || 'Não foi possível criar o usuário.' }, { status: 400 });

  const { error: profileError } = await admin.from('profiles').upsert({ id: created.user.id, full_name: name, role: 'seller' });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: `Não foi possível salvar o vendedor: ${profileError.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
