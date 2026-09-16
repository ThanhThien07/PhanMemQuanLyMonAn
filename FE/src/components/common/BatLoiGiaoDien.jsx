/**
 * @file BatLoiGiaoDien.jsx
 * @description React Error Boundary Component - Khung bảo vệ bắt lỗi giao diện người dùng.
 * Ngăn chặn lỗi render của các component con làm sập trắng toàn bộ ứng dụng,
 * hiển thị giao diện thông báo lịch sự kèm nút Tải Lại Ứng Dụng.
 * @module components/common/BatLoiGiaoDien
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class BatLoiGiaoDien extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 [React Error Boundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-lg w-full shadow-xl shadow-rose-500/5 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Đã Xảy Ra Lỗi Giao Diện</h2>
              <p className="text-slate-500 text-xs mt-1">
                Hệ thống đã bắt được lỗi và ngăn không để ứng dụng bị sập trắng màn hình.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-left font-mono text-xs text-rose-800 overflow-x-auto max-h-40">
                <div className="font-bold mb-1">Lỗi: {this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Tải Lại Ứng Dụng
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Bí danh tương thích
export const ErrorBoundary = BatLoiGiaoDien;

export default BatLoiGiaoDien;
