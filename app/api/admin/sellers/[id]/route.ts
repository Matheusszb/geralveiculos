import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return NextResponse.json({ error: 'Configuração pendente: SUPABASE_SERVICE_ROLE_KEY não foi definida na Vercel.' }, { status: 503 });
  const current = await createClient(); const { data: { user } } = await current.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 });
  const { data: profile } = await current.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Somente administradores podem redefinir senhas.' }, { status: 403 });
  const body = await request.json().catch(() => null); const password = typeof body?.password === 'string' ? body.password : '';
  if (password.length < 6) return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres.' }, { status: 400 });
  const admin = createAdminClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: seller, error: sellerError } = await admin.from('profiles').select('role').eq('id', params.id).single();
  if (sellerError || seller?.role !== 'seller') return NextResponse.json({ error: 'Vendedor não encontrado.' }, { status: 404 });
  const { error } = await admin.auth.admin.updateUserById(params.id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
