import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import {
  LandingPage,
  ExplorePage,
  ProfilePage,
  UploadPage,
  OperationalDashboard,
  ForumsPage,
  ForumDetailPage,
  NFTDetailPage,
} from "@/pages";
import { useAuth } from "@/context/auth-context";

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
          path="/nft/:id"
          element={<NFTDetailPage />}
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

        <Route
          path="/forums/:id"
          element={
            isAuthenticated ? <ForumDetailPage /> : <Navigate to="/" replace />
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
