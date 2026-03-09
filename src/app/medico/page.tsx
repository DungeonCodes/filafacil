'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/ui/page-header';

type Specialty = 'Clínico Geral' | 'Pediatria' | 'Exames';

type TicketRecord = {
  id: string;
  ticket_number: string;
  status: string;
  created_at?: string;
};

type CallRecord = {
  id: string;
  called_at: string;
  room_label?: string | null;
  ticket_id?: string;
  tickets?: { ticket_number: string } | { ticket_number: string }[] | null;
};

const consultorioOptions = Array.from({ length: 10 }, (_, index) => String(index + 1).padStart(3, '0'));
const specialtyOptions: Specialty[] = ['Clínico Geral', 'Pediatria', 'Exames'];

function normalizeCallTicket(call: CallRecord) {
  if (!call.tickets) return null;
  return Array.isArray(call.tickets) ? call.tickets[0] ?? null : call.tickets;
}

export default function MedicoPage() {
  const [consultorio, setConsultorio] = useState('001');
  const [specialty, setSpecialty] = useState<Specialty>('Clínico Geral');
  const [nextTicket, setNextTicket] = useState<TicketRecord | null>(null);
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roomLabel = useMemo(() => `Consultório ${consultorio}`, [consultorio]);

  const getQueueId = async () => {
    const { data } = await supabase.from('queues').select('id').eq('name', specialty).maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  };

  const fetchNextTicket = async (queueId: string) => {
    const { data } = await supabase
      .from('tickets')
      .select('id,ticket_number,status,created_at')
      .eq('queue_id', queueId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    return (data as TicketRecord | null) ?? null;
  };

  const fetchRecentCalls = async () => {
    const { data } = await supabase
      .from('calls')
      .select('id,called_at,room_label,ticket_id,tickets(ticket_number)')
      .eq('room_label', roomLabel)
      .order('called_at', { ascending: false })
      .limit(5);

    setRecentCalls((data as CallRecord[]) ?? []);
  };

  const refreshData = async () => {
    const queueId = await getQueueId();
    if (!queueId) {
      setNextTicket(null);
      setError('Especialidade não encontrada nas filas.');
      return;
    }

    setError('');
    const upcoming = await fetchNextTicket(queueId);
    setNextTicket(upcoming);
    await fetchRecentCalls();
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultorio, specialty]);

  const handleCall = async () => {
    setIsLoading(true);
    setFeedback('');
    setError('');

    try {
      const queueId = await getQueueId();
      if (!queueId) {
        setError('Fila da especialidade não encontrada.');
        return;
      }

      const ticket = await fetchNextTicket(queueId);
      if (!ticket) {
        setError(`Não há senha aguardando para ${specialty}.`);
        return;
      }

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'called', called_at: new Date().toISOString() })
        .eq('id', ticket.id)
        .eq('status', 'waiting');

      if (updateError) {
        setError('Não foi possível atualizar o status da senha.');
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
        setFeedback(`${ticket.ticket_number} chamada para ${roomLabel}.`);
      }

      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Tela do Médico" description="Selecione especialidade e consultório para chamar a próxima senha." />

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <label htmlFor="specialty" className="mb-2 block text-base font-semibold text-slate-900">
            Especialidade / categoria
          </label>
          <select
            id="specialty"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value as Specialty)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            {specialtyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
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
        </div>
      </section>

      <button
        type="button"
        onClick={handleCall}
        disabled={isLoading}
        className="w-full rounded-2xl bg-brand-600 px-6 py-6 text-xl font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Chamando...' : 'Chamar próxima senha'}
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Próxima senha ({specialty})</h2>
        <p className="mt-3 text-5xl font-black text-slate-900">{nextTicket?.ticket_number ?? '---'}</p>
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
                <span className="text-lg font-semibold text-slate-900">{normalizeCallTicket(call)?.ticket_number ?? '---'}</span>
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
