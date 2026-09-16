/**
 * @file KhungDuLieuRong.jsx
 * @description Component hiển thị trạng thái danh sách trống (Empty State Placeholder).
 * @module components/common/KhungDuLieuRong
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React from 'react';
import { Inbox } from 'lucide-react';

export function KhungDuLieuRong({ 
  icon: Icon = Inbox, 
  title = 'Chưa có dữ liệu', 
  description = 'Hiện tại chưa có mục nào trong danh sách này.',
  action = null 
}) {
  return (
    <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

// Bí danh tương thích
export const EmptyState = KhungDuLieuRong;

export default KhungDuLieuRong;
