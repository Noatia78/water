import { useEffect, useState } from 'react';
import Layout, { Page } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import WaterQuality from './pages/WaterQuality';
import Alerts from './pages/Alerts';
import AIPredictions from './pages/AIPredictions';
import Education from './pages/Education';
import { supabase } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('acknowledged', false)
      .then(({ count }) => setAlertCount(count ?? 0));
  }, []);

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={page => setCurrentPage(page as Page)} />;
      case 'reports': return <Reports />;
      case 'water': return <WaterQuality />;
      case 'alerts': return <Alerts />;
      case 'ai': return <AIPredictions />;
      case 'education': return <Education />;
      default: return <Dashboard onNavigate={page => setCurrentPage(page as Page)} />;
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} alertCount={alertCount}>
      {renderPage()}
    </Layout>
  );
}

export default App;
