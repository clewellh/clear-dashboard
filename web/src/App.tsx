// web/src/App.tsx
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

export default function App() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong>CLEAR</strong>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link to="/">Calendar</Link>
          </nav>
        </div>

        {user && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>{user.email}</span>
            <button onClick={() => void signOut()}>Sign out</button>
          </div>
        )}
      </header>

      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
