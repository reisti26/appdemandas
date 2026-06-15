import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Plus, Trash2, Tag, MapPin } from 'lucide-react';

export function AdminConfig() {
  const [bairros, setBairros] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [newBairro, setNewBairro] = useState('');
  const [newTipo, setNewTipo] = useState('');
  const [loadingBairros, setLoadingBairros] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);

  useEffect(() => {
    fetchBairros();
    fetchTipos();
  }, []);

  const fetchBairros = async () => {
    const { data } = await supabase.from('bairros').select('*').order('nome', { ascending: true });
    if (data) setBairros(data);
  };

  const fetchTipos = async () => {
    const { data } = await supabase.from('tipos_demanda').select('*').order('nome', { ascending: true });
    if (data) setTipos(data);
  };

  const handleAddBairro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBairro.trim()) return;
    setLoadingBairros(true);
    
    const { error } = await supabase.from('bairros').insert([{ nome: newBairro.trim() }]);
    if (error) {
       alert(error.message);
    } else {
       setNewBairro('');
       fetchBairros();
    }
    setLoadingBairros(false);
  };

  const handleDeleteBairro = async (id: number) => {
    if (!confirm('Deseja realmente excluir este bairro?')) return;
    const { error } = await supabase.from('bairros').delete().eq('id', id);
    if (!error) fetchBairros();
  };

  const handleAddTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipo.trim()) return;
    setLoadingTipos(true);
    
    const { error } = await supabase.from('tipos_demanda').insert([{ nome: newTipo.trim() }]);
    if (error) {
       alert(error.message);
    } else {
       setNewTipo('');
       fetchTipos();
    }
    setLoadingTipos(false);
  };

  const handleDeleteTipo = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tipo de demanda?')) return;
    const { error } = await supabase.from('tipos_demanda').delete().eq('id', id);
    if (!error) fetchTipos();
  };

  return (
    <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
          <p className="text-slate-500">Gerencie tipos de demandas, bairros e permissões.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
        {/* Tipos de Demanda */}
        <div className="bg-white/50 p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Tag className="text-primary" size={20} /> Tipos de Demanda
            </h2>
            
            <form onSubmit={handleAddTipo} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newTipo} 
                    onChange={e => setNewTipo(e.target.value)} 
                    placeholder="Novo tipo..." 
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-primary"
                />
                <button disabled={loadingTipos} className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors">
                    <Plus size={24} />
                </button>
            </form>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {tipos.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="font-medium text-slate-700">{t.nome}</span>
                        <button onClick={() => handleDeleteTipo(t.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {tipos.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum tipo cadastrado.</p>}
            </div>
        </div>

        {/* Bairros */}
        <div className="bg-white/50 p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="text-primary" size={20} /> Bairros Atendidos
            </h2>
            
            <form onSubmit={handleAddBairro} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newBairro} 
                    onChange={e => setNewBairro(e.target.value)} 
                    placeholder="Novo bairro..." 
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-primary"
                />
                <button disabled={loadingBairros} className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors">
                    <Plus size={24} />
                </button>
            </form>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {bairros.map(b => (
                    <div key={b.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="font-medium text-slate-700">{b.nome}</span>
                        <button onClick={() => handleDeleteBairro(b.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {bairros.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum bairro cadastrado.</p>}
            </div>
        </div>

      </div>
    </div>
  );
}
