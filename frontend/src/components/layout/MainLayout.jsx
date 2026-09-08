import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

export default function MainLayout({ activeTab, setActiveTab, children }) {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex selection:bg-amber-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto bg-slate-50/80 p-2">
          {children}
        </main>
      </div>
    </div>
  );
}
