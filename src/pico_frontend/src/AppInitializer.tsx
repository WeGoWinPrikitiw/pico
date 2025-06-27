import { useAuth } from "./context/auth-context";
import { AppRoutes } from "./components/app-routes";
import { Layout } from "./components/layout";

export function AppInitializer() {
  const { isLoading } = useAuth();

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

  return <AppRoutes />;
}
