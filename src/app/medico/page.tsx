import { MedicoCallControls } from '@/components/features/medico-call-controls';
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

interface MedicalCalledTicket {
  id: string;
  prefix: string;
  ticket_number: number;
  priority_type: 'normal' | 'preferencial';
  room_label: string | null;
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
    return { error: 'Não foi possível carregar os pacientes aguardando agora.', tickets: [] as WaitingTicket[] };
  }

  return { error: null, tickets: (tickets ?? []) as WaitingTicket[] };
}

async function getLatestMedicalCalls(limit = 5) {
  const supabase = createSupabaseServerClient();

  const { data: calls, error: callsError } = await supabase
    .from('calls')
    .select('ticket_id,room_label,called_at')
    .or('room_label.ilike.Consultório %,room_label.ilike.Sala %')
    .order('called_at', { ascending: false })
    .limit(limit);

  if (callsError || !calls || calls.length === 0) {
    return [] as MedicalCalledTicket[];
  }

  const ticketIds = calls.map((call) => call.ticket_id);

  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id,prefix,ticket_number,priority_type')
    .in('id', ticketIds);

  if (ticketsError || !tickets) {
    return [] as MedicalCalledTicket[];
  }

  const ticketMap = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  return calls
    .map((call) => {
      const ticket = ticketMap.get(call.ticket_id);
      if (!ticket) {
        return null;
      }

      return {
        id: ticket.id,
        prefix: ticket.prefix,
        ticket_number: ticket.ticket_number,
        priority_type: ticket.priority_type,
        room_label: call.room_label,
      } as MedicalCalledTicket;
    })
    .filter((call): call is MedicalCalledTicket => Boolean(call));
}

export default async function MedicoPage() {
  const [{ error, tickets }, medicalCalledTickets] = await Promise.all([
    getWaitingTickets(),
    getLatestMedicalCalls(5),
  ]);

  const nextNormal = tickets.find((ticket) => ticket.priority_type === 'normal');
  const nextPriority = tickets.find((ticket) => ticket.priority_type === 'preferencial');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tela do Médico"
        description="Selecione o consultório e chame pacientes para atendimento clínico."
      />

      <Card>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Ações de chamada para consultório</h2>
        <MedicoCallControls />
      </Card>

      {error ? (
        <Card role="alert" className="border-rose-200 bg-rose-50">
          <p className="text-lg font-medium text-rose-700">{error}</p>
        </Card>
      ) : null}

      <section aria-label="Próximas senhas" className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900 text-white">
          <h2 className="text-xl font-semibold">Próxima senha normal</h2>
          <p className="mt-4 text-6xl font-extrabold tracking-widest">
            {nextNormal ? formatTicketCode(nextNormal.prefix, nextNormal.ticket_number) : '---'}
          </p>
        </Card>

        <Card className="bg-brand-700 text-white">
          <h2 className="text-xl font-semibold">Próxima senha preferencial</h2>
          <p className="mt-4 text-6xl font-extrabold tracking-widest">
            {nextPriority ? formatTicketCode(nextPriority.prefix, nextPriority.ticket_number) : '---'}
          </p>
        </Card>
      </section>

      <section aria-labelledby="medico-aguardando-heading">
        <h2 id="medico-aguardando-heading" className="text-2xl font-bold text-slate-900">
          Pacientes aguardando
        </h2>

        {tickets.length === 0 ? (
          <Card className="mt-4">
            <p className="text-xl text-slate-700">Nenhum paciente aguardando no momento.</p>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de pacientes aguardando">
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

      <section aria-labelledby="medico-chamados-heading">
        <h2 id="medico-chamados-heading" className="text-2xl font-bold text-slate-900">
          Últimas chamadas para consultório
        </h2>

        {medicalCalledTickets.length === 0 ? (
          <Card className="mt-4">
            <p className="text-xl text-slate-700">Nenhuma chamada de consultório registrada ainda.</p>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Lista de pacientes já chamados para consultório">
            {medicalCalledTickets.map((ticket) => (
              <li key={`${ticket.id}-${ticket.room_label ?? 'sem-sala'}`}>
                <Card className="text-center">
                  <p className="text-4xl font-extrabold tracking-widest text-slate-900">
                    {formatTicketCode(ticket.prefix, ticket.ticket_number)}
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-700">{ticket.room_label ?? 'Consultório não informado'}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
