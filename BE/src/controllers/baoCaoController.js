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

    // 6. Xếp hạng toàn bộ các món ăn đã bán (Sold Dishes Breakdown)
    const { range = 'all' } = req.query;
    const boLocThoiGian = { trang_thai: { $ne: 'da_huy' } };

    if (range === 'today') {
      boLocThoiGian.createdAt = { $gte: thoiDiemDauNgay, $lte: thoiDiemCuoiNgay };
    } else if (range === '7days') {
      const bayNgayTruoc = new Date();
      bayNgayTruoc.setDate(bayNgayTruoc.getDate() - 7);
      bayNgayTruoc.setHours(0, 0, 0, 0);
      boLocThoiGian.createdAt = { $gte: bayNgayTruoc };
    } else if (range === 'month') {
      const dauThang = new Date();
      dauThang.setDate(1);
      dauThang.setHours(0, 0, 0, 0);
      boLocThoiGian.createdAt = { $gte: dauThang };
    }

    const thongKeToanBoMon = await DatMon.aggregate([
      {
        $match: boLocThoiGian
      },
      {
        $group: {
          _id: '$mon_an_id',
          total_sold: { $sum: '$so_luong' },
          total_revenue: { $sum: '$tong_tien' },
          order_count: { $sum: 1 },
          last_order_at: { $max: '$createdAt' }
        }
      },
      {
        $sort: { total_revenue: -1 }
      }
    ]);

    const dsIdMon = thongKeToanBoMon.map(t => t._id);
    const dsMonChiTiet = await MonAn.find({ id: { $in: dsIdMon } });
    const anhXaMon = {};
    dsMonChiTiet.forEach(d => { anhXaMon[d.id] = d; });

    const danhSachMonDaBan = thongKeToanBoMon.map(t => {
      const d = anhXaMon[t._id];
      const phanTramDoanhThu = tongDoanhThu > 0 
        ? ((t.total_revenue / tongDoanhThu) * 100).toFixed(1) 
        : '0.0';
      return {
        mon_an_id: t._id,
        ten_mon: d?.ten_mon || `Món #${t._id}`,
        gia: d?.gia || 0,
        danh_muc: d?.danh_muc || 'Món chính',
        hinh_anh: d?.hinh_anh || '',
        total_sold: t.total_sold,
        total_revenue: t.total_revenue,
        order_count: t.order_count,
        revenue_share_pct: Number(phanTramDoanhThu),
        last_order_at: t.last_order_at
      };
    });

    const top5MonBanChay = danhSachMonDaBan.slice(0, 5);

    // 7. Lấy danh sách giao dịch & chi tiết các lượt bán hàng gần nhất (Detailed Sales Orders)
    const cacDonBanChiTiet = await DatMon.find(boLocThoiGian)
      .sort({ createdAt: -1 })
      .limit(100);

    const danhSachDonHangChiTiet = cacDonBanChiTiet.map(don => {
      const donJSON = don.toJSON();
      const mon = anhXaMon[donJSON.mon_an_id];
      return {
        id: donJSON.id,
        ban_id: donJSON.ban_id,
        so_ban: donJSON.so_ban,
        mon_an_id: donJSON.mon_an_id,
        ten_mon: donJSON.ten_mon || mon?.ten_mon || `Món #${donJSON.mon_an_id}`,
        so_luong: donJSON.so_luong,
        don_gia: donJSON.don_gia || mon?.gia || (donJSON.so_luong > 0 ? donJSON.tong_tien / donJSON.so_luong : 0),
        tong_tien: donJSON.tong_tien,
        ghi_chu: donJSON.ghi_chu || '',
        trang_thai: donJSON.trang_thai,
        phuong_thuc_thanh_toan: donJSON.phuong_thuc_thanh_toan,
        createdAt: donJSON.createdAt,
        updatedAt: donJSON.updatedAt
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
        topDishes: top5MonBanChay,
        soldDishes: danhSachMonDaBan,
        detailedOrders: danhSachDonHangChiTiet
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
