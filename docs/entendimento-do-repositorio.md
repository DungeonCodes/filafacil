# Entendimento do Repositório (FilaFácil)

Este documento resume como o sistema está funcionando atualmente no código.

## 1) Stack e execução

- Aplicação Next.js com App Router, React e TypeScript.
- Comandos principais em `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `seed`, `test`.
- A navegação principal é renderizada no layout global com links para as áreas de operação.

## 2) Fluxo funcional atual (end-to-end)

### Totem (`/totem`)

- Página cliente com três tipos de atendimento: Clínico Geral, Pediatria e Exames.
- Ao selecionar um tipo, a tela consulta a fila por nome em `queues`, gera senha no formato `PREFIXO-###` com componente aleatório e grava em `tickets` com status `waiting`.
- Depois exibe cartão de senha gerada com horário/data e ações de áudio/impressão simuladas.

### Atendente (`/atendente`)

- Página cliente que carrega:
  - último ticket com status `called` (senha atual),
  - lista ordenada de tickets `waiting` (fila de espera).
- A ação **Chamar Próximo**:
  1. pega o primeiro da fila de espera,
  2. muda status dele para `called` e grava `called_at`,
  3. registra evento em `calls`,
  4. finaliza a senha anterior (status `finished`, quando existir),
  5. recarrega os estados da tela.

### Painel público (`/painel-chamada`)

- Página cliente com polling a cada 3 segundos:
  - busca o último ticket `called` para destaque principal,
  - busca próximos tickets `waiting` (limit 4) para previsibilidade da chamada.
- Inclui `aria-live="polite"` para anunciar mudanças na senha atual.

### Admin (`/admin`)

- Dashboard cliente que busca tickets do dia via Supabase para KPIs básicos.
- Mostra cartões de indicadores e gráficos (Recharts).
- Parte da evolução de espera usa série mock no código.

## 3) Modelo de dados observado

O schema SQL em `supabase/schema.sql` define:

- `queues`
- `tickets` com status enum: `waiting`, `called`, `finished`
- `calls`

Esse modelo é coerente com o fluxo implementado nas páginas de totem/atendente/painel.

## 4) Pontos de atenção técnicos

1. **Duas abordagens de Supabase coexistem**:
   - cliente legado em `src/lib/supabaseClient.ts` (usado pelas páginas principais),
   - fábrica browser/server em `src/lib/supabase/client.ts` e `src/lib/supabase/server.ts`.
2. **Fluxo alternativo de totem não conectado à rota atual**:
   - existe server action em `src/app/totem/actions.ts` e componente `TotemTicketForm`,
   - porém `src/app/totem/page.tsx` usa lógica cliente própria e não usa o formulário baseado em action.
3. **Inconsistência potencial de status/padrão de domínio**:
   - action do totem usa `status: 'aguardando'`/campos (`priority_type`, `prefix`) que não existem no schema atual de `supabase/schema.sql`.
4. **Navegação aponta para rota ausente**:
   - `MainNav` inclui `/medico`, mas não existe rota correspondente em `src/app`.

## 5) Testes existentes

- Vitest + Testing Library para páginas de Totem, Atendente e Dashboard.
- Os testes mockam o módulo `@/lib/supabaseClient`, reforçando que o fluxo principal validado hoje é o fluxo cliente legado.

## 6) Recomendação prática para evolução

- Escolher uma arquitetura única para Supabase (preferencialmente factory browser/server),
- alinhar schema e ações server-side com os mesmos estados/campos usados na UI ativa,
- remover rotas órfãs do menu ou implementar as telas faltantes,
- mover geração de senha para lógica transacional no servidor para evitar colisões de numeração aleatória.
