import { ModuleOverview } from '@/components/features/module-overview';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { isSupabaseReady } from '@/lib/supabase/env';

export default function HomePage() {
  const supabaseReady = isSupabaseReady();

  return (
    <div className="space-y-8">
      <PageHeader
        title="FilaFácil Acessível"
        description="Base inicial SaaS em Next.js para operação de filas com acessibilidade, pronta para crescer com Supabase Auth, Postgres e Realtime."
      />

      <Card className={supabaseReady ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/70'}>
        <p className="text-sm font-medium text-slate-800">
          Supabase {supabaseReady ? 'configurado e pronto para integração.' : 'pendente de configuração de variáveis de ambiente.'}
        </p>
      </Card>

      <ModuleOverview />
    </div>
  );
}
