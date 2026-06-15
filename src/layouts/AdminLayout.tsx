import { useState } from 'react';
import { ReactNode } from 'react';
import { LayoutDashboard, ClipboardList, Settings, LogOut, CheckCircle2, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function AdminLayout({ children, admin, onLogout }: { children: ReactNode, admin: any, onLogout: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/demandas', label: 'Demandas', icon: ClipboardList },
    { path: '/admin/config', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r bg-white md:bg-white/50 transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <CheckCircle2 /> Gabinete Digital
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'sidebar-item-active shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-8 left-4 right-4 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Administrador</p>
            <p className="text-xs font-bold text-slate-700 truncate mb-3">{admin?.email}</p>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white text-danger text-xs font-bold border border-danger/20 hover:bg-danger/5 transition-all"
            >
              <LogOut size={14} /> Sair do Painel
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 glass sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 bg-white/50 border-b">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 capitalize truncate">
              Gestão
            </h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto animate-bounce-in">
          {children}
        </div>
      </main>
    </div>
  );
}
