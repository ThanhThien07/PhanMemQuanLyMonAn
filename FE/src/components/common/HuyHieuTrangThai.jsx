/**
 * @file HuyHieuTrangThai.jsx
 * @description Component giao diện hiển thị Huy hiệu trạng thái (Badge) và Biểu tượng xoay tải (Spinner).
 * @module components/common/HuyHieuTrangThai
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React from 'react';

/**
 * Hiển thị huy hiệu trạng thái bo góc với màu sắc tương ứng (kết hợp Bootstrap badge & Tailwind)
 */
export function HuyHieuTrangThai({ children, variant = 'default', size = 'sm', className = '' }) {
  const kieuMauSac = {
    default: 'badge bg-secondary-subtle text-secondary border border-secondary-subtle',
    success: 'badge bg-success-subtle text-success border border-success-subtle',
    warning: 'badge bg-warning-subtle text-amber-800 border border-warning-subtle',
    danger: 'badge bg-danger-subtle text-danger border border-danger-subtle',
    info: 'badge bg-info-subtle text-info-emphasis border border-info-subtle',
    primary: 'badge bg-primary text-white'
  };

  const kieuKichThuoc = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`rounded-pill d-inline-flex align-items-center gap-1.5 fw-bold transition-all ${
        kieuMauSac[variant] || kieuMauSac.default
      } ${kieuKichThuoc[size] || kieuKichThuoc.sm} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Biểu tượng vòng xoay báo hiệu trạng thái đang tải dữ liệu (sử dụng Bootstrap spinner-border)
 */
export function VongXoayTai({ size = 'md', className = '' }) {
  const kichThuocMap = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'w-10 h-10'
  };

  return (
    <div
      className={`spinner-border text-warning ${kichThuocMap[size] || ''} ${className}`}
      role="status"
    >
      <span className="visually-hidden">Đang tải...</span>
    </div>
  );
}

// Bí danh tương thích
export const Badge = HuyHieuTrangThai;
export const Spinner = VongXoayTai;

export default { HuyHieuTrangThai, VongXoayTai, Badge, Spinner };
