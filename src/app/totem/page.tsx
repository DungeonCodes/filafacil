import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function TotemPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Totem do Paciente"
        description="Fluxo base para check-in acessível com contraste alto, navegação simplificada e emissão de senha."
      />
      <Card>
        <p className="text-slate-700">Próxima etapa: formulário de identificação + criação de ticket no Supabase.</p>
      </Card>
    </div>
  );
}
