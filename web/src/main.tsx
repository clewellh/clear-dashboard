import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import AppShell from './layout/AppShell';
import TownPage from './pages/TownPage';
import PeoplePage from './pages/PeoplePage';
import ActPage from './pages/ActPage';

import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import { AdminRoute } from './routes/AdminRoute';

import { AuthProvider } from './auth/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public login */}
            <Route path="/login" element={<Login />} />

            {/* Public tools (entered from Squarespace) */}
            <Route element={<AppShell />}>
              {/* Default entry */}
              <Route path="/" element={<Navigate to="/town" replace />} />

              {/* Tool 1: My Town */}
              <Route path="/town" element={<TownPage />} />

              {/* Tool 2: My Politicians */}
              <Route path="/people" element={<PeoplePage />} />

              {/* Tool 3: Organize */}
              <Route path="/act" element={<ActPage />} />
            </Route>

            {/* Admin-only */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminHome />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
