import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "@/components/app-routes";
import { AuthProvider } from "@/context/auth-context";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
