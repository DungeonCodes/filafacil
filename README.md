# FilaFácil Acessível

O FilaFácil Acessível é uma plataforma de gestão de filas voltada para ambientes de saúde (Hospitais, Clínicas, UBS), com foco primordial em acessibilidade (alto contraste, áudio) para pessoas com deficiência e idosos.

Este sistema simula o fluxo completo de uma unidade referenciada, contendo geração de ticket, painel de chamada do atendente, telão público, e um dashboard administrativo inteligente para relatórios.

## 🛠️ Stack Tecnológica

O projeto foi construído seguindo as melhores práticas modernas recomendadas pela equipe de arquitetura:

*   **Frontend**: Next.js 14 (App Router), React, TypeScript
*   **Estilização**: Tailwind CSS (com paletas exclusivas _Medical Clean_)
*   **Acessibilidade / Animações**: Compatibilidade WCAG, alto contraste, navegação por teclado e integrações de animação (magnetic buttons, GSAP/CSS Transitions).
*   **Gráficos / Analytics**: Recharts
*   **Backend & Banco de Dados**: Supabase (PostgreSQL)
*   **Testes Automatizados**: Vitest + React Testing Library
*   **CI/CD**: GitHub Actions
*   **Hospedagem Recomendada**: Vercel

## 📂 Arquitetura de Páginas

*   `/`: **Home Page** com projeto e navegação simples.
*   `/totem`: **Interface do Paciente** para autoatendimento médico e geração de senha.
*   `/atendente`: **Painel do Atendente**, permitindo o controle da fila e chamadas do próximo paciente ("Chamar Próximo").
*   `/painel-chamada`: **Painel Público (TV)** desenhado para longas distâncias, suportando tecnologias assistivas (Aria Live).
*   `/admin`: **Dashboard de Estatísticas**, demonstrando picos de atendimento e tempo médio de espera.

## ⚙️ Banco de Dados (Supabase)

Tabelas em PostgreSQL esperadas no banco:
*   `queues` (id, name, created_at)
*   `tickets` (id, queue_id, ticket_number UNIQUE, status ['waiting', 'called', 'finished'], created_at, called_at)
*   `calls` (id, ticket_id, called_by, called_at)

O schema completo pode ser encontrado em `supabase/schema.sql`.

## 🚀 Como Executar Localmente

### Pré-requisitos
*   Node.js (LTS recomendado)
*   NPM ou Yarn
*   Um projeto Supabase ativo

### 1. Varáveis de Ambiente
Crie um arquivo `.env.local` na raiz contendo:
```env
NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_para_seed
```

### 2. Instalação
```bash
npm install
```

### 3. Rodando o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`.

## 🧑‍🔬 Dados de Demonstração (Seed)

Para preencher sua base Supabase com dados realistas visando a demonstração no Projeto Integrador (PI), rode:
```bash
npm run seed
```
Isto criará filas e tickets sintéticos, populando os gráficos do Dashboard.

## 🧪 Testes Automatizados (CI)

O sistema conta com testes automatizados executando `Vitest`. Eles são rodados nas pipelines de Pull Request ou rodando manualmente:
```bash
npm run test
```

## 🌐 Deploy na Vercel

Para colocar o projeto no ar, basta importar o repositório na Vercel e adicionar as variáveis:
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

O projeto conta com CI/CD no GitHub Actions já configurado em `.github/workflows/ci.yml`.
