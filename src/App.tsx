import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { PortalLayout } from './layouts/PortalLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PortalHome } from './pages/PortalHome';
import { PortalHistory } from './pages/PortalHistory';
import { PortalAuth } from './pages/PortalAuth';
import { PortalProfile } from './pages/PortalProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDemandasList } from './pages/AdminDemandasList';
import { AdminConfig } from './pages/AdminConfig';
import { AdminAuth } from './pages/AdminAuth';
import { UpdatePassword } from './pages/UpdatePassword';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // You should configure this in your Supabase database using RLS or an admins table.
  // For simplicity during migration, we check if the user is the admin.
  const isAdmin = (user: any) => {
      // Re-add your allowed emails here
      const ADMIN_EMAILS = ['cleberfdosreis@gmail.com'];
      return user && ADMIN_EMAILS.includes(user.email);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <BrowserRouter>
      <Routes>
        {/* Portal Routes */}
        <Route path="/" element={<PortalLayout user={user} onLogout={() => supabase.auth.signOut()}><PortalHome user={user} /></PortalLayout>} />
        <Route path="/auth" element={!user ? <PortalLayout user={user} onLogout={() => supabase.auth.signOut()}><PortalAuth /></PortalLayout> : <Navigate to="/" />} />
        <Route path="/history" element={user ? <PortalLayout user={user} onLogout={() => supabase.auth.signOut()}><PortalHistory user={user} /></PortalLayout> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <PortalLayout user={user} onLogout={() => supabase.auth.signOut()}><PortalProfile user={user} /></PortalLayout> : <Navigate to="/auth" />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
            isAdmin(user) ? (
                <AdminLayout admin={user} onLogout={() => supabase.auth.signOut()}>
                    <Routes>
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="demandas" element={<AdminDemandasList />} />
                        <Route path="config" element={<AdminConfig />} />
                    </Routes>
                </AdminLayout>
            ) : (
                <AdminAuth />
            )
        } />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </BrowserRouter>
  );
}
