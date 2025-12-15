import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import Login from './pages/Login';
import CalendarPage from './pages/CalendarPage';
import AdminHome from './pages/AdminHome';
import { AdminRoute } from './routes/AdminRoute';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<CalendarPage />} />

          {/* Admin-only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminHome />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
