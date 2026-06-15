import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Key, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash containing the access token or if there's an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
         // Se não tiver sessão e não for hash de recovery, talvez redirecionar?
         // Vamos deixar a interface de erro do Supabase lidar com auth errors
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md w-full text-center space-y-6 animate-bounce-in">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Senha Atualizada!</h1>
          <p className="text-slate-500 text-sm">Sua senha foi redefinida com sucesso. Você já pode acessar a plataforma novamente com a nova senha.</p>
          <button onClick={() => navigate('/')} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
            Ir para o Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md w-full animate-bounce-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Key size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Criar Nova Senha</h1>
          <p className="text-slate-500 text-center text-sm">Digite a sua nova senha abaixo para recuperar o acesso à sua conta.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nova Senha</label>
            <input required name="password" type="password" minLength={6} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nova senha (mín. 6 caracteres)" />
          </div>
          <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
