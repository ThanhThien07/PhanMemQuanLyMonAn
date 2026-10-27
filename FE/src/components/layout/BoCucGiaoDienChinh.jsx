/**
 * @file BoCucGiaoDienChinh.jsx
 * @description Khung bố cục tổng thể của ứng dụng (Main Application Layout).
 * Bao bọc Thanh điều hướng bên (ThanhMenuDieuHuong), Thanh tiêu đề trên (ThanhDieuHuongTren)
 * và phân vùng nội dung chính có thanh cuộn độc lập.
 * @module components/layout/BoCucGiaoDienChinh
 * @author Nguyễn Hoàng Hưng
 */

import React, { useState } from 'react';
import ThanhDieuHuongTren from '../ThanhDieuHuongTren.jsx';
import ThanhMenuDieuHuong from '../ThanhMenuDieuHuong.jsx';

export default function BoCucGiaoDienChinh({ activeTab, setActiveTab, children }) {
  const [sidebarMo, setSidebarMo] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-slate-900 selection:bg-[#0077B6] selection:text-white relative antialiased">
      {/* Thanh Menu điều hướng bên trái cố định Sticky */}
      <ThanhMenuDieuHuong 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarMo={sidebarMo}
        dongSidebar={() => setSidebarMo(false)}
      />

      {/* Phân vùng giao diện làm việc chính tách nền, cuộn nội dung độc lập */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-100">
        <ThanhDieuHuongTren 
          activeTab={activeTab} 
          moSidebar={() => setSidebarMo(true)}
        />
        <main className={`flex-1 overflow-y-auto bg-slate-100 ${activeTab === 'qr_order' ? 'p-0' : 'px-3 sm:px-6 lg:px-8 py-5 sm:py-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Bí danh tương thích
export const MainLayout = BoCucGiaoDienChinh;
