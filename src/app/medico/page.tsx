import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export default function MedicoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tela do Médico"
        description="Visão operacional do consultório para acompanhar próximos pacientes e status clínico."
      />
      <Card>
        <p className="text-slate-700">Próxima etapa: lista dinâmica de pacientes em atendimento.</p>
      </Card>
    </div>
  );
}
