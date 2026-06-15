import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, MailCheck, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function PortalAuth() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAuthSuccess(false);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        setAuthSuccess(true);
      } else {
        const password = formData.get('password') as string;
        
        if (authMode === 'login') {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          navigate('/');
        } else {
          const nome = formData.get('nome') as string;
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: nome }
            }
          });
          if (error) throw error;
          
          if (data?.session) {
             // Se o Supabase estiver configurado para não exigir confirmação de e-mail
             navigate('/');
          } else {
             // Exige confirmação
             setAuthSuccess(true);
          }
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authSuccess) {
    if (authMode === 'reset') {
       return (
        <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md mx-auto animate-bounce-in text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">E-mail Enviado!</h1>
          <p className="text-slate-500 text-sm">Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.</p>
          <button onClick={() => { setAuthSuccess(false); setAuthMode('login'); }} className="w-full bg-primary text-white py-4 rounded-2xl font-bold inline-block hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-primary/20">
            Voltar para o Login
          </button>
        </div>
      );
    }
    return (
      <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md mx-auto animate-bounce-in text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Verifique seu E-mail</h1>
        <p className="text-slate-500 text-sm">Conta criada com sucesso! Enviamos um link de confirmação para o seu e-mail. Você precisa clicar nele antes de conseguir fazer login.</p>
        <Link to="/" className="w-full bg-primary text-white py-4 rounded-2xl font-bold inline-block hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-primary/20">
          Voltar para o Início
        </Link>
      </div>
    );
  }

  return (
    <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-t-primary max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {authMode === 'login' ? 'Bem-vindo de volta' : authMode === 'register' ? 'Crie sua conta' : 'Redefinir Senha'}
      </h1>
      <p className="text-slate-500 mb-8">
        {authMode === 'login' ? 'Acompanhe suas solicitações e tenha voz ativa.' : authMode === 'register' ? 'Cadastre-se para gerenciar seus pedidos.' : 'Enviaremos um link de recuperação para o seu e-mail.'}
      </p>

      <form onSubmit={handleAuth} className="space-y-4">
        {authMode === 'register' && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nome Completo</label>
            <input required name="nome" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Como o vereador deve te chamar?" />
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">E-mail</label>
          <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="seu@email.com" />
        </div>

        {authMode !== 'reset' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                {authMode === 'login' && (
                  <button type="button" onClick={() => setAuthMode('reset')} className="text-xs text-primary hover:underline font-semibold">Esqueceu a senha?</button>
                )}
              </div>
              <input required name="password" type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="••••••••" />
            </div>
        )}
        <button disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
          {loading ? 'Processando...' : (authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Cadastrar' : 'Enviar Link de Recuperação')}
        </button>
      </form>
      <div className="mt-6 text-center">
        {authMode === 'reset' ? (
           <button type="button" onClick={() => setAuthMode('login')} className="text-sm text-slate-500 font-semibold hover:text-primary flex items-center justify-center gap-2 w-full">
               <ArrowLeft size={16} /> Voltar para o Login
           </button>
        ) : (
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-primary font-semibold hover:underline">
            {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        )}
      </div>
    </div>
  );
}
