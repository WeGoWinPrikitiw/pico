import { ReactNode } from "react";
// import { Header } from "./header";
import { Footer } from "./footer";
import { useAuth } from "../../context/auth-context";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
      {!isAuthenticated && <Footer />}
    </div>
  );
}   