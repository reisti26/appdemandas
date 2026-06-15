import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClipboardList, RefreshCw, Star } from 'lucide-react';
import { Badge, BadgeColor } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export function PortalHistory({ user }: { user: any }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('demandas')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false });

    if (!error) {
      setHistory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleRating = async (id: number, rating: number) => {
    const { error } = await supabase
      .from('demandas')
      .update({ avaliacao: rating })
      .eq('id', id);
    
    if (!error) {
       setHistory(history.map(h => h.id === id ? { ...h, avaliacao: rating } : h));
    }
  };

  const getStatusColor = (status: string, deleted_at?: string): BadgeColor => {
      if (deleted_at) return 'red';
      if (status === 'Concluída') return 'green';
      if (status === 'Recebida') return 'blue';
      return 'amber';
  };

  return (
    <div className="glass p-8 md:p-10 rounded-3xl shadow-xl border-t-8 border-t-primary">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Minhas Solicitações</h2>
        <button onClick={fetchHistory} disabled={loading} className="text-primary hover:rotate-180 transition-all duration-500 disabled:opacity-50">
          <RefreshCw size={20} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      ) : history.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
            <ClipboardList size={32} />
          </div>
          <p className="text-slate-500">Você ainda não enviou nenhum relato logado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map(item => (
            <div key={item.id} className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-primary px-2 py-1 bg-primary/5 rounded-lg">#{item.id}</span>
                    <span className="text-sm font-bold text-slate-700">{item.tipo}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.bairro} • {new Date(item.registro).toLocaleDateString('pt-BR')}</p>
                </div>
                <Badge color={getStatusColor(item.status, item.deleted_at)}>
                    {item.deleted_at ? 'Cancelada' : item.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-2 italic">"{item.descricao}"</p>
              
              {item.anexo_url && (
                  <div className="mt-3">
                      <a href={item.anexo_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          Ver anexo anexado
                      </a>
                  </div>
              )}

              {item.deleted_at && item.motivo_exclusao && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Motivo do Gabinete</p>
                  <p className="text-xs text-red-700 font-medium">{item.motivo_exclusao}</p>
                </div>
              )}

              {item.status === 'Concluída' && !item.deleted_at && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Avalie o atendimento:</span>
                      <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                              <button 
                                key={star} 
                                onClick={() => handleRating(item.id, star)}
                                className={`${(item.avaliacao || 0) >= star ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-200'} transition-colors`}
                              >
                                  <Star size={16} fill={(item.avaliacao || 0) >= star ? 'currentColor' : 'none'} />
                              </button>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
