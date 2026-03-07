import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export default function PainelChamadaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Chamada"
        description="Tela pública preparada para exibir chamadas em tempo real e estado da fila."
      />
      <Card>
        <p className="text-slate-700">Próxima etapa: assinatura de eventos com Supabase Realtime.</p>
      </Card>
    </div>
  );
}
