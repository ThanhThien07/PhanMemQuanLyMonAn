/**
 * @file HuyHieuTrangThai.jsx
 * @description Component giao diện hiển thị Huy hiệu trạng thái (Badge) và Biểu tượng xoay tải (Spinner).
 * @module components/common/HuyHieuTrangThai
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React from 'react';

/**
 * Hiển thị huy hiệu trạng thái bo góc với màu sắc tương ứng
 */
export function HuyHieuTrangThai({ children, variant = 'default', size = 'sm', className = '' }) {
  const kieuMauSac = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    primary: 'bg-amber-500 text-slate-950 font-bold'
  };

  const kieuKichThuoc = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border transition-all ${
        kieuMauSac[variant] || kieuMauSac.default
      } ${kieuKichThuoc[size] || kieuKichThuoc.sm} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Biểu tượng vòng xoay báo hiệu trạng thái đang tải dữ liệu (Spinner)
 */
export function VongXoayTai({ size = 'md', className = '' }) {
  const kichThuocMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={`rounded-full border-amber-500 border-t-transparent animate-spin ${
        kichThuocMap[size] || kichThuocMap.md
      } ${className}`}
    />
  );
}

// Bí danh tương thích
export const Badge = HuyHieuTrangThai;
export const Spinner = VongXoayTai;

export default { HuyHieuTrangThai, VongXoayTai, Badge, Spinner };
