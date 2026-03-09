'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PersonStanding, Megaphone, Forward, MoreVertical, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

type Ticket = {
  id: string;
  ticket_number: string;
  status: string;
  created_at: string;
};

export default function AtendentePage() {
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  const fetchTickets = async () => {
    // Current called ticket
    const { data: calledData } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'called')
      .order('called_at', { ascending: false })
      .limit(1)
      .single();

    if (calledData) setCurrentTicket(calledData);

    // Waiting list
    const { data: waitingData } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (waitingData) setWaitingTickets(waitingData);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCallNext = async () => {
    if (waitingTickets.length === 0) {
      alert("Não há senhas na fila de espera.");
      return;
    }

    setIsLoading(true);
    try {
      // Pick the oldest ticket from the list
      const nextTicket = waitingTickets[0];

      // Update ticket status to "called"
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'called', called_at: new Date().toISOString() })
        .eq('id', nextTicket.id);

      if (updateError) throw updateError;

      // Insert record into calls
      const { error: callError } = await supabase
        .from('calls')
        .insert({ ticket_id: nextTicket.id, called_by: 'Mesa 1' });

      if (callError) throw callError;

      // Keep previously called tickets available for downstream medical flow.
      await fetchTickets(); // Refresh states

    } catch (e) {
      console.error('Error calling next ticket:', e);
      alert('Erro ao chamar próxima senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatWaitTime = (createdAt: string) => {
    const diffMs = new Date().getTime() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 0 ? `${diffMins} min` : 'agora';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Painel de Atendimento"
        description="Gestão de chamadas e controle de fila atual"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Column - Current Call & Actions */}
        <div className="space-y-6">

          <section>
            <h4 className="text-medical-primary text-xs font-bold uppercase tracking-widest mb-3">Senha em Atendimento</h4>
            <div className="relative overflow-hidden rounded-[2rem] bg-medical-primary shadow-xl p-8 flex flex-col justify-between min-h-[220px]">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

              <div className="relative z-10">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Mesa 1
                </span>
                <h1 className="text-white text-6xl md:text-7xl font-black mt-4 tracking-tighter">
                  {currentTicket ? currentTicket.ticket_number : '---'}
                </h1>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="text-white/80" size={20} />
                  <p className="text-white text-xl font-semibold">Sala de Triagem</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <button
              onClick={handleCallNext}
              disabled={isLoading || waitingTickets.length === 0}
              className="flex w-full items-center justify-center gap-3 bg-medical-accent hover:bg-medical-accent/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl transition-all shadow-lg btn-magnetic"
            >
              <PersonStanding size={28} />
              <span className="text-xl font-bold">Chamar Próximo</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button disabled={!currentTicket} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 py-4 rounded-xl font-semibold transition-colors">
                <Megaphone size={20} />
                Rechamar
              </button>
              <button disabled={!currentTicket} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 py-4 rounded-xl font-semibold transition-colors">
                <Forward size={20} />
                Encaminhar
              </button>
            </div>
          </section>

        </div>

        {/* Right Column - Waiting List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h4 className="text-slate-600 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              Fila de Espera
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {waitingTickets.length}
              </span>
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {waitingTickets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>Nenhuma senha na fila.</p>
              </div>
            ) : (
              waitingTickets.map((ticket, index) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-medical-primary/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 font-bold text-sm">
                      {index + 1}º
                    </div>
                    <div>
                      <p className="text-lg font-bold group-hover:text-medical-primary transition-colors">
                        {ticket.ticket_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        Aguardando há {formatWaitTime(ticket.created_at)}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-medical-primary transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
