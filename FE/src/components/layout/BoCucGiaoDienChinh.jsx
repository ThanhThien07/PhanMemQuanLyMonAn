/**
 * @file BoCucGiaoDienChinh.jsx
 * @description Khung bố cục tổng thể của ứng dụng (Main Application Layout).
 * Bao bọc Thanh điều hướng bên (ThanhMenuDieuHuong), Thanh tiêu đề trên (ThanhDieuHuongTren)
 * và phân vùng nội dung chính có thanh cuộn độc lập.
 * @module components/layout/BoCucGiaoDienChinh
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React, { useState } from 'react';
import ThanhDieuHuongTren from '../ThanhDieuHuongTren.jsx';
import ThanhMenuDieuHuong from '../ThanhMenuDieuHuong.jsx';

export default function BoCucGiaoDienChinh({ activeTab, setActiveTab, children }) {
  const [sidebarMo, setSidebarMo] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex selection:bg-[#0077B6] selection:text-white relative overflow-x-hidden">
      {/* Thanh Menu điều hướng bên trái hỗ trợ Drawer trên Mobile & Tablet */}
      <ThanhMenuDieuHuong 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarMo={sidebarMo}
        dongSidebar={() => setSidebarMo(false)}
      />

      {/* Phân vùng giao diện làm việc chính */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <ThanhDieuHuongTren 
          activeTab={activeTab} 
          moSidebar={() => setSidebarMo(true)}
        />
        <main className="flex-1 overflow-y-auto bg-white p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Bí danh tương thích
export const MainLayout = BoCucGiaoDienChinh;
