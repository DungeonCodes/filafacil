import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export default function AtendentePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tela do Atendente"
        description="Interface inicial para triagem, classificação de risco e chamada de pacientes."
      />
      <Card>
        <p className="text-slate-700">Próxima etapa: autenticação com Supabase Auth e controle de perfil.</p>
      </Card>
    </div>
  );
}
