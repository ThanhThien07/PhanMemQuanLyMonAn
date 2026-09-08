import { execute, query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('🔄 Đang khởi tạo và nạp dữ liệu CSDL...');

  try {
    // 1. Tạo bảng loai_mon
    await execute(`
      CREATE TABLE IF NOT EXISTS loai_mon (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ma_loai VARCHAR(20) NOT NULL UNIQUE,
        ten_loai VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Tạo bảng mon_an
    await execute(`
      CREATE TABLE IF NOT EXISTS mon_an (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ten_mon VARCHAR(150) NOT NULL,
        loai_mon_id INTEGER,
        gia REAL NOT NULL DEFAULT 0,
        mo_ta TEXT,
        hinh_anh VARCHAR(255),
        trang_thai VARCHAR(20) DEFAULT 'con_hang',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loai_mon_id) REFERENCES loai_mon(id) ON DELETE SET NULL
      )
    `);

    // 3. Tạo bảng ban
    await execute(`
      CREATE TABLE IF NOT EXISTS ban (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        so_ban INTEGER NOT NULL UNIQUE,
        suc_chua INTEGER NOT NULL DEFAULT 4,
        trang_thai VARCHAR(20) DEFAULT 'trong',
        khu_vuc VARCHAR(50) DEFAULT 'Tầng 1',
        yeu_cau_thanh_toan INTEGER DEFAULT 0,
        so_luong_khach INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Tạo bảng dat_ban_truoc
    await execute(`
      CREATE TABLE IF NOT EXISTS dat_ban_truoc (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ma_reservation VARCHAR(50) NOT NULL UNIQUE,
        ten_khach VARCHAR(100) NOT NULL,
        sdt VARCHAR(20) NOT NULL,
        ban_id INTEGER,
        thoi_gian_hen DATETIME NOT NULL,
        so_luong_khach INTEGER NOT NULL DEFAULT 2,
        tien_coc REAL NOT NULL DEFAULT 0,
        trang_thai VARCHAR(20) DEFAULT 'da_xac_nhan',
        ghi_chu VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ban_id) REFERENCES ban(id) ON DELETE SET NULL
      )
    `);

    // 5. Tạo bảng khach_hang
    await execute(`
      CREATE TABLE IF NOT EXISTS khach_hang (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ho_ten VARCHAR(100) NOT NULL,
        so_dien_thoai VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100),
        diem_tich_luy INTEGER DEFAULT 0,
        hang_thanh_vien VARCHAR(20) DEFAULT 'Dong',
        tong_chi_tieu REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Tạo bảng users
    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'nhan_vien',
        so_dien_thoai VARCHAR(20),
        trang_thai VARCHAR(20) DEFAULT 'hoat_dong',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Tạo bảng nguyen_lieu
    await execute(`
      CREATE TABLE IF NOT EXISTS nguyen_lieu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ten_nguyen_lieu VARCHAR(150) NOT NULL,
        don_vi_tinh VARCHAR(20) NOT NULL DEFAULT 'kg',
        so_luong_ton REAL NOT NULL DEFAULT 0,
        gia_nhap_trung_binh REAL NOT NULL DEFAULT 0,
        dinh_muc_toi_thieu REAL NOT NULL DEFAULT 5,
        han_su_dung DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Tạo bảng mon_an_nguyen_lieu (BOM)
    await execute(`
      CREATE TABLE IF NOT EXISTS mon_an_nguyen_lieu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mon_an_id INTEGER NOT NULL,
        nguyen_lieu_id INTEGER NOT NULL,
        so_luong_can REAL NOT NULL DEFAULT 1,
        don_vi_tinh VARCHAR(20) NOT NULL DEFAULT 'kg',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE,
        FOREIGN KEY (nguyen_lieu_id) REFERENCES nguyen_lieu(id) ON DELETE CASCADE
      )
    `);

    // 9. Tạo bảng nha_cung_cap
    await execute(`
      CREATE TABLE IF NOT EXISTS nha_cung_cap (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ma_ncc VARCHAR(50) NOT NULL UNIQUE,
        ten_ncc VARCHAR(150) NOT NULL,
        so_dien_thoai VARCHAR(20),
        email VARCHAR(100),
        dia_chi VARCHAR(255),
        danh_gia_sao REAL DEFAULT 5.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Tạo bảng dat_mon
    await execute(`
      CREATE TABLE IF NOT EXISTS dat_mon (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ban_id INTEGER NOT NULL,
        mon_an_id INTEGER NOT NULL,
        khach_hang_id INTEGER,
        so_luong INTEGER NOT NULL DEFAULT 1,
        don_gia REAL NOT NULL DEFAULT 0,
        tong_tien REAL NOT NULL DEFAULT 0,
        options_json TEXT,
        ghi_chu VARCHAR(255),
        trang_thai VARCHAR(20) DEFAULT 'cho_xac_nhan',
        phuong_thuc_thanh_toan VARCHAR(20) DEFAULT 'chua_thanh_toan',
        session_token VARCHAR(100),
        thu_tu_uu_tien INTEGER DEFAULT 1,
        so_luong_khach INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ban_id) REFERENCES ban(id) ON DELETE CASCADE,
        FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE,
        FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE SET NULL
      )
    `);

    // 11. Tạo bảng danh_gia_mon_an
    await execute(`
      CREATE TABLE IF NOT EXISTS danh_gia_mon_an (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dat_mon_id INTEGER,
        ban_id INTEGER,
        so_sao INTEGER NOT NULL DEFAULT 5,
        noi_dung_danh_gia TEXT,
        canh_bao_do INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dat_mon_id) REFERENCES dat_mon(id) ON DELETE CASCADE,
        FOREIGN KEY (ban_id) REFERENCES ban(id) ON DELETE SET NULL
      )
    `);

    // 12. Tạo bảng bao_cao_quan_ly
    await execute(`
      CREATE TABLE IF NOT EXISTS bao_cao_quan_ly (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ma_bao_cao VARCHAR(50) NOT NULL UNIQUE,
        ngay_lap DATE NOT NULL,
        nguoi_lap VARCHAR(100) NOT NULL,
        ca_lam_viec VARCHAR(50) DEFAULT 'Ca Sáng',
        tong_so_hoa_don INTEGER DEFAULT 0,
        tong_luong_khach INTEGER DEFAULT 0,
        tong_doanh_thu REAL DEFAULT 0,
        doanh_thu_tien_mat REAL DEFAULT 0,
        doanh_thu_chuyen_khoan REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Kiểm tra và chèn dữ liệu mẫu nếu bảng users rỗng
    const existingUsers = await query('SELECT count(*) as count FROM users');
    if (existingUsers[0]?.count === 0) {
      console.log('🌱 Đang chèn dữ liệu mẫu khởi đầu...');
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = await bcrypt.hash('123456', salt);

      // Chèn Users
      await execute(`
        INSERT INTO users (name, email, password, role, so_dien_thoai, trang_thai) VALUES
        ('Nguyễn Ngọc Hà Thảo (Quản Lý)', 'admin@nhahang.com', ?, 'admin', '0901234567', 'hoat_dong'),
        ('Trần Văn Thu Ngân', 'thungan@nhahang.com', ?, 'nhan_vien', '0902345678', 'hoat_dong'),
        ('Lê Bếp Trưởng', 'bep@nhahang.com', ?, 'bep', '0903456789', 'hoat_dong'),
        ('Phạm Phục Vụ', 'phucvu@nhahang.com', ?, 'nhan_vien', '0904567890', 'hoat_dong')
      `, [defaultPassword, defaultPassword, defaultPassword, defaultPassword]);

      // Chèn Loại Món
      await execute(`
        INSERT INTO loai_mon (ma_loai, ten_loai) VALUES
        ('KV', 'Món Khai Vị'),
        ('MC', 'Món Chính Đặc Sắc'),
        ('NUONG', 'Món Nướng BBQ'),
        ('HAISAN', 'Hải Sản Tươi Sống'),
        ('TM', 'Tráng Miệng'),
        ('DU', 'Đồ Uống & Rượu Vang')
      `);

      // Chèn Món Ăn
      await execute(`
        INSERT INTO mon_an (ten_mon, loai_mon_id, gia, mo_ta, hinh_anh, trang_thai) VALUES
        ('Bò Wagyu A5 Nướng Sốt Tiêu Đen', 3, 450000, 'Thịt bò Wagyu vân mỡ tuyệt hảo nướng than hoa kèm sốt tiêu Phú Quốc đặc biệt', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', 'con_hang'),
        ('Tôm Hùm Alaska Sốt Bơ Tỏi', 4, 680000, 'Tôm hùm Alaska tươi nguyên con nướng bơ tỏi thơm lừng kèm bánh mì nướng', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500', 'con_hang'),
        ('Lẩu Hải Sản Hoàng Gia', 4, 520000, 'Nước dùng chua cay đậm đà, tôm sú, mực ống, cua biển và nấm tươi', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', 'con_hang'),
        ('Salad Cá Hồi Xông Khói Sốt Mè Rang', 1, 135000, 'Cá hồi Na Uy xông khói, xà lách Romanie, trứng cá chuồn sốt mè Nhật Bản', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', 'con_hang'),
        ('Súp Bào Ngư Vi Cá Thượng Hạng', 1, 280000, 'Bào ngư tươi hầm nước cốt gà thượng hạng thơm bùi bổ dưỡng', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', 'con_hang'),
        ('Sườn Heo Nướng Tảng BBQ', 3, 320000, 'Sườn heo ướp sốt BBQ đậm vị nướng chậm 4 tiếng mềm tan trong miệng', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', 'con_hang'),
        ('Gà Ta Hấp Muối Hoa Tiêu', 2, 260000, 'Gà đồi hấp muối hột giữ trọn độ ngọt dai tự nhiên kèm muối ớt chanh', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500', 'con_hang'),
        ('Cơm Chiên Hải Sản Hoàng Bào', 2, 160000, 'Cơm chiên hạt ngọc, tôm, mực, cồi sò điệp gói trong lớp trứng mỏng', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500', 'con_hang'),
        ('Bánh Mousse Chanh Leo Tráng Miệng', 5, 65000, 'Bánh mềm xốp chua ngọt thanh mát giải ngấy sau bữa tiệc', 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', 'con_hang'),
        ('Trà Đào Cam Sả Tươi', 6, 45000, 'Trà đen Ceylon ủ lạnh kết hợp đào miếng giòn ngọt và cam vàng sả tươi', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', 'con_hang'),
        ('Rượu Vang Đỏ Cabernet Sauvignon', 6, 850000, 'Vang đỏ Chile 2020 hậu vị tannin mượt mà, kết hợp hoàn hảo với bò Wagyu', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500', 'con_hang')
      `);

      // Chèn Bàn Ăn
      await execute(`
        INSERT INTO ban (so_ban, suc_chua, trang_thai, khu_vuc, so_luong_khach) VALUES
        (1, 4, 'trong', 'Tầng 1 - Sảnh Chính', 0),
        (2, 4, 'co_khach', 'Tầng 1 - Sảnh Chính', 3),
        (3, 2, 'trong', 'Tầng 1 - Sảnh Chính', 0),
        (4, 6, 'co_khach', 'Tầng 1 - Sảnh Chính', 5),
        (5, 8, 'da_dat', 'Tầng 1 - Cửa Sổ View', 0),
        (6, 4, 'trong', 'Tầng 2 - Ban Công', 0),
        (7, 4, 'trong', 'Tầng 2 - Ban Công', 0),
        (8, 6, 'trong', 'Tầng 2 - Ban Công', 0),
        (9, 10, 'trong', 'Phòng VIP 1 (Hoàng Gia)', 0),
        (10, 12, 'co_khach', 'Phòng VIP 2 (Kim Cương)', 8),
        (11, 4, 'trong', 'Tầng 1 - Sảnh Chính', 0),
        (12, 4, 'trong', 'Tầng 2 - Ban Công', 0)
      `);

      // Chèn Nguyên Liệu Kho
      await execute(`
        INSERT INTO nguyen_lieu (ten_nguyen_lieu, don_vi_tinh, so_luong_ton, gia_nhap_trung_binh, dinh_muc_toi_thieu) VALUES
        ('Thịt Bò Wagyu A5', 'kg', 18.5, 950000, 5),
        ('Tôm Hùm Alaska', 'kg', 8.2, 1200000, 3),
        ('Cá Hồi Na Uy Tươi', 'kg', 12.0, 380000, 4),
        ('Sườn Heo Tươi Cắt Tảng', 'kg', 25.0, 140000, 8),
        ('Gà Ta Thả Vườn', 'con', 30.0, 160000, 10),
        ('Gạo Thơm Lài', 'kg', 85.0, 22000, 20),
        ('Bơ Lạt Anchor', 'kg', 4.5, 180000, 5), -- Dưới định mức (Cảnh báo)
        ('Tiêu Đen Phú Quốc', 'kg', 3.0, 220000, 2),
        ('Rau Xà Lách Romanie', 'kg', 14.0, 45000, 5),
        ('Vang Đỏ Chile Chai', 'chai', 24.0, 450000, 6)
      `);

      // Chèn Định Lượng BOM
      await execute(`
        INSERT INTO mon_an_nguyen_lieu (mon_an_id, nguyen_lieu_id, so_luong_can, don_vi_tinh) VALUES
        (1, 1, 0.25, 'kg'), -- Bò Wagyu 250g
        (1, 8, 0.02, 'kg'), -- Tiêu 20g
        (2, 2, 0.50, 'kg'), -- Tôm hùm 500g
        (2, 7, 0.05, 'kg'), -- Bơ lạt 50g
        (4, 3, 0.12, 'kg'), -- Cá hồi 120g
        (4, 9, 0.15, 'kg'), -- Rau xà lách 150g
        (6, 4, 0.40, 'kg'), -- Sườn 400g
        (7, 5, 1.00, 'con') -- Gà 1 con
      `);

      // Chèn Khách Hàng
      await execute(`
        INSERT INTO khach_hang (ho_ten, so_dien_thoai, email, diem_tich_luy, hang_thanh_vien, tong_chi_tieu) VALUES
        ('Nguyễn Văn An', '0912345678', 'an.nguyen@gmail.com', 450, 'Vang', 14500000),
        ('Trần Thị Bích', '0987654321', 'bich.tran@gmail.com', 820, 'KimCuong', 32000000),
        ('Lê Hoàng Nam', '0933112233', 'nam.le@gmail.com', 120, 'Dong', 2800000),
        ('Vũ Thùy Dương', '0977889900', 'duong.vu@gmail.com', 260, 'Bac', 6500000)
      `);

      // Chèn Nhà Cung Cấp
      await execute(`
        INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, so_dien_thoai, email, dia_chi, danh_gia_sao) VALUES
        ('NCC_WAGYU', 'Công Ty Thực Phẩm Sạch Wagyu Japan', '0283899999', 'contact@wagyuvn.com', '120 Nguyễn Thị Minh Khai, Q.3, TP.HCM', 4.9),
        ('NCC_SEAFOOD', 'Vựa Hải Sản Biển Đông Cao Cấp', '0908887766', 'sales@haisanbiendong.vn', '45 Cảng Cát Lái, TP.Thủ Đức', 4.8),
        ('NCC_ORGANIC', 'Nông Trại Rau Củ Quả Đà Lạt GAP', '0263388888', 'dalatfarm@organic.vn', 'Thung Lũng Tình Yêu, TP.Đà Lạt', 4.7)
      `);

      // Chèn Đặt Bàn Trước
      await execute(`
        INSERT INTO dat_ban_truoc (ma_reservation, ten_khach, sdt, ban_id, thoi_gian_hen, so_luong_khach, tien_coc, trang_thai, ghi_chu) VALUES
        ('RES-20260908-01', 'Trần Thị Bích', '0987654321', 5, '2026-09-08 19:00:00', 8, 500000, 'da_xac_nhan', 'Tiệc sinh nhật, cần chuẩn bị nến và hoa'),
        ('RES-20260908-02', 'Lê Hoàng Nam', '0933112233', 9, '2026-09-08 20:00:00', 10, 1000000, 'da_xac_nhan', 'Gặp đối tác quan trọng VIP')
      `);

      // Chèn Đặt Món mẫu cho bàn 2 và bàn 4
      await execute(`
        INSERT INTO dat_mon (ban_id, mon_an_id, khach_hang_id, so_luong, don_gia, tong_tien, options_json, ghi_chu, trang_thai, phuong_thuc_thanh_toan, thu_tu_uu_tien) VALUES
        (2, 1, 1, 2, 450000, 900000, '{"do_chin":"Medium Rare","sot":"Tieu den"}', 'Nấu ít cay', 'dang_che_bien', 'chua_thanh_toan', 1),
        (2, 4, 1, 1, 135000, 135000, '{}', 'Sốt để riêng', 'da_phuc_vu', 'chua_thanh_toan', 2),
        (2, 10, 1, 3, 45000, 135000, '{"da":"Ít đá","duong":"70%"}', '', 'da_phuc_vu', 'chua_thanh_toan', 1),
        (4, 2, 3, 1, 680000, 680000, '{"sot":"Bo toi"}', 'Làm nóng', 'cho_xac_nhan', 'chua_thanh_toan', 1),
        (4, 3, 3, 1, 520000, 520000, '{"cay":"Vừa"}', '', 'dang_che_bien', 'chua_thanh_toan', 2)
      `);

      console.log('✅ Nạp dữ liệu mẫu thành công!');
    } else {
      console.log('ℹ️ CSDL đã có sẵn dữ liệu, bỏ qua bước nạp mẫu.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo CSDL:', error);
    throw error;
  }
}

// Chạy trực tiếp nếu file được gọi bằng node
if (process.argv[1]?.includes('seedDb.js')) {
  seedDatabase().then(() => {
    console.log('🎉 Hoàn tất kiểm tra CSDL!');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default seedDatabase;
