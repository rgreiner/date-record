# date-record

App pessoal do Rafael (PWA de registro). **Exceção da stack**: é o único app ainda em **Supabase Cloud** (banco + auth via `@supabase/ssr`) — a migração pro VPS foi adiada de propósito; não migrar sem ele pedir. Fora do Vercel (deletado); sem deploy ativo no momento.

## Stack
- Next 16 (App Router, middleware = `proxy.ts`) + React 19 + Tailwind 4, TypeScript; dnd-kit para drag-and-drop.

## Comandos
- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck`

## Banco
- Schema vive **só no Supabase** (não há migrations no repo). Ao mudar schema, gerar o SQL para o Rafael aplicar no dashboard do Supabase — e considerar começar a versionar em `db/migrations/NNN_nome.sql` (padrão dos outros projetos).

## Quando migrar pro VPS (futuro)
- Receita pronta nas memórias globais: Postgres 17 no Coolify + auth própria (scrypt + cookie, portar `lib/auth/*` do one-crm) + storage em volume; PostgREST só se valer manter o supabase-js.
