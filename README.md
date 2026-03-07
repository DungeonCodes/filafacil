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
      actions.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    features/
      totem-ticket-form.tsx
    layout/
    ui/
  lib/
    supabase/
      client.ts
      env.ts
      server.ts
    utils.ts
  styles/
    theme.css
```

## Módulos iniciais

- Totem do paciente (`/totem`) ✅ com geração real de senha no Supabase
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
- `SUPABASE_SERVICE_ROLE_KEY` (recomendado para server actions que persistem dados)

## Fluxo implementado no `/totem`

1. Paciente escolhe **fila normal** ou **fila preferencial**.
2. Ao clicar em **Gerar senha**, o sistema:
   - busca `queues.code = 'GERAL'`;
   - consulta o último ticket do dia por fila + prioridade;
   - gera o próximo número sequencial;
   - grava em `tickets` com status `aguardando`.
3. Exibe senha em destaque (`N001`, `P001`) e mensagem: **“Aguarde sua chamada no painel.”**

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

## Próxima feature recomendada

Implementar **autenticação e autorização por perfil com Supabase Auth** (RBAC simples), pois destrava com segurança os fluxos de atendente, médico e administração.
