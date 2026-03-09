'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BellRing, DoorOpen, History, Info, Stethoscope } from 'lucide-react';

type Ticket = {
  id: string;
  ticket_number: string;
  status: string;
  created_at: string;
};

type CallItem = {
  id: string;
  called_at: string;
  called_by?: string | null;
  room_label?: string | null;
  tickets?: Ticket | Ticket[] | null;
};

function normalizeTicket(call: CallItem): Ticket | null {
  if (!call.tickets) return null;
  return Array.isArray(call.tickets) ? call.tickets[0] ?? null : call.tickets;
}

export default function PainelChamadaPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [nextTickets, setNextTickets] = useState<Ticket[]>([]);
  const [lastCalls, setLastCalls] = useState<Array<CallItem & { ticket: Ticket | null }>>([]);
  const [time, setTime] = useState<string>('');
  const [currentDestination, setCurrentDestination] = useState<string>('Sala 1');

  const destinationText = useMemo(() => {
    if (!currentDestination) return 'Dirija-se ao local indicado.';
    const lower = currentDestination.toLowerCase();
    const article = lower.startsWith('consultório') ? 'ao' : 'à';
    return `Dirija-se ${article} ${currentDestination}`;
  }, [currentDestination]);

  const fetchTickets = async () => {
    const { data: callsData } = await supabase
      .from('calls')
      .select('id,called_at,called_by,room_label,tickets(id,ticket_number,status,created_at)')
      .order('called_at', { ascending: false })
      .limit(6);

    const parsedCalls = ((callsData as CallItem[]) ?? []).map((call) => ({
      ...call,
      ticket: normalizeTicket(call),
    }));

    const validCalls = parsedCalls.filter((call) => Boolean(call.ticket));
    setLastCalls(validCalls);

    const latestCall = validCalls[0];
    if (latestCall?.ticket) {
      setCurrentTicket(latestCall.ticket);
      setCurrentDestination(latestCall.room_label ?? latestCall.called_by ?? 'Sala 1');
    }

    const { data: waitingData } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
      .limit(4);

    if (waitingData) setNextTickets(waitingData);
  };

  useEffect(() => {
    fetchTickets();

    const intervalId = setInterval(fetchTickets, 3000);
    const clockId = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(clockId);
    };
  }, []);

  return (
    <div className="flex min-h-screen -mx-6 -mt-8 flex-col bg-medical-light/30">
      <header className="flex items-center justify-between border-b border-medical-primary/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-medical-primary/10 text-medical-primary">
            <Stethoscope size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">FilaFácil Acessível</h2>
            <p className="font-medium text-slate-500">Painel de Atendimento Público</p>
          </div>
        </div>
        <div className="hidden items-center gap-4 text-slate-700 lg:flex">
          <div className="flex flex-col items-end">
            <span className="text-4xl font-bold text-medical-dark">{time || '--:--'}</span>
            <span className="text-sm uppercase tracking-widest opacity-80">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
            </span>
          </div>
        </div>
      </header>

      <main className="flex h-full flex-1 flex-col gap-8 p-6 lg:flex-row lg:p-10">
        <section
          aria-live="polite"
          className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[3rem] border-4 border-medical-primary/20 bg-white p-8 shadow-2xl transition-all"
        >
          <div className="absolute right-0 top-0 p-12 text-medical-primary opacity-5">
            <BellRing size={200} />
          </div>

          <div className="z-10 w-full text-center">
            <span className="mb-8 inline-block rounded-full bg-medical-primary/10 px-8 py-3 font-bold uppercase tracking-widest text-medical-primary">
              AGORA CHAMANDO
            </span>
            <h1 className="mb-4 text-[100px] font-black leading-none tracking-tighter text-medical-dark drop-shadow-sm transition-all sm:text-[140px] lg:text-[200px]">
              {currentTicket ? currentTicket.ticket_number : '---'}
            </h1>

            {currentTicket && (
              <div className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-6 rounded-3xl border border-slate-100 bg-slate-50 px-12 py-8 shadow-sm">
                <DoorOpen size={56} className="text-medical-accent" />
                <div className="text-left">
                  <p className="text-lg font-semibold uppercase tracking-wider text-slate-500">Local de Atendimento</p>
                  <h2 className="text-4xl font-extrabold text-medical-dark lg:text-5xl">{destinationText}</h2>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-8 flex items-center gap-3 text-slate-400">
            <Info size={24} />
            <p className="font-medium">Sinal sonoro ativado para novas chamadas</p>
          </div>
        </section>

        <aside className="flex w-full flex-col gap-6 lg:w-[480px]">
          <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <History className="text-medical-primary" size={28} />
                Últimas chamadas
              </h3>
              <span className="rounded-full bg-medical-primary/10 px-3 py-1 text-sm font-bold text-medical-primary">AO VIVO</span>
            </div>

            <div className="space-y-4 bg-white p-6">
              {lastCalls.length === 0 ? (
                <p className="mt-10 text-center text-lg text-slate-400">Nenhuma chamada recente.</p>
              ) : (
                lastCalls.slice(0, 5).map((call) => (
                  <div key={call.id} className="rounded-2xl border-l-8 border-medical-primary bg-slate-50 p-5">
                    <p className="text-3xl font-bold text-slate-800">{call.ticket?.ticket_number ?? '---'}</p>
                    <p className="mt-1 font-semibold text-slate-600">{call.room_label ?? call.called_by ?? 'Sala 1'}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(call.called_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-lg">
            <div className="border-b border-slate-100 bg-slate-50 p-4 text-sm font-bold uppercase tracking-wider text-slate-600">
              Próximas senhas em espera
            </div>
            <div className="space-y-3 p-4">
              {nextTickets.length === 0 ? (
                <p className="text-slate-400">Nenhuma senha em espera.</p>
              ) : (
                nextTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xl font-bold text-slate-800">{ticket.ticket_number}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
