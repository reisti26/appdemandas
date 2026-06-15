import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { List, Clock, CheckCircle, Map, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    total: 0, pendentes: 0, concluidas: 0, bairroChart: [], statusChart: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.from('demandas').select('status, bairro').is('deleted_at', null);
      if (error || !data) return;

      const byBairro = data.reduce((acc: any, d: any) => {
        acc[d.bairro] = (acc[d.bairro] || 0) + 1;
        return acc;
      }, {});
      const chartData: any = Object.keys(byBairro).map(name => ({ name, value: byBairro[name] }));

      const byStatus = data.reduce((acc: any, d: any) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {});
      const statusChartData: any = Object.keys(byStatus).map(name => ({ name, total: byStatus[name] }));

      setDashboardStats({
        total: data.length,
        pendentes: data.filter(d => d.status !== 'Concluída' && d.status !== 'Arquivada').length,
        concluidas: data.filter(d => d.status === 'Concluída').length,
        bairroChart: chartData,
        statusChart: statusChartData
      });
    };
    fetchStats();
  }, []);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#64748b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Demandas', value: dashboardStats.total, icon: List, color: 'text-blue-600', bColor: 'bg-blue-50' },
          { label: 'Em Aberto', value: dashboardStats.pendentes, icon: Clock, color: 'text-yellow-600', bColor: 'bg-yellow-50' },
          { label: 'Resolvidas', value: dashboardStats.concluidas, icon: CheckCircle, color: 'text-green-600', bColor: 'bg-green-50' }
        ].map((s, i) => {
            const Icon = s.icon;
            return (
                <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4 bg-white/30">
                    <div className={`${s.bColor} ${s.color} p-4 rounded-xl`}>
                        <Icon />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl bg-white/30">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Map className="text-primary" /> Demandas por Bairro
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardStats.bairroChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl bg-white/30">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="text-primary" /> Evolução por Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardStats.statusChart}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                >
                  {dashboardStats.statusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {dashboardStats.statusChart.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  {s.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
