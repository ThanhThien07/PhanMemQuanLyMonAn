/**
 * @file baoCaoController.js
 * @description Tầng xử lý nghiệp vụ Báo cáo Thống kê & Phân tích Doanh thu (Analytics & Reports Controller).
 * Chịu trách nhiệm:
 * layThongKeTongQuan (getDashboardSummary):
 * 1. Tổng doanh thu thực thu và tổng số đơn món đã phục vụ hoàn tất qua MongoDB Aggregation Pipeline ($group, $sum).
 * 2. Phân bố trạng thái bàn ăn (Trống, Có khách, Đã đặt).
 * 3. Đếm số lượng nguyên vật liệu kho đang chạm ngưỡng báo động đỏ (low stock alert).
 * 4. Thống kê số lượng khách hẹn đặt bàn trong ngày hôm nay.
 * 5. Phân tích cơ cấu doanh thu theo phương thức thanh toán (Tiền mặt vs Quét mã chuyển khoản VietQR).
 * 6. Xếp hạng Top 5 món ăn bán chạy nhất nhà hàng (Best Sellers).
 * @module controllers/baoCaoController
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import { DatMon, BanAn, NguyenLieu, DatBanTruoc, MonAn } from '../models/moHinhDuLieu.js';

/**
 * Lấy dữ liệu thống kê tổng hợp phục vụ hiển thị trên Bảng điều khiển Dashboard
 * @function layThongKeTongQuan
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
export async function layThongKeTongQuan(req, res) {
  try {
    // 1. Tính tổng doanh thu từ các đơn hàng đã thanh toán hoàn tất
    const thongKeDoanhThu = await DatMon.aggregate([
      {
        $match: {
          phuong_thuc_thanh_toan: { $ne: 'chua_thanh_toan' },
          trang_thai: 'hoan_thanh'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$tong_tien' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    const tongDoanhThu = thongKeDoanhThu[0]?.totalRevenue || 0;
    const tongSoDon = thongKeDoanhThu[0]?.totalOrders || 0;

    // 2. Thống kê số lượng bàn theo từng trạng thái
    const thongKeBan = await BanAn.aggregate([
      {
        $group: {
          _id: '$trang_thai',
          count: { $sum: 1 }
        }
      }
    ]);
    const coCauBan = thongKeBan.map(t => ({
      trang_thai: t._id,
      count: t.count
    }));

    // 3. Cảnh báo kho: Đếm số lượng nguyên liệu đang cạn kiệt (tồn <= định mức)
    const toanBoNguyenLieu = await NguyenLieu.find({});
    const soLuongNguyenLieuCanKho = toanBoNguyenLieu.filter(i => i.so_luong_ton <= i.dinh_muc_toi_thieu).length;

    // 4. Lịch đặt bàn trước trong ngày hôm nay
    const thoiDiemDauNgay = new Date();
    thoiDiemDauNgay.setHours(0, 0, 0, 0);
    const thoiDiemCuoiNgay = new Date();
    thoiDiemCuoiNgay.setHours(23, 59, 59, 999);

    const soLichDatBanHomNay = await DatBanTruoc.countDocuments({
      thoi_gian_hen: { $gte: thoiDiemDauNgay, $lte: thoiDiemCuoiNgay },
      trang_thai: 'da_xac_nhan'
    });

    // 5. Phân tích cơ cấu doanh thu theo phương thức thanh toán
    const thongKeThanhToan = await DatMon.aggregate([
      {
        $match: {
          phuong_thuc_thanh_toan: { $ne: 'chua_thanh_toan' }
        }
      },
      {
        $group: {
          _id: '$phuong_thuc_thanh_toan',
          total: { $sum: '$tong_tien' }
        }
      }
    ]);
    const coCauThanhToan = thongKeThanhToan.map(p => ({
      phuong_thuc_thanh_toan: p._id,
      total: p.total
    }));

    // 6. Top 5 món ăn bán chạy nhất nhà hàng
    const thongKeTopMon = await DatMon.aggregate([
      {
        $match: {
          trang_thai: { $ne: 'da_huy' }
        }
      },
      {
        $group: {
          _id: '$mon_an_id',
          total_sold: { $sum: '$so_luong' },
          total_revenue: { $sum: '$tong_tien' }
        }
      },
      {
        $sort: { total_sold: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const dsIdTopMon = thongKeTopMon.map(t => t._id);
    const dsMonChiTiet = await MonAn.find({ id: { $in: dsIdTopMon } });
    const anhXaMon = {};
    dsMonChiTiet.forEach(d => { anhXaMon[d.id] = d; });

    const top5MonBanChay = thongKeTopMon.map(t => {
      const d = anhXaMon[t._id];
      return {
        ten_mon: d?.ten_mon || `Món #${t._id}`,
        gia: d?.gia || 0,
        hinh_anh: d?.hinh_anh || '',
        total_sold: t.total_sold,
        total_revenue: t.total_revenue
      };
    });

    res.json({
      success: true,
      summary: {
        totalRevenue: tongDoanhThu,
        totalOrders: tongSoDon,
        lowStockCount: soLuongNguyenLieuCanKho,
        reservationsToday: soLichDatBanHomNay,
        tableStats: coCauBan,
        paymentBreakdown: coCauThanhToan,
        topDishes: top5MonBanChay
      }
    });
  } catch (error) {
    console.error('Lỗi layThongKeTongQuan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Bí danh tương thích
export const getDashboardSummary = layThongKeTongQuan;

export default {
  layThongKeTongQuan,
  getDashboardSummary
};
