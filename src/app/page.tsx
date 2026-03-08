import Link from 'next/link';
import { Ticket, Users, Monitor, BarChart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 text-center">

      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl font-extrabold text-medical-dark tracking-tight">
          FilaFácil <span className="text-medical-primary">Acessível</span>
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Plataforma de gestão de filas para ambientes de saúde,
          focada em acessibilidade para pessoas com deficiência e idosos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

        {/* Totem Patient Button */}
        <Link href="/totem" className="group">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl shadow-sm border border-slate-100 btn-magnetic h-full">
            <div className="h-16 w-16 bg-medical-light text-medical-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-medical-primary group-hover:text-white transition-colors">
              <Ticket size={32} />
            </div>
            <h2 className="text-2xl font-bold text-medical-dark mb-2">Gerar Senha</h2>
            <p className="text-slate-500 text-sm">Interface de autoatendimento para pacientes</p>
          </div>
        </Link>

        {/* Attendant Button */}
        <Link href="/atendente" className="group">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl shadow-sm border border-slate-100 btn-magnetic h-full">
            <div className="h-16 w-16 bg-medical-light text-medical-accent rounded-2xl flex items-center justify-center mb-4 group-hover:bg-medical-accent group-hover:text-white transition-colors">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-medical-dark mb-2">Painel de Atendimento</h2>
            <p className="text-slate-500 text-sm">Interface para os profissionais de saúde</p>
          </div>
        </Link>

        {/* Public Panel Button */}
        <Link href="/painel-chamada" className="group">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl shadow-sm border border-slate-100 btn-magnetic h-full">
            <div className="h-16 w-16 bg-medical-light text-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-slate-700 group-hover:text-white transition-colors">
              <Monitor size={32} />
            </div>
            <h2 className="text-2xl font-bold text-medical-dark mb-2">Painel Público</h2>
            <p className="text-slate-500 text-sm">Telão de chamadas para a sala de espera</p>
          </div>
        </Link>

        {/* Admin Dashboard Button */}
        <Link href="/admin" className="group">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-4xl shadow-sm border border-slate-100 btn-magnetic h-full">
            <div className="h-16 w-16 bg-medical-light text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BarChart size={32} />
            </div>
            <h2 className="text-2xl font-bold text-medical-dark mb-2">Dashboard Admin</h2>
            <p className="text-slate-500 text-sm">Estatísticas e tempo médio de espera</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
