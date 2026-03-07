import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel Administrativo"
        description="Área de governança para unidades, filas, equipes e configurações de operação."
      />
      <Card>
        <p className="text-slate-700">Próxima etapa: CRUD de unidades e parâmetros de fila no banco.</p>
      </Card>
    </div>
  );
}
