import { ReactNode } from 'react';
import { Megaphone, UserCog, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface PortalLayoutProps {
  children: ReactNode;
  user: any;
  onLogout: () => void;
}

export function PortalLayout({ children, user, onLogout }: PortalLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-slate-50 text-slate-800">
      <div className="w-full max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 glass p-4 px-6 rounded-2xl shadow-sm border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Megaphone size={24} />
            </div>
            <span className="font-bold text-slate-800 hidden sm:inline">Gabinete Digital</span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === '/' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Novo Relato
            </Link>
            {user ? (
              <>
                <Link
                  to="/history"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === '/history' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Meu Histórico
                </Link>
                <Link
                  to="/profile"
                  className={`p-2 rounded-xl transition-all ${
                    location.pathname === '/profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                  }`}
                  title="Meu Perfil"
                >
                  <UserCog size={20} />
                </Link>
                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-danger transition-colors" title="Sair">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className={`bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all flex items-center gap-2 ${
                  location.pathname === '/auth' ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                <User size={16} /> Entrar
              </Link>
            )}
          </nav>
        </header>

        <main className="animate-bounce-in">
          {children}
        </main>
      </div>
    </div>
  );
}
