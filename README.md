# Geral Veículos

Site da Geral Veículos, Ubá - MG. Feito com Next.js App Router, TypeScript, Tailwind, Framer Motion e Supabase.

## Executar localmente

1. Instale dependências: `npm install`.
2. Copie `.env.example` para `.env.local` e preencha as três variáveis.
3. No Supabase, crie um projeto e execute o arquivo `supabase/migrations/202609210001_initial.sql` no SQL Editor. Ele cria as tabelas, RLS e o bucket `vehicle-images`.
4. Em Authentication > Users, crie o primeiro usuário administrador (não há cadastro público).
5. No SQL Editor, vincule esse usuário: `insert into public.profiles (id, role) values ('UUID_DO_USUARIO', 'admin');`.
6. Rode `npm run dev` e acesse `/admin/login` para gerenciar o estoque.

## Publicação na Vercel

Importe o repositório, inclua as mesmas variáveis de ambiente em Project Settings > Environment Variables e publique. Defina `NEXT_PUBLIC_SITE_URL` com o domínio final para canonical, sitemap e Open Graph.

## Conteúdo e segurança

Os dados de contato ficam centralizados em `lib/config.ts`; futuramente podem ser migrados para `site_settings`. Nenhuma chave de serviço é usada no frontend. O SQL restringe alterações, fotos e leads a perfis administradores e deixa público apenas o estoque publicado.
