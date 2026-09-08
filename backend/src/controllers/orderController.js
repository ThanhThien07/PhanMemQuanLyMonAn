import { query, getOne, execute } from '../config/db.js';
import { emitNewOrder, emitOrderStatusUpdate, emitTableUpdate } from '../utils/socket.js';

// Lấy danh sách đơn món theo bàn hoặc toàn bộ
export async function getOrders(req, res) {
  try {
    const { ban_id, status, unpaid_only } = req.query;
    let sql = `
      SELECT d.*, m.ten_mon, m.hinh_anh, m.gia as gia_goc, b.so_ban, b.khu_vuc, k.ho_ten as ten_khach
      FROM dat_mon d
      JOIN mon_an m ON d.mon_an_id = m.id
      JOIN ban b ON d.ban_id = b.id
      LEFT JOIN khach_hang k ON d.khach_hang_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (ban_id) {
      sql += ' AND d.ban_id = ?';
      params.push(ban_id);
    }

    if (status) {
      sql += ' AND d.trang_thai = ?';
      params.push(status);
    }

    if (unpaid_only === 'true') {
      sql += " AND d.phuong_thuc_thanh_toan = 'chua_thanh_toan' AND d.trang_thai != 'da_huy'";
    }

    sql += ' ORDER BY d.id DESC';

    const orders = await query(sql, params);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy danh sách món cho Màn hình Bếp (KDS)
export async function getKitchenOrders(req, res) {
  try {
    const sql = `
      SELECT d.*, m.ten_mon, m.hinh_anh, b.so_ban, b.khu_vuc
      FROM dat_mon d
      JOIN mon_an m ON d.mon_an_id = m.id
      JOIN ban b ON d.ban_id = b.id
      WHERE d.trang_thai IN ('cho_xac_nhan', 'dang_che_bien')
      ORDER BY d.thu_tu_uu_tien ASC, d.created_at ASC
    `;
    const orders = await query(sql);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Tạo đơn gọi món mới (POS Order)
export async function createOrder(req, res) {
  try {
    const { ban_id, items, khach_hang_id, so_luong_khach = 1 } = req.body;

    if (!ban_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn bàn và ít nhất 1 món ăn.' });
    }

    const table = await getOne('SELECT * FROM ban WHERE id = ?', [ban_id]);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn.' });
    }

    // Tự động chuyển bàn sang trạng thái 'co_khach'
    if (table.trang_thai === 'trong' || table.trang_thai === 'da_dat') {
      await execute(`
        UPDATE ban 
        SET trang_thai = 'co_khach', so_luong_khach = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [so_luong_khach || table.so_luong_khach || 1, ban_id]);
      
      const updatedTable = await getOne('SELECT * FROM ban WHERE id = ?', [ban_id]);
      emitTableUpdate(updatedTable);
    }

    const createdOrders = [];

    for (const item of items) {
      const dish = await getOne('SELECT * FROM mon_an WHERE id = ?', [item.mon_an_id]);
      if (!dish) continue;

      const don_gia = dish.gia;
      const so_luong = Number(item.so_luong) || 1;
      const tong_tien = don_gia * so_luong;
      const options_json = typeof item.options === 'object' ? JSON.stringify(item.options) : (item.options || '{}');

      const result = await execute(`
        INSERT INTO dat_mon (ban_id, mon_an_id, khach_hang_id, so_luong, don_gia, tong_tien, options_json, ghi_chu, trang_thai, phuong_thuc_thanh_toan, thu_tu_uu_tien)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cho_xac_nhan', 'chua_thanh_toan', ?)
      `, [ban_id, item.mon_an_id, khach_hang_id || null, so_luong, don_gia, tong_tien, options_json, item.ghi_chu || '', item.priority || 1]);

      const newOrder = await getOne(`
        SELECT d.*, m.ten_mon, m.hinh_anh, b.so_ban, b.khu_vuc
        FROM dat_mon d
        JOIN mon_an m ON d.mon_an_id = m.id
        JOIN ban b ON d.ban_id = b.id
        WHERE d.id = ?
      `, [result.insertId]);

      createdOrders.push(newOrder);
      emitNewOrder(newOrder);
    }

    res.status(201).json({
      success: true,
      message: 'Gọi món thành công! Đã gửi thông báo tới Bếp.',
      orders: createdOrders
    });
  } catch (error) {
    console.error('Lỗi createOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Cập nhật trạng thái chế biến món ăn & Tự động trừ kho theo định lượng BOM
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    const order = await getOne('SELECT * FROM dat_mon WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn món.' });
    }

    // Nếu chuyển sang 'dang_che_bien' -> Tự động trừ nguyên liệu trong kho theo định lượng (BOM)
    if (trang_thai === 'dang_che_bien' && order.trang_thai === 'cho_xac_nhan') {
      const boms = await query('SELECT * FROM mon_an_nguyen_lieu WHERE mon_an_id = ?', [order.mon_an_id]);
      for (const bom of boms) {
        const soLuongTru = bom.so_luong_can * order.so_luong;
        await execute(`
          UPDATE nguyen_lieu 
          SET so_luong_ton = MAX(0, so_luong_ton - ?), updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [soLuongTru, bom.nguyen_lieu_id]);
      }
    }

    await execute(`
      UPDATE dat_mon 
      SET trang_thai = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [trang_thai, id]);

    const updated = await getOne(`
      SELECT d.*, m.ten_mon, b.so_ban 
      FROM dat_mon d
      JOIN mon_an m ON d.mon_an_id = m.id
      JOIN ban b ON d.ban_id = b.id
      WHERE d.id = ?
    `, [id]);

    emitOrderStatusUpdate(updated);

    res.json({ success: true, message: `Đã cập nhật trạng thái sang: ${trang_thai}`, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Thanh toán hóa đơn cho Bàn
export async function payBill(req, res) {
  try {
    const { ban_id } = req.params;
    const { phuong_thuc_thanh_toan = 'tien_mat', khach_hang_id, discount = 0 } = req.body;

    const unpaidItems = await query(`
      SELECT * FROM dat_mon 
      WHERE ban_id = ? AND phuong_thuc_thanh_toan = 'chua_thanh_toan' AND trang_thai != 'da_huy'
    `, [ban_id]);

    if (unpaidItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Bàn này không có món nào cần thanh toán.' });
    }

    let tongTien = unpaidItems.reduce((sum, item) => sum + (item.tong_tien || 0), 0);
    const finalTotal = Math.max(0, tongTien - discount);

    // Cập nhật các món sang trạng thái 'hoan_thanh' và đã thanh toán
    await execute(`
      UPDATE dat_mon
      SET phuong_thuc_thanh_toan = ?,
          trang_thai = 'hoan_thanh',
          updated_at = CURRENT_TIMESTAMP
      WHERE ban_id = ? AND phuong_thuc_thanh_toan = 'chua_thanh_toan' AND trang_thai != 'da_huy'
    `, [phuong_thuc_thanh_toan, ban_id]);

    // Tích điểm cho khách hàng nếu có
    if (khach_hang_id) {
      const diemCong = Math.floor(finalTotal / 100000); // 100.000đ = 1 điểm
      await execute(`
        UPDATE khach_hang
        SET diem_tich_luy = diem_tich_luy + ?,
            tong_chi_tieu = tong_chi_tieu + ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [diemCong, finalTotal, khach_hang_id]);
    }

    // Giải phóng bàn ăn về trạng thái 'trong'
    await execute(`
      UPDATE ban
      SET trang_thai = 'trong', so_luong_khach = 0, yeu_cau_thanh_toan = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [ban_id]);

    const updatedTable = await getOne('SELECT * FROM ban WHERE id = ?', [ban_id]);
    emitTableUpdate(updatedTable);

    res.json({
      success: true,
      message: 'Thanh toán thành công! Bàn đã được dọn sạch.',
      billSummary: {
        ban_id,
        tongTien,
        discount,
        finalTotal,
        phuong_thuc_thanh_toan,
        so_mon: unpaidItems.length
      }
    });
  } catch (error) {
    console.error('Lỗi payBill:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
