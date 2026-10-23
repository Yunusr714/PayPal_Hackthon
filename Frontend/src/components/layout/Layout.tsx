import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0D0E] text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      <Sidebar />
      <div className="lg:pl-[88px] transition-all duration-300">
        <Header />
        <main className="px-6 lg:px-8 pt-3 lg:pt-4 pb-12">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
