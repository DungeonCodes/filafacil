'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/ui/page-header';

type PriorityType = 'normal' | 'preferencial';

type QueueRecord = { id: string };
type TicketRecord = {
  id: string;
  ticket_number: string | number;
  prefix?: string | null;
  priority_type?: PriorityType;
  status: string;
  created_at?: string;
  issued_at?: string;
};

type CallRecord = {
  id: string;
  called_at: string;
  room_label?: string | null;
  ticket_id?: string;
  tickets?:
    | {
        ticket_number: string | number;
        prefix?: string | null;
      }
    | {
        ticket_number: string | number;
        prefix?: string | null;
      }[]
    | null;
};

function formatTicketLabel(ticket: Pick<TicketRecord, 'ticket_number' | 'prefix'> | null | undefined) {
  if (!ticket) return '---';

  if (ticket.prefix && typeof ticket.ticket_number === 'number') {
    return `${ticket.prefix}${String(ticket.ticket_number).padStart(3, '0')}`;
  }

  return String(ticket.ticket_number);
}

const consultorioOptions = Array.from({ length: 10 }, (_, index) => String(index + 1).padStart(3, '0'));

export default function MedicoPage() {
  const [consultorio, setConsultorio] = useState('001');
  const [nextNormal, setNextNormal] = useState<TicketRecord | null>(null);
  const [nextPreferencial, setNextPreferencial] = useState<TicketRecord | null>(null);
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loadingType, setLoadingType] = useState<PriorityType | null>(null);

  const roomLabel = useMemo(() => `Consultório ${consultorio}`, [consultorio]);

  const getQueueId = async () => {
    const { data: queueByCode } = await supabase.from('queues').select('id').eq('code', 'GERAL').maybeSingle();
    if (queueByCode) return (queueByCode as QueueRecord).id;

    const { data: queueByName } = await supabase
      .from('queues')
      .select('id')
      .in('name', ['GERAL', 'Clínico Geral'])
      .limit(1)
      .maybeSingle();

    return (queueByName as QueueRecord | null)?.id ?? null;
  };

  const fetchNextTicket = async (queueId: string, priorityType: PriorityType) => {
    const { data } = await supabase
      .from('tickets')
      .select('id,ticket_number,prefix,priority_type,status,created_at,issued_at')
      .eq('queue_id', queueId)
      .eq('priority_type', priorityType)
      .in('status', ['aguardando', 'waiting'])
      .order('issued_at', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    return (data as TicketRecord | null) ?? null;
  };

  const fetchRecentCalls = async () => {
    const { data } = await supabase
      .from('calls')
      .select('id,called_at,room_label,ticket_id,tickets(ticket_number,prefix)')
      .eq('room_label', roomLabel)
      .order('called_at', { ascending: false })
      .limit(5);

    const parsedCalls = ((data as CallRecord[]) ?? []).map((call) => ({
      ...call,
      tickets: Array.isArray(call.tickets) ? call.tickets[0] ?? null : call.tickets ?? null,
    }));

    setRecentCalls(parsedCalls.filter((call) => Boolean(call.ticket_id)));
  };

  const refreshData = async () => {
    const queueId = await getQueueId();

    if (!queueId) {
      setError('Fila GERAL não encontrada. Verifique o cadastro da fila.');
      setNextNormal(null);
      setNextPreferencial(null);
      return;
    }

    setError('');

    const [normal, preferencial] = await Promise.all([
      fetchNextTicket(queueId, 'normal'),
      fetchNextTicket(queueId, 'preferencial'),
    ]);

    setNextNormal(normal);
    setNextPreferencial(preferencial);
    await fetchRecentCalls();
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultorio]);

  const handleCallTicket = async (priorityType: PriorityType) => {
    setLoadingType(priorityType);
    setFeedback('');
    setError('');

    try {
      const queueId = await getQueueId();
      if (!queueId) {
        setError('Fila GERAL não encontrada.');
        return;
      }

      const ticket = await fetchNextTicket(queueId, priorityType);
      if (!ticket) {
        setError(`Não há senha ${priorityType} aguardando no momento.`);
        return;
      }

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'chamada', called_at: new Date().toISOString() })
        .eq('id', ticket.id)
        .in('status', ['aguardando', 'waiting']);

      if (updateError) {
        setError('Não foi possível atualizar a senha para chamada.');
        return;
      }

      const { error: callError } = await supabase.from('calls').insert({
        ticket_id: ticket.id,
        called_at: new Date().toISOString(),
        room_label: roomLabel,
        called_by: 'Médico',
      });

      if (callError) {
        setError('Senha chamada, mas falhou ao registrar destino.');
      } else {
        setFeedback(`${formatTicketLabel(ticket)} chamada para ${roomLabel}.`);
      }

      await refreshData();
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Tela do Médico" description="Selecione o consultório e chame a próxima senha para atendimento." />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="consultorio" className="mb-2 block text-base font-semibold text-slate-900">
          Consultório
        </label>
        <select
          id="consultorio"
          value={consultorio}
          onChange={(event) => setConsultorio(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          {consultorioOptions.map((option) => (
            <option key={option} value={option}>
              Consultório {option}
            </option>
          ))}
        </select>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => handleCallTicket('normal')}
          disabled={Boolean(loadingType)}
          className="rounded-2xl bg-brand-600 px-6 py-6 text-xl font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loadingType === 'normal' ? 'Chamando...' : 'Chamar próxima normal'}
        </button>
        <button
          type="button"
          onClick={() => handleCallTicket('preferencial')}
          disabled={Boolean(loadingType)}
          className="rounded-2xl bg-emerald-600 px-6 py-6 text-xl font-bold text-white transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loadingType === 'preferencial' ? 'Chamando...' : 'Chamar próxima preferencial'}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Próxima senha normal</h2>
          <p className="mt-3 text-5xl font-black text-slate-900">{formatTicketLabel(nextNormal)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Próxima senha preferencial</h2>
          <p className="mt-3 text-5xl font-black text-slate-900">{formatTicketLabel(nextPreferencial)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Últimas chamadas do consultório</h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">Destino atual: {roomLabel}</p>
        {recentCalls.length === 0 ? (
          <p className="text-slate-500">Ainda não há chamadas para este consultório.</p>
        ) : (
          <ul className="space-y-3" aria-live="polite">
            {recentCalls.map((call) => (
              <li key={call.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-lg font-semibold text-slate-900">{formatTicketLabel(call.tickets as TicketRecord)}</span>
                <span className="text-sm text-slate-600">
                  {new Date(call.called_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {feedback ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{feedback}</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</p> : null}
    </div>
  );
}
