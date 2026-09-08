import { query, getOne } from '../config/db.js';

// Thống kê tổng quan cho Dashboard
export async function getDashboardSummary(req, res) {
  try {
    // 1. Tổng doanh thu đã thanh toán
    const revenueRes = await getOne(`
      SELECT SUM(tong_tien) as total_revenue, COUNT(id) as total_orders
      FROM dat_mon
      WHERE phuong_thuc_thanh_toan != 'chua_thanh_toan' AND trang_thai = 'hoan_thanh'
    `);

    // 2. Thống kê bàn ăn
    const tableStats = await query(`
      SELECT trang_thai, COUNT(*) as count
      FROM ban
      GROUP BY trang_thai
    `);

    // 3. Cảnh báo kho nguyên liệu sắp hết
    const lowStockRes = await getOne(`
      SELECT COUNT(*) as low_stock_count
      FROM nguyen_lieu
      WHERE so_luong_ton <= dinh_muc_toi_thieu
    `);

    // 4. Lịch đặt bàn hôm nay
    const todayResvRes = await getOne(`
      SELECT COUNT(*) as resv_today
      FROM dat_ban_truoc
      WHERE DATE(thoi_gian_hen) = CURRENT_DATE AND trang_thai = 'da_xac_nhan'
    `);

    // 5. Doanh thu theo phương thức thanh toán
    const paymentBreakdown = await query(`
      SELECT phuong_thuc_thanh_toan, SUM(tong_tien) as total
      FROM dat_mon
      WHERE phuong_thuc_thanh_toan != 'chua_thanh_toan'
      GROUP BY phuong_thuc_thanh_toan
    `);

    // 6. Top 5 món bán chạy nhất
    const topDishes = await query(`
      SELECT m.ten_mon, m.gia, m.hinh_anh, SUM(d.so_luong) as total_sold, SUM(d.tong_tien) as total_revenue
      FROM dat_mon d
      JOIN mon_an m ON d.mon_an_id = m.id
      WHERE d.trang_thai != 'da_huy'
      GROUP BY d.mon_an_id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      summary: {
        totalRevenue: revenueRes?.total_revenue || 0,
        totalOrders: revenueRes?.total_orders || 0,
        lowStockCount: lowStockRes?.low_stock_count || 0,
        reservationsToday: todayResvRes?.resv_today || 0,
        tableStats,
        paymentBreakdown,
        topDishes
      }
    });
  } catch (error) {
    console.error('Lỗi getDashboardSummary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
