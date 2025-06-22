import { ReactNode } from "react";
// import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
} 