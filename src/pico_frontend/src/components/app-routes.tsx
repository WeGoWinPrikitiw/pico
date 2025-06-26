import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import {
  LandingPage,
  ExplorePage,
  PostsPage,
  PostDetailPage,
  ProfilePage,
  UploadPage,
  OperationalDashboard,
  ForumsPage,
} from "@/pages";
import { useAuth } from "@/context/auth-context";

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Landing page - only show if user is NOT authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/explore" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Main application routes - require authentication */}
        <Route
          path="/explore"
          element={
            isAuthenticated ? <ExplorePage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/posts"
          element={
            isAuthenticated ? <PostsPage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/posts/:id"
          element={
            isAuthenticated ? <PostDetailPage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/upload"
          element={
            isAuthenticated ? <UploadPage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/forums"
          element={
            isAuthenticated ? <ForumsPage /> : <Navigate to="/" replace />
          }
        />

        {/* Operational dashboard - admin/testing features */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <OperationalDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Legacy app route - redirect to explore if authenticated */}
        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <Navigate to="/explore" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
