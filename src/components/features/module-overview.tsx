import { Card } from '@/components/ui/card';

const modules = [
  {
    name: 'Totem do paciente',
    summary: 'Autoatendimento com acessibilidade para emissão e confirmação de senha.',
  },
  {
    name: 'Painel de chamada',
    summary: 'Exibição em tempo real da fila com preparação para Supabase Realtime.',
  },
  {
    name: 'Tela do atendente',
    summary: 'Fluxo para triagem, classificação e organização da fila de atendimento.',
  },
  {
    name: 'Tela do médico',
    summary: 'Visão da fila clínica com preparação para prontuário e status de consulta.',
  },
  {
    name: 'Painel administrativo',
    summary: 'Configurações globais, métricas operacionais e gestão de unidades.',
  },
];

export function ModuleOverview() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {modules.map((module) => (
        <Card key={module.name}>
          <h2 className="text-xl font-semibold text-slate-900">{module.name}</h2>
          <p className="mt-2 text-slate-600">{module.summary}</p>
        </Card>
      ))}
    </section>
  );
}
