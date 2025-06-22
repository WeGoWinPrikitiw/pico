import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from '@/components/app-routes';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App; 