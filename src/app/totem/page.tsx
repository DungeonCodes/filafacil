import { TotemTicketForm } from '@/components/features/totem-ticket-form';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export default function TotemPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Totem do Paciente"
        description="Escolha o tipo de fila e gere sua senha de atendimento de forma simples e acessível."
      />

      <Card className="max-w-2xl" aria-labelledby="totem-ticket-heading">
        <h2 id="totem-ticket-heading" className="mb-4 text-xl font-semibold text-slate-900">
          Emissão de senha
        </h2>
        <TotemTicketForm />
      </Card>
    </div>
  );
}
