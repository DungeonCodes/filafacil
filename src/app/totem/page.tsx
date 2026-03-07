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

      <Card className="max-w-2xl">
        <TotemTicketForm />
      </Card>
    </div>
  );
}
