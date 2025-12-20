// web/src/App.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

function navLinkStyle(active: boolean): React.CSSProperties {
  return {
    textDecoration: "none",
    fontWeight: active ? 800 : 600,
    opacity: active ? 1 : 0.85,
  };
}

export default function App() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isTown = location.pathname.startsWith("/town") || location.pathname.startsWith("/my-town");
  const isCalendar = location.pathname.includes("/calendar") || location.pathname === "/";

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link to="/town" style={{ textDecoration: "none", color: "inherit" }}>
            <strong>CLEAR</strong>
          </Link>

          <nav style={{ display: "flex", gap: 14 }}>
            <Link to="/town" style={navLinkStyle(isTown)}>
              My Town
            </Link>
            <Link to="/my-town/new-providence/calendar" style={navLinkStyle(isCalendar)}>
              Calendar
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{user.email}</span>
              <button
                onClick={() => void signOut()}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Admin login
            </Link>
          )}
        </div>
      </header>

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
