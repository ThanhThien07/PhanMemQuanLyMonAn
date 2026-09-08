import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POSOrder from './pages/POSOrder';
import TableManagement from './pages/TableManagement';
import KitchenDisplay from './pages/KitchenDisplay';
import ReservationPage from './pages/ReservationPage';
import DishManagement from './pages/DishManagement';
import InventoryPage from './pages/InventoryPage';
import CustomerPage from './pages/CustomerPage';
import ReportsPage from './pages/ReportsPage';
import { Spinner } from './components/common/Badge';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-slate-400 font-semibold text-sm">Đang khởi động Royal Bistro...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'pos':
        return <POSOrder />;
      case 'tables':
        return <TableManagement setActiveTab={setActiveTab} />;
      case 'kitchen':
        return <KitchenDisplay />;
      case 'reservations':
        return <ReservationPage />;
      case 'dishes':
        return <DishManagement />;
      case 'inventory':
        return <InventoryPage />;
      case 'customers':
        return <CustomerPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActivePage()}
    </MainLayout>
  );
}
