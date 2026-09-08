import { query, getOne, execute } from '../config/db.js';
import { emitTableUpdate } from '../utils/socket.js';

// Lấy danh sách đặt bàn trước
export async function getReservations(req, res) {
  try {
    const { status, date } = req.query;
    let sql = `
      SELECT r.*, b.so_ban, b.khu_vuc 
      FROM dat_ban_truoc r
      LEFT JOIN ban b ON r.ban_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND r.trang_thai = ?';
      params.push(status);
    }

    if (date) {
      sql += " AND DATE(r.thoi_gian_hen) = DATE(?)";
      params.push(date);
    }

    sql += ' ORDER BY r.thoi_gian_hen ASC';

    const reservations = await query(sql, params);
    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Tạo lịch đặt bàn trước
export async function createReservation(req, res) {
  try {
    const { ten_khach, sdt, ban_id, thoi_gian_hen, so_luong_khach = 2, tien_coc = 0, ghi_chu = '' } = req.body;

    if (!ten_khach || !sdt || !thoi_gian_hen) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tên khách, SĐT và thời gian hẹn.' });
    }

    const ma_reservation = 'RES-' + Date.now().toString().slice(-6);

    const result = await execute(`
      INSERT INTO dat_ban_truoc (ma_reservation, ten_khach, sdt, ban_id, thoi_gian_hen, so_luong_khach, tien_coc, ghi_chu, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'da_xac_nhan')
    `, [ma_reservation, ten_khach, sdt, ban_id || null, thoi_gian_hen, so_luong_khach, tien_coc, ghi_chu]);

    // Nếu gán bàn ngay, cập nhật bàn sang 'da_dat'
    if (ban_id) {
      await execute("UPDATE ban SET trang_thai = 'da_dat' WHERE id = ? AND trang_thai = 'trong'", [ban_id]);
      const table = await getOne('SELECT * FROM ban WHERE id = ?', [ban_id]);
      if (table) emitTableUpdate(table);
    }

    const created = await getOne('SELECT * FROM dat_ban_truoc WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Tạo lịch đặt bàn thành công!', reservation: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Khách đến (Check-in)
export async function checkinReservation(req, res) {
  try {
    const { id } = req.params;
    const resv = await getOne('SELECT * FROM dat_ban_truoc WHERE id = ?', [id]);
    if (!resv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt bàn.' });
    }

    await execute("UPDATE dat_ban_truoc SET trang_thai = 'da_den' WHERE id = ?", [id]);

    if (resv.ban_id) {
      await execute("UPDATE ban SET trang_thai = 'co_khach', so_luong_khach = ? WHERE id = ?", [resv.so_luong_khach, resv.ban_id]);
      const table = await getOne('SELECT * FROM ban WHERE id = ?', [resv.ban_id]);
      if (table) emitTableUpdate(table);
    }

    res.json({ success: true, message: 'Check-in thành công! Khách đã vào bàn.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Hủy đặt bàn
export async function cancelReservation(req, res) {
  try {
    const { id } = req.params;
    const resv = await getOne('SELECT * FROM dat_ban_truoc WHERE id = ?', [id]);
    if (!resv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đặt bàn.' });
    }

    await execute("UPDATE dat_ban_truoc SET trang_thai = 'da_huy' WHERE id = ?", [id]);

    if (resv.ban_id) {
      await execute("UPDATE ban SET trang_thai = 'trong' WHERE id = ? AND trang_thai = 'da_dat'", [resv.ban_id]);
      const table = await getOne('SELECT * FROM ban WHERE id = ?', [resv.ban_id]);
      if (table) emitTableUpdate(table);
    }

    res.json({ success: true, message: 'Đã hủy lịch đặt bàn.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
