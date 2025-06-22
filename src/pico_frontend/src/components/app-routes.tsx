import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { LandingPage, AppPage } from '@/pages';

export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
    </Layout>
  );
} 