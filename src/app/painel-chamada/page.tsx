import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatTicketCode } from '@/lib/ticket';

interface WaitingTicket {
  id: string;
  prefix: string;
  ticket_number: number;
  priority_type: 'normal' | 'preferencial';
  issued_at: string;
}

interface CalledTicket {
  prefix: string;
  ticket_number: number;
  priority_type: 'normal' | 'preferencial';
}

async function getWaitingTickets() {
  const supabase = createSupabaseServerClient();

  const { data: queue, error: queueError } = await supabase
    .from('queues')
    .select('id')
    .eq('code', 'GERAL')
    .single();

  if (queueError || !queue) {
    return { error: 'Não foi possível carregar a fila GERAL no momento.', tickets: [] as WaitingTicket[] };
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id,prefix,ticket_number,priority_type,issued_at')
    .eq('queue_id', queue.id)
    .eq('status', 'aguardando')
    .order('issued_at', { ascending: true });

  if (ticketsError) {
    return { error: 'Não foi possível carregar as senhas aguardando agora.', tickets: [] as WaitingTicket[] };
  }

  return { error: null, tickets: (tickets ?? []) as WaitingTicket[] };
}

async function getCurrentCalledTicket() {
  const supabase = createSupabaseServerClient();

  const { data: latestCall, error: latestCallError } = await supabase
    .from('calls')
    .select('ticket_id')
    .order('called_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestCallError || !latestCall?.ticket_id) {
    return null;
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('prefix,ticket_number,priority_type')
    .eq('id', latestCall.ticket_id)
    .maybeSingle();

  if (ticketError || !ticket) {
    return null;
  }

  return ticket as CalledTicket;
}

export default async function PainelChamadaPage() {
  const [{ error, tickets }, currentCalledTicket] = await Promise.all([
    getWaitingTickets(),
    getCurrentCalledTicket(),
  ]);

  const nextNormal = tickets.find((ticket) => ticket.priority_type === 'normal');
  const nextPriority = tickets.find((ticket) => ticket.priority_type === 'preferencial');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel de Chamada"
        description="Senhas aguardando na fila GERAL, com visual claro para TV e monitor de sala de espera."
      />

      <Card className="border-brand-200 bg-brand-50 text-center">
        <h2 className="text-2xl font-bold text-brand-900">Agora chamando</h2>
        <p className="mt-3 text-7xl font-extrabold tracking-widest text-brand-700" aria-live="polite">
          {currentCalledTicket
            ? formatTicketCode(currentCalledTicket.prefix, currentCalledTicket.ticket_number)
            : '---'}
        </p>
      </Card>

      {error ? (
        <Card role="alert" className="border-rose-200 bg-rose-50">
          <p className="text-lg font-medium text-rose-700">{error}</p>
        </Card>
      ) : null}

      <section aria-label="Próximas senhas" className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900 text-white">
          <h2 className="text-xl font-semibold">Próxima senha normal</h2>
          <p className="mt-4 text-6xl font-extrabold tracking-widest" aria-live="polite">
            {nextNormal ? formatTicketCode(nextNormal.prefix, nextNormal.ticket_number) : '---'}
          </p>
        </Card>

        <Card className="bg-brand-700 text-white">
          <h2 className="text-xl font-semibold">Próxima senha preferencial</h2>
          <p className="mt-4 text-6xl font-extrabold tracking-widest" aria-live="polite">
            {nextPriority ? formatTicketCode(nextPriority.prefix, nextPriority.ticket_number) : '---'}
          </p>
        </Card>
      </section>

      <section aria-labelledby="lista-espera-heading">
        <h2 id="lista-espera-heading" className="text-2xl font-bold text-slate-900">
          Senhas aguardando
        </h2>

        {tickets.length === 0 ? (
          <Card className="mt-4">
            <p className="text-xl text-slate-700">Nenhuma senha aguardando no momento.</p>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de senhas aguardando">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Card className="text-center">
                  <p className="text-5xl font-extrabold tracking-widest text-slate-900">
                    {formatTicketCode(ticket.prefix, ticket.ticket_number)}
                  </p>
                  <p className="mt-2 text-base text-slate-600">
                    {ticket.priority_type === 'preferencial' ? 'Preferencial' : 'Normal'}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
