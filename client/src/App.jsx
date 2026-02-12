import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import ProjectCreate from './pages/ProjectCreate';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import ApiPlayground from './pages/ApiPlayground';
import Team from './pages/Team';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="project/new" element={<ProjectCreate />} />
            <Route path="project/:id" element={<ProjectView />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="api-docs" element={<ApiPlayground />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
