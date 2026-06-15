import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PortalProfile({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const full_name = formData.get('nome') as string;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name }
      });
      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Meu Perfil</h1>
      <p className="text-slate-500 mb-8">Atualize seus dados de identificação.</p>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">E-mail</label>
          <input disabled value={user?.email || ''} className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 outline-none cursor-not-allowed" />
          <p className="text-[10px] text-slate-400 italic">O e-mail não pode ser alterado através deste portal.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Nome Completo</label>
          <input
            required
            name="nome"
            type="text"
            defaultValue={user?.user_metadata?.full_name || ''}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Como você quer ser chamado?"
          />
        </div>
        <div className="pt-2 space-y-3">
          <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
            Salvar Alterações
          </button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-slate-500 text-sm font-semibold hover:underline">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
