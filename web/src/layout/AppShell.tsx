// web/src/layout/AppShell.tsx

import { Link, Outlet, useLocation } from 'react-router-dom';

function Tab({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        padding: '0.5rem 0.75rem',
        borderRadius: 8,
        border: '1px solid #ddd',
        background: active ? '#f5f5f5' : 'transparent',
        color: 'inherit',
        fontWeight: active ? 700 : 600,
      }}
    >
      {label}
    </Link>
  );
}

export default function AppShell() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <header
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Tab to="/town" label="My Town" />
        <Tab to="/people" label="My Politicians" />
        <Tab to="/act" label="Organize" />

        <div style={{ marginLeft: 'auto' }}>
          <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            Admin
          </Link>
        </div>
      </header>

      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
