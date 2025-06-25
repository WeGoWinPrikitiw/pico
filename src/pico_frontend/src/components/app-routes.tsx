import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { LandingPage } from '@/pages';
import { OperationalDashboard } from '@/pages/operational-dashboard';
import { useAuth } from '@/context/auth-context';

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <OperationalDashboard /> : <LandingPage />}
        />
        <Route
          path="/app"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Layout>
  );
} 