# FilaFácil Acessível

Base inicial de um sistema **SaaS web** para gestão de filas com foco em acessibilidade, construída com **Next.js + TypeScript + Tailwind + App Router**, pronta para deploy na **Vercel** e integração com **Supabase**.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase JS Client

## Estrutura do projeto

```text
src/
  app/
    admin/
    atendente/
    medico/
    painel-chamada/
    totem/
    globals.css
    layout.tsx
    page.tsx
  components/
    features/
    layout/
    ui/
  lib/
    supabase/
    utils.ts
  styles/
    theme.css
```

## Módulos iniciais criados

- Totem do paciente (`/totem`)
- Painel de chamada (`/painel-chamada`)
- Tela do atendente (`/atendente`)
- Tela do médico (`/medico`)
- Painel administrativo (`/admin`)

## Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Essas variáveis são lidas em `src/lib/supabase/env.ts` e utilizadas em `src/lib/supabase/client.ts`.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Deploy na Vercel

1. Suba o repositório no GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente do Supabase no dashboard da Vercel.
4. Faça deploy.

## Preparado para evolução futura

- Integração com Supabase Auth (papéis: atendente, médico, admin)
- Persistência de filas e tickets em Postgres
- Atualizações em tempo real para painel de chamada
- Observabilidade e métricas operacionais por unidade

## Próxima feature recomendada

Implementar **autenticação e autorização por perfil com Supabase Auth** (RBAC simples), pois destrava com segurança os fluxos de atendente, médico e administração.
