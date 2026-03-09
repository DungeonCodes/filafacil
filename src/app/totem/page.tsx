'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Stethoscope, Baby, Microscope, Volume2, Printer, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

type ServiceType = 'CG' | 'PD' | 'EX';

export default function TotemPage() {
  const [highContrast, setHighContrast] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<{ number: string; time: string; date: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTicket = async (type: ServiceType) => {
    setIsGenerating(true);

    try {
      const queueNames = {
        CG: 'Clínico Geral',
        PD: 'Pediatria',
        EX: 'Exames',
      };

      const now = new Date();
      const prefix = type;

      const { data: queueData } = await supabase
        .from('queues')
        .select('id')
        .eq('name', queueNames[type])
        .single();

      if (!queueData) {
        alert('Fila não encontrada para a especialidade selecionada.');
        return;
      }

      const { data: lastTicket } = await supabase
        .from('tickets')
        .select('ticket_number')
        .eq('queue_id', queueData.id)
        .eq('prefix', prefix)
        .order('ticket_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNumber = (lastTicket?.ticket_number ?? 0) + 1;
      const ticketNumber = nextNumber;
      const displayTicket = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

      const { error } = await supabase
        .from('tickets')
        .insert({
          queue_id: queueData.id,
          ticket_number: ticketNumber,
          prefix: prefix,
          priority_type: 'normal',
          status: 'aguardando',
        });

      if (error) {
        console.error('Error creating ticket:', error);
        alert('Erro ao gerar senha, tente novamente.');
        return;
      }

      setGeneratedTicket({
        number: displayTicket,
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('pt-BR'),
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedTicket(null);
  };

  return (
    <div className={`transition-all duration-300 ${highContrast ? 'bg-black text-white' : ''}`}>

      {/* Accessibility Control */}
      <div className="flex justify-end mb-6">
        <label className="flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alto Contraste</span>
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highContrast ? 'bg-medical-primary' : 'bg-slate-200'}`}>
            <input
              type="checkbox"
              className="sr-only"
              checked={highContrast}
              onChange={() => setHighContrast(!highContrast)}
              aria-label="Alternar alto contraste"
            />
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </label>
      </div>

      <PageHeader
        title="Gerar Senha"
        description="Toque na opção desejada para retirar seu ticket de atendimento"
      />

      {!generatedTicket ? (
        <div className="grid gap-4 max-w-2xl mx-auto mt-8">

          <button
            onClick={() => handleGenerateTicket('CG')}
            disabled={isGenerating}
            className={`flex items-center justify-between w-full p-6 rounded-2xl border-2 transition-all btn-magnetic
              ${highContrast ? 'bg-black border-white text-white hover:bg-white hover:text-black' : 'bg-white border-medical-primary/10 hover:border-medical-primary shadow-sm group'}`}
          >
            <div className="flex items-center gap-5">
              <div className={`size-16 flex items-center justify-center rounded-xl transition-colors
                ${highContrast ? 'border border-current' : 'bg-medical-primary/10 text-medical-primary group-hover:bg-medical-primary group-hover:text-white'}`}>
                <Stethoscope size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold">Clínico Geral</h3>
                <p className={highContrast ? 'opacity-80' : 'text-slate-500'}>Atendimento adulto geral</p>
              </div>
            </div>
            <ChevronRight size={32} className={highContrast ? '' : 'text-medical-primary/40 group-hover:text-medical-primary'} />
          </button>

          <button
            onClick={() => handleGenerateTicket('PD')}
            disabled={isGenerating}
            className={`flex items-center justify-between w-full p-6 rounded-2xl border-2 transition-all btn-magnetic
              ${highContrast ? 'bg-black border-white text-white hover:bg-white hover:text-black' : 'bg-white border-medical-primary/10 hover:border-medical-primary shadow-sm group'}`}
          >
            <div className="flex items-center gap-5">
              <div className={`size-16 flex items-center justify-center rounded-xl transition-colors
                ${highContrast ? 'border border-current' : 'bg-medical-primary/10 text-medical-primary group-hover:bg-medical-primary group-hover:text-white'}`}>
                <Baby size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold">Pediatria</h3>
                <p className={highContrast ? 'opacity-80' : 'text-slate-500'}>Atendimento infantil</p>
              </div>
            </div>
            <ChevronRight size={32} className={highContrast ? '' : 'text-medical-primary/40 group-hover:text-medical-primary'} />
          </button>

          <button
            onClick={() => handleGenerateTicket('EX')}
            disabled={isGenerating}
            className={`flex items-center justify-between w-full p-6 rounded-2xl border-2 transition-all btn-magnetic
              ${highContrast ? 'bg-black border-white text-white hover:bg-white hover:text-black' : 'bg-white border-medical-primary/10 hover:border-medical-primary shadow-sm group'}`}
          >
            <div className="flex items-center gap-5">
              <div className={`size-16 flex items-center justify-center rounded-xl transition-colors
                ${highContrast ? 'border border-current' : 'bg-medical-primary/10 text-medical-primary group-hover:bg-medical-primary group-hover:text-white'}`}>
                <Microscope size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold">Exames</h3>
                <p className={highContrast ? 'opacity-80' : 'text-slate-500'}>Coleta e diagnósticos</p>
              </div>
            </div>
            <ChevronRight size={32} className={highContrast ? '' : 'text-medical-primary/40 group-hover:text-medical-primary'} />
          </button>

        </div>
      ) : (
        <div className={`max-w-xl mx-auto mt-12 p-8 border-4 border-dashed rounded-[3rem] text-center shadow-xl relative overflow-hidden
          ${highContrast ? 'bg-black border-yellow-400' : 'bg-white border-medical-primary/30'}`}>

          <div className={`absolute top-0 left-0 w-full h-3 ${highContrast ? 'bg-yellow-400' : 'bg-medical-primary'}`}></div>

          <p className={`font-bold uppercase tracking-[0.2em] mb-4 ${highContrast ? 'text-yellow-400' : 'text-medical-primary'}`}>
            Sua Senha Gerada
          </p>

          <div className="text-7xl sm:text-9xl font-black mb-6 tracking-tighter">
            {generatedTicket.number}
          </div>

          <div className={`flex items-center justify-center gap-6 mb-8 font-semibold text-lg ${highContrast ? 'text-white' : 'text-slate-500'}`}>
            <span>{generatedTicket.time}</span>
            <span>{generatedTicket.date}</span>
          </div>

          <div className="flex flex-col gap-4">
            <button
              aria-label="Ouvir Senha em Áudio"
              className={`w-full font-bold py-5 rounded-2xl text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg
                ${highContrast ? 'bg-yellow-400 text-black' : 'bg-medical-primary text-white hover:bg-medical-primary/90'}`}
              onClick={() => alert('Reproduzindo áudio...')}
            >
              <Volume2 size={28} />
              OUVIR SENHA
            </button>
            <button
              className={`w-full font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-3
                ${highContrast ? 'bg-transparent border-2 border-white text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
              onClick={handleReset}
            >
              <Printer size={24} />
              IMPRIMIR / NOVA SENHA
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
