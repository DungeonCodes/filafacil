'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Clock, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    averageWaitTime: 0,
    finishedTickets: 0,
  });

  const [serviceDistribution, setServiceDistribution] = useState<Array<{ name: string; Atendimentos: number }>>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      // Fetch all tickets for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: tickets } = await supabase
        .from('tickets')
        .select('*, queues(name)')
        .gte('created_at', today.toISOString());

      if (tickets) {
        const total = tickets.length;
        const finished = tickets.filter(t => t.status === 'finished' || t.status === 'called').length;

        // Calculate average wait time (for called/finished tickets)
        let totalWaitMs = 0;
        let waitCount = 0;

        const distributionMap: Record<string, number> = {};

        tickets.forEach(t => {
          // Time calc
          if (t.called_at && t.created_at) {
            const waitMs = new Date(t.called_at).getTime() - new Date(t.created_at).getTime();
            totalWaitMs += waitMs;
            waitCount++;
          }

          // Distribution calc
          const queueName = t.queues?.name || 'Desconhecido';
          distributionMap[queueName] = (distributionMap[queueName] || 0) + 1;
        });

        const avgWaitMins = waitCount > 0 ? Math.round(totalWaitMs / waitCount / 60000) : 0;

        setStats({
          totalTickets: total,
          finishedTickets: finished,
          averageWaitTime: avgWaitMins,
        });

        // Format for Recharts
        const distData = Object.keys(distributionMap).map(key => ({
          name: key,
          Atendimentos: distributionMap[key]
        }));
        setServiceDistribution(distData);
      }
    }

    fetchAnalytics();
  }, []);

  // Mock data for the line chart (Waiting Time Trend)
  const waitTimeTrend = [
    { time: '08:00', wait: 5 },
    { time: '10:00', wait: 12 },
    { time: '12:00', wait: 25 },
    { time: '14:00', wait: 18 },
    { time: '16:00', wait: 15 },
    { time: '18:00', wait: 8 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      <PageHeader
        title="Analytics Dashboard"
        description="Acompanhamento em tempo real da central de filas"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Total Gerado (Hoje)</p>
            <h3 className="text-4xl font-black text-medical-dark">{stats.totalTickets}</h3>
          </div>
          <div className="size-16 rounded-2xl bg-medical-light text-medical-primary flex items-center justify-center">
            <Users size={32} />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Tempo Médio de Espera</p>
            <h3 className="text-4xl font-black text-medical-dark flex items-end gap-2">
              {stats.averageWaitTime} <span className="text-lg font-bold text-slate-400 mb-1">min</span>
            </h3>
          </div>
          <div className="size-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={32} />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Atendimentos Iniciados</p>
            <h3 className="text-4xl font-black text-medical-dark">{stats.finishedTickets}</h3>
          </div>
          <div className="size-16 rounded-2xl bg-medical-accent/10 text-medical-accent flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-medical-primary" />
            <h4 className="font-bold text-xl text-medical-dark">Evolução do Tempo de Espera</h4>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitTimeTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="wait" stroke="#005bb5" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-medical-primary" />
            <h4 className="font-bold text-xl text-medical-dark">Atendimentos por Setor</h4>
          </div>
          <div className="h-72 w-full text-xs">
            {serviceDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Aguardando dados...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Atendimentos" fill="#005bb5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
