import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, MailCheck, ArrowLeft } from 'lucide-react';

export function AdminAuth() {
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md w-full text-center space-y-6 animate-bounce-in">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">E-mail Enviado!</h1>
          <p className="text-slate-500 text-sm">Se houver uma conta com este e-mail, enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e spam.</p>
          <button onClick={() => { setResetSent(false); setResetMode(false); }} className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-primary/20">
            Voltar para o Login
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
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{resetMode ? 'Redefinir Senha' : 'Painel Administrativo'}</h1>
          <p className="text-slate-500">{resetMode ? 'Enviaremos um link de recuperação' : 'Gabinete Digital - Login do Gestor'}</p>
        </div>

        {resetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">E-mail Cadastrado</label>
              <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="adm@exemplo.com" />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setResetMode(false)} className="text-sm text-slate-500 font-semibold hover:text-primary flex items-center justify-center gap-2 w-full">
                <ArrowLeft size={16} /> Voltar para o Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">E-mail</label>
              <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="adm@exemplo.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                <button type="button" onClick={() => setResetMode(true)} className="text-xs text-primary hover:underline font-semibold">Esqueceu a senha?</button>
              </div>
              <input required name="password" type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="••••••••" />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>
        )}
        
        <p className="mt-8 text-center text-xs text-slate-400 font-sans">
          Acesso restrito ao gabinete do vereador.
        </p>
      </div>
    </div>
  );
}
