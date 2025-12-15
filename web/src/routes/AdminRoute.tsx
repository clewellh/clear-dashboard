// web/src/routes/AdminRoute.tsx

import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { fetchMyAppUserProfile, type AppUserProfile } from '../data/users';

type AdminState =
  | { status: 'loading' }
  | { status: 'not-authenticated' }
  | { status: 'not-authorized'; profile?: AppUserProfile }
  | { status: 'authorized'; profile: AppUserProfile }
  | { status: 'error'; message: string };

export function AdminRoute() {
  const [state, setState] = useState<AdminState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Quick auth check (no DB)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setState({ status: 'not-authenticated' });
        return;
      }

      const res = await fetchMyAppUserProfile();
      if (cancelled) return;

      if (res.error) {
        setState({ status: 'error', message: res.error });
        return;
      }

      const role = (res.data.role ?? '').toLowerCase();
      if (role !== 'admin') {
        setState({ status: 'not-authorized', profile: res.data });
        return;
      }

      setState({ status: 'authorized', profile: res.data });
    }

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') return <p style={{ padding: '1rem' }}>Checking access…</p>;
  if (state.status === 'not-authenticated') return <Navigate to="/login" replace />;

  if (state.status === 'error')
    return (
      <div style={{ padding: '1rem' }}>
        <h2>Admin</h2>
        <p style={{ color: 'red' }}>{state.message}</p>
      </div>
    );

  if (state.status === 'not-authorized')
    return (
      <div style={{ padding: '1rem' }}>
        <h2>Not authorized</h2>
        <p>You’re signed in, but you don’t have admin access.</p>
        <a href="/">Go back home</a>
      </div>
    );

  // Authorized: render nested admin routes
  return <Outlet context={{ profile: state.profile }} />;
}
