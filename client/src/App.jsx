import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import ProjectCreate from './pages/ProjectCreate';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import ApiPlayground from './pages/ApiPlayground';
import ApiDocs from './pages/ApiDocs';
import Team from './pages/Team';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await api.get('/auth/me');
        const role = res.data.user?.role;
        setIsAdmin(role === 'Owner' || role === 'Admin');
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkRole();
  }, []);

  if (isAdmin === null) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading auth...</div>;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  const [globalSettings, setGlobalSettings] = useState(null);

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const res = await api.get('/settings');
        setGlobalSettings(res.data);

        // Dynamically update site name and favicon
        if (res.data.siteName) document.title = res.data.siteName;
        if (res.data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = `${api.defaults.baseURL.replace('/api', '')}${res.data.faviconUrl}`;
        }
      } catch (err) {
        console.error("Failed to load global settings", err);
      }
    };
    fetchAppConfig();
  }, []);

  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout settings={globalSettings} />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="project/new" element={
              <AdminRoute><ProjectCreate /></AdminRoute>
            } />
            <Route path="project/:id" element={<ProjectView />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit" element={
              <AdminRoute><AuditLog /></AdminRoute>
            } />
            <Route path="api-docs" element={<ApiPlayground />} />
            <Route path="api-reference" element={<ApiDocs />} />
            <Route path="team" element={
              <AdminRoute><Team /></AdminRoute>
            } />
            <Route path="settings" element={
              <AdminRoute><Settings /></AdminRoute>
            } />
          </Route>
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
