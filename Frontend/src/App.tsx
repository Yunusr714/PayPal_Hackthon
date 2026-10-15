import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { SalesPage } from '@/pages/SalesPage';
import { KhataPage } from '@/pages/KhataPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/khata" element={<KhataPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </HashRouter>
  );
}

export default App;
