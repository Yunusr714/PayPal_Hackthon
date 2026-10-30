import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { BusinessProvider, useBusiness } from '@/context/BusinessContext';
import { ReceivablesProvider } from '@/context/ReceivablesContext';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { SalesPage } from '@/pages/SalesPage';
import { KhataPage } from '@/pages/KhataPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { CreateInvoicePage } from '@/pages/CreateInvoicePage';
import { ReplyTriagePage } from '@/pages/ReplyTriagePage';
import { ActivityLogPage } from '@/pages/ActivityLogPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';

function ShopOnlyRoute({ children }: { children: React.ReactNode }) {
  const { category } = useBusiness();
  if (category === 'service') {
    return <Navigate to="/services" replace />;
  }
  return <>{children}</>;
}

function ServiceOnlyRoute({ children }: { children: React.ReactNode }) {
  const { category } = useBusiness();
  if (category === 'shop') {
    return <Navigate to="/inventory" replace />;
  }
  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useBusiness();
  if (!user.name || !user.phone) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BusinessProvider>
      <ReceivablesProvider>
        <HashRouter>
          <Routes>
            {/* Auth routes outside shell layout */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Main workspace routes protected by RequireAuth */}
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/khata" element={<KhataPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:customerName" element={<CustomerDetailPage />} />
              <Route path="/services" element={<ServiceOnlyRoute><ServicesPage /></ServiceOnlyRoute>} />
              <Route path="/inventory" element={<ShopOnlyRoute><InventoryPage /></ShopOnlyRoute>} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/create" element={<CreateInvoicePage />} />
              <Route path="/triage" element={<ReplyTriagePage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/activity" element={<ActivityLogPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/ai-assistant" element={<Navigate to="/create" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors />
        </HashRouter>
      </ReceivablesProvider>
    </BusinessProvider>
  );
}

export default App;
