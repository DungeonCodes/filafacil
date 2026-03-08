import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatTicketCode } from '@/lib/ticket';

interface CalledTicket {
  prefix: string;
  ticket_number: number;
  priority_type: 'normal' | 'preferencial';
  room_label: string | null;
}

function getDestinationMessage(roomLabel: string | null) {
  if (!roomLabel) {
    return 'Aguarde orientação da equipe.';
  }

  const normalizedLabel = roomLabel.trim();

  if (/^guichê\s+/i.test(normalizedLabel)) {
    const number = normalizedLabel.replace(/^guichê\s+/i, '');
    return `Dirija-se ao guichê ${number}.`;
  }

  if (/^consultório\s+/i.test(normalizedLabel)) {
    const number = normalizedLabel.replace(/^consultório\s+/i, '');
    return `Dirija-se ao consultório ${number}.`;
  }

  if (/^sala\s+/i.test(normalizedLabel)) {
    const number = normalizedLabel.replace(/^sala\s+/i, '');
    return `Dirija-se à sala ${number}.`;
  }

  return `Dirija-se ao ${normalizedLabel.toLowerCase()}.`;
}

async function getLastCalledTickets(limit = 5) {
  const supabase = createSupabaseServerClient();

  const { data: calls, error: callsError } = await supabase
    .from('calls')
    .select('ticket_id,room_label,called_at')
    .order('called_at', { ascending: false })
    .limit(limit);

  if (callsError || !calls || calls.length === 0) {
    return [] as CalledTicket[];
  }

  const ticketIds = calls.map((call) => call.ticket_id);

  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id,prefix,ticket_number,priority_type')
    .in('id', ticketIds);

  if (ticketsError || !tickets) {
    return [] as CalledTicket[];
  }

  const ticketMap = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  return calls
    .map((call) => {
      const ticket = ticketMap.get(call.ticket_id);
      if (!ticket) {
        return null;
      }

      return {
        prefix: ticket.prefix,
        ticket_number: ticket.ticket_number,
        priority_type: ticket.priority_type,
        room_label: call.room_label,
      } as CalledTicket;
    })
    .filter((call): call is CalledTicket => Boolean(call));
}

export default async function PainelChamadaPage() {
  const lastCalledTickets = await getLastCalledTickets(5);
  const currentCalledTicket = lastCalledTickets[0] ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel de Chamada"
        description="Acompanhe as senhas chamadas e dirija-se ao local indicado."
      />

      <Card className="border-brand-200 bg-brand-50 text-center">
        <h2 className="text-2xl font-bold text-brand-900">Agora chamando</h2>
        <p className="mt-3 text-7xl font-extrabold tracking-widest text-brand-700" aria-live="polite">
          {currentCalledTicket
            ? formatTicketCode(currentCalledTicket.prefix, currentCalledTicket.ticket_number)
            : '---'}
        </p>
        <p className="mt-3 text-2xl font-semibold text-brand-900">
          {getDestinationMessage(currentCalledTicket?.room_label ?? null)}
        </p>
      </Card>

      <section aria-labelledby="ultimas-chamadas-heading">
        <h2 id="ultimas-chamadas-heading" className="text-2xl font-bold text-slate-900">
          Últimas chamadas
        </h2>

        {lastCalledTickets.length === 0 ? (
          <Card className="mt-4">
            <p className="text-xl text-slate-700">Nenhuma chamada registrada ainda.</p>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Histórico das últimas chamadas">
            {lastCalledTickets.map((ticket, index) => (
              <li key={`${ticket.prefix}-${ticket.ticket_number}-${index}`}>
                <Card className="text-center">
                  <p className="text-4xl font-extrabold tracking-widest text-slate-900">
                    {formatTicketCode(ticket.prefix, ticket.ticket_number)}
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-700">
                    {getDestinationMessage(ticket.room_label)}
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
