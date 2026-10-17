import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { BusinessProvider } from '@/context/BusinessContext';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { SalesPage } from '@/pages/SalesPage';
import { KhataPage } from '@/pages/KhataPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';

function App() {
  return (
    <BusinessProvider>
      <HashRouter>
        <Routes>
          {/* Auth routes outside shell layout */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Main workspace routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/ai-assistant" element={<Navigate to="/?openAI=true" replace />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/khata" element={<KhataPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:customerName" element={<CustomerDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/suppliers" element={<Navigate to="/" replace />} />
            <Route path="/reports" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors />
      </HashRouter>
    </BusinessProvider>
  );
}

export default App;
