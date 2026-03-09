'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BellRing, DoorOpen, ListTodo, Info } from 'lucide-react';


type Ticket = {
  id: string;
  ticket_number: string;
  status: string;
  created_at: string;
};

type LatestCall = {
  called_at: string;
  room_label?: string | null;
  tickets?: Ticket | null;
};

export default function PainelChamadaPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [nextTickets, setNextTickets] = useState<Ticket[]>([]);
  const [time, setTime] = useState<string>('');
  const [currentDestination, setCurrentDestination] = useState<string>('Sala 1');

  const fetchTickets = async () => {
    // Fetch last called ticket based on call log (supports room_label from atendente/médico)
    const { data: latestCallData } = await supabase
      .from('calls')
      .select('called_at,room_label,tickets(id,ticket_number,status,created_at)')
      .order('called_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestCall = latestCallData as LatestCall | null;

    if (latestCall?.tickets) {
      if (latestCall.tickets.id !== currentTicket?.id) {
        setCurrentTicket(latestCall.tickets);
        // Accessibility audio cue would go here (e.g., play chime)
      }

      setCurrentDestination(latestCall.room_label ?? 'Sala 1');
    }

    // Fetch next waiting tickets (limit 4 for display)
    const { data: waitingData } = await supabase
      .from('tickets')
      .select('*')
      .in('status', ['waiting', 'aguardando'])
      .order('created_at', { ascending: true })
      .limit(4);

    if (waitingData) setNextTickets(waitingData);
  };

  useEffect(() => {
    // Initial fetch
    fetchTickets();

    // Setup polling every 3 seconds as requested
    const intervalId = setInterval(fetchTickets, 3000);

    // Clock interval
    const clockId = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(clockId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTicket]);

  return (
    <div className="flex flex-col min-h-screen -mt-8 -mx-6 bg-medical-light/30">

      {/* Header Panel */}
      <header className="flex items-center justify-between bg-white border-b border-medical-primary/10 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-medical-primary flex size-14 shrink-0 items-center justify-center bg-medical-primary/10 rounded-xl">
            <span className="material-symbols-outlined text-4xl">medical_services</span>
          </div>
          <div>
            <h2 className="text-slate-900 text-2xl lg:text-3xl font-bold leading-tight tracking-tight">FilaFácil Acessível</h2>
            <p className="text-slate-500 font-medium">Painel de Atendimento Público</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 text-slate-700">
          <div className="flex flex-col items-end">
            <span className="text-4xl font-bold text-medical-dark">{time || '--:--'}</span>
            <span className="text-sm uppercase tracking-widest opacity-80">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-10 gap-8 h-full">

        {/* Main Current Call - aria-live polite will actively announce changes */}
        <div
          aria-live="polite"
          className="flex-1 flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-medical-primary/20 shadow-2xl p-8 relative overflow-hidden transition-all"
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 p-12 opacity-5 text-medical-primary">
            <BellRing size={200} />
          </div>

          <div className="text-center z-10 w-full">
            <span className="inline-block px-8 py-3 rounded-full bg-medical-primary/10 text-medical-primary font-bold tracking-widest uppercase mb-8">
              SENHA ATUAL
            </span>
            <h1 className="text-medical-dark text-[100px] sm:text-[140px] lg:text-[200px] font-black leading-none mb-4 tracking-tighter drop-shadow-sm transition-all">
              {currentTicket ? currentTicket.ticket_number : '---'}
            </h1>

            {currentTicket && (
              <div className="flex items-center justify-center gap-6 mt-12 bg-slate-50 py-8 px-12 rounded-3xl border border-slate-100 shadow-sm mx-auto max-w-2xl">
                <DoorOpen size={64} className="text-medical-accent" />
                <div className="text-left">
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-xl">Local de Atendimento</p>
                  <h2 className="text-medical-dark text-5xl font-extrabold flex items-center gap-4">
                    {currentDestination} <span className="bg-medical-accent text-white text-sm px-3 py-1 rounded-full uppercase tracking-wider">Atendimento</span>
                  </h2>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-8 flex items-center gap-3 text-slate-400">
            <Info size={24} />
            <p className="font-medium">Sinal sonoro ativado para novas chamadas</p>
          </div>
        </div>

        {/* Next Tickets Sidebar */}
        <div className="w-full lg:w-[480px] flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg flex-1 flex flex-col overflow-hidden">

            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-800 font-bold text-xl flex items-center gap-3">
                <ListTodo className="text-medical-primary" size={28} />
                Próximas Senhas
              </h3>
              <span className="bg-medical-primary/10 text-medical-primary text-sm px-3 py-1 rounded-full font-bold">EM ESPERA</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {nextTickets.length === 0 ? (
                <p className="text-center text-slate-400 mt-10 text-lg">Nenhuma senha em espera.</p>
              ) : (
                nextTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-l-8 border-slate-300 transition-all">
                    <div>
                      <p className="text-slate-800 text-4xl font-bold">{ticket.ticket_number}</p>
                      <p className="text-slate-500 font-bold uppercase mt-2 tracking-wider">
                        Em Espera...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
