import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, FileSpreadsheet, FileText, ChevronRight, Inbox, MapPin, X, Trash2, Map } from 'lucide-react';
import { Badge, BadgeColor } from '../components/ui/Badge';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_OPTIONS = ["Recebida", "Em análise", "Encaminhada à prefeitura", "Em execução", "Concluída", "Arquivada", "Excluídas"];

export function AdminDemandasList() {
  const [demandas, setDemandas] = useState<any[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBairro, setFilterBairro] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDemanda, setSelectedDemanda] = useState<any>(null);
  
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchBairros = async () => {
      const { data } = await supabase.from('bairros').select('nome').order('nome', { ascending: true });
      if (data) setBairros(data.map(b => b.nome));
    };
    fetchBairros();
  }, []);

  const fetchDemandas = async () => {
    setLoading(true);
    try {
      let query = supabase.from('demandas').select('*', { count: 'exact' });

      if (filterStatus === 'Excluídas') {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
        if (filterStatus !== 'Todos') query = query.eq('status', filterStatus);
      }

      if (filterBairro !== 'Todos') {
        query = query.eq('bairro', filterBairro);
      }

      if (searchTerm) {
        query = query.or(`cidadao.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await query.order('id', { ascending: false }).range(from, to);
      if (error) throw error;
      setDemandas(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      alert(`Erro ao carregar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDemandas, 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm, filterBairro, filterStatus]);

  useEffect(() => setPage(0), [searchTerm, filterBairro, filterStatus]);

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from('demandas').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setDemandas(demandas.map(d => d.id === id ? { ...d, status: newStatus } : d));
      if (selectedDemanda && selectedDemanda.id === id) {
        setSelectedDemanda({ ...selectedDemanda, status: newStatus });
      }
    }
  };

  const deleteDemanda = async (id: number) => {
    const motivo = prompt('Por favor, informe o motivo da exclusão para registro e aviso ao cidadão:');
    if (!motivo) return;

    const { error } = await supabase.from('demandas')
      .update({
        deleted_at: new Date().toISOString(),
        motivo_exclusao: motivo.trim(),
        status: 'Excluída/Cancelada'
      })
      .eq('id', id);

    if (!error) {
      setDemandas(demandas.filter(d => d.id !== id));
      setTotalCount(prev => prev - 1);
      setSelectedDemanda(null);
    }
  };

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "Concluída": return "green";
      case "Em execução": return "blue";
      case "Em análise": return "yellow";
      case "Recebida": return "gray";
      case "Excluída/Cancelada": return "red";
      case "Excluídas": return "red";
      case "Encaminhada à prefeitura": return "purple";
      case "Arquivada": return "gray";
      default: return "blue";
    }
  };

  const getUrgenciaColor = (urg: string): BadgeColor => {
    switch (urg) {
      case "Crítica": return "red";
      case "Alta": return "yellow";
      case "Média": return "blue";
      default: return "gray";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cidadão ou problema..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap md:flex-nowrap w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select
            value={filterBairro}
            onChange={(e) => setFilterBairro(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none"
          >
            <option value="Todos">Todos os Bairros</option>
            {bairros.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none"
          >
            <option value="Todos">Todos os Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cidadão / Bairro</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo / Urgência</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demandas.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => setSelectedDemanda(d)}>
                <td className="px-6 py-5">
                  <p className="font-semibold text-slate-800">{d.cidadao}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> {d.bairro}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-medium text-slate-700">{d.tipo}</p>
                  <Badge color={getUrgenciaColor(d.urgencia)}>{d.urgencia}</Badge>
                </td>
                <td className="px-6 py-5">
                  <Badge color={getStatusColor(d.status)}>{d.status}</Badge>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs text-slate-500 font-medium">{new Date(d.registro).toLocaleDateString('pt-BR')}</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-all">
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {demandas.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Inbox size={48} strokeWidth={1} />
                    <p className="text-lg">Nenhuma demanda encontrada.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Mostrando <span className="font-bold">{demandas.length > 0 ? page * PAGE_SIZE + 1 : 0}</span> a <span className="font-bold">{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span> de <span className="font-bold">{totalCount}</span> resultados
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => (p + 1) * PAGE_SIZE < totalCount ? p + 1 : p)}
            disabled={(page + 1) * PAGE_SIZE >= totalCount}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>

      {selectedDemanda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDemanda(null)}></div>
          <div className="glass bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge color={getUrgenciaColor(selectedDemanda.urgencia)}>{selectedDemanda.urgencia}</Badge>
                <h3 className="text-2xl font-bold text-slate-800 mt-2">{selectedDemanda.tipo}</h3>
                <p className="text-slate-500 font-medium">Protocolo: #{selectedDemanda.id}</p>
              </div>
              <button onClick={() => setSelectedDemanda(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X />
              </button>
            </div>

            <div className="space-y-6">
              {selectedDemanda.deleted_at && selectedDemanda.motivo_exclusao && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Motivo da Exclusão / Cancelamento</p>
                  <p className="text-sm text-red-700 font-bold">{selectedDemanda.motivo_exclusao}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cidadão</p>
                  <p className="font-semibold text-slate-700">{selectedDemanda.cidadao}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bairro</p>
                  <p className="font-semibold text-slate-700">{selectedDemanda.bairro}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Endereço</p>
                <p className="font-semibold text-slate-700">{selectedDemanda.endereco || 'Não informado'}</p>
              </div>

              {selectedDemanda.latitude && selectedDemanda.longitude && (
                <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                   <MapContainer center={[selectedDemanda.latitude, selectedDemanda.longitude]} zoom={15} className="h-full w-full">
                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                     <Marker position={[selectedDemanda.latitude, selectedDemanda.longitude]} />
                   </MapContainer>
                </div>
              )}

              {selectedDemanda.anexo_url && (
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Anexo</p>
                   <a href={selectedDemanda.anexo_url} target="_blank" rel="noreferrer">
                       <img src={selectedDemanda.anexo_url} alt="Anexo do cidadão" className="w-full rounded-2xl max-h-64 object-cover border border-slate-200" />
                   </a>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Relato</p>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl italic border-l-4 border-primary">
                  "{selectedDemanda.descricao}"
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Alterar Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedDemanda.id, s)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selectedDemanda.status === s
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
              <button
                onClick={() => deleteDemanda(selectedDemanda.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
              >
                <Trash2 size={16} /> Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
