-- =========================================================================
-- ĐỀ TÀI: THIẾT KẾ VÀ CÀI ĐẶT CƠ SỞ DỮ LIỆU PHẦN MỀM QUẢN LÝ NHÀ HÀNG
-- MÔN HỌC: HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU
-- HỆ QUẢN TRỊ: MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine)
-- =========================================================================

DROP DATABASE IF EXISTS `quan_ly_nha_hang`;
CREATE DATABASE `quan_ly_nha_hang` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quan_ly_nha_hang`;

-- =========================================================================
-- PHẦN 1: TẠO CÁC BẢNG DỮ LIỆU (DDL) VÀ RÀNG BUỘC TOÀN VẸN
-- =========================================================================

-- 1. Bảng Danh mục Loại Món Ăn
CREATE TABLE `loai_mon` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ma_loai` VARCHAR(20) NOT NULL UNIQUE,
    `ten_loai` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng Thực Đơn Món Ăn
CREATE TABLE `mon_an` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ten_mon` VARCHAR(150) NOT NULL,
    `loai_mon_id` BIGINT UNSIGNED NULL,
    `gia` DOUBLE NOT NULL DEFAULT 0 CHECK (`gia` >= 0),
    `mo_ta` TEXT NULL,
    `hinh_anh` VARCHAR(255) NULL,
    `trang_thai` ENUM('con_hang', 'tam_het', 'ngung_ban') DEFAULT 'con_hang',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_mon_an_loai` FOREIGN KEY (`loai_mon_id`) REFERENCES `loai_mon`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Bảng Bàn Ăn
CREATE TABLE `ban` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `so_ban` INT NOT NULL UNIQUE CHECK (`so_ban` > 0),
    `suc_chua` INT NOT NULL DEFAULT 4 CHECK (`suc_chua` > 0),
    `trang_thai` ENUM('trong', 'co_khach', 'da_dat') DEFAULT 'trong',
    `khu_vuc` VARCHAR(50) DEFAULT 'Tầng 1',
    `yeu_cau_thanh_toan` TINYINT(1) DEFAULT 0,
    `so_luong_khach` INT DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Bảng Đặt Bàn Trước (Reservation)
CREATE TABLE `dat_ban_truoc` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ma_reservation` VARCHAR(50) NOT NULL UNIQUE,
    `ten_khach` VARCHAR(100) NOT NULL,
    `sdt` VARCHAR(20) NOT NULL,
    `ban_id` BIGINT UNSIGNED NULL,
    `thoi_gian_hen` DATETIME NOT NULL,
    `so_luong_khach` INT NOT NULL DEFAULT 2 CHECK (`so_luong_khach` > 0),
    `tien_coc` DOUBLE NOT NULL DEFAULT 0 CHECK (`tien_coc` >= 0),
    `trang_thai` ENUM('cho_xac_nhan', 'da_xac_nhan', 'da_den', 'da_huy') DEFAULT 'da_xac_nhan',
    `ghi_chu` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_dat_ban_ban` FOREIGN KEY (`ban_id`) REFERENCES `ban`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Bảng Khách Hàng Thân Thiết (CRM)
CREATE TABLE `khach_hang` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ho_ten` VARCHAR(100) NOT NULL,
    `so_dien_thoai` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100) NULL,
    `diem_tich_luy` INT DEFAULT 0 CHECK (`diem_tich_luy` >= 0),
    `hang_thanh_vien` ENUM('Dong', 'Bac', 'Vang', 'KimCuong') DEFAULT 'Dong',
    `tong_chi_tieu` DOUBLE DEFAULT 0 CHECK (`tong_chi_tieu` >= 0),
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Bảng Người Dùng & Nhân Sự
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'nhan_vien', 'bep') NOT NULL DEFAULT 'nhan_vien',
    `so_dien_thoai` VARCHAR(20) NULL,
    `trang_thai` ENUM('hoat_dong', 'tam_khoa') DEFAULT 'hoat_dong',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Bảng Kho Nguyên Liệu
CREATE TABLE `nguyen_lieu` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ten_nguyen_lieu` VARCHAR(150) NOT NULL,
    `don_vi_tinh` VARCHAR(20) NOT NULL DEFAULT 'kg',
    `so_luong_ton` DOUBLE NOT NULL DEFAULT 0 CHECK (`so_luong_ton` >= 0),
    `gia_nhap_trung_binh` DOUBLE NOT NULL DEFAULT 0 CHECK (`gia_nhap_trung_binh` >= 0),
    `dinh_muc_toi_thieu` DOUBLE NOT NULL DEFAULT 5,
    `han_su_dung` DATE NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Bảng Định Lượng Nguyên Liệu Cho Món Ăn (BOM - Bill of Materials)
CREATE TABLE `mon_an_nguyen_lieu` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `mon_an_id` BIGINT UNSIGNED NOT NULL,
    `nguyen_lieu_id` BIGINT UNSIGNED NOT NULL,
    `so_luong_can` DOUBLE NOT NULL DEFAULT 1 CHECK (`so_luong_can` > 0),
    `don_vi_tinh` VARCHAR(20) NOT NULL DEFAULT 'kg',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bom_mon` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bom_nguyen_lieu` FOREIGN KEY (`nguyen_lieu_id`) REFERENCES `nguyen_lieu`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Bảng Nhà Cung Cấp
CREATE TABLE `nha_cung_cap` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ma_ncc` VARCHAR(50) NOT NULL UNIQUE,
    `ten_ncc` VARCHAR(150) NOT NULL,
    `so_dien_thoai` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `dia_chi` VARCHAR(255) NULL,
    `danh_gia_sao` DOUBLE DEFAULT 5.0 CHECK (`danh_gia_sao` BETWEEN 1 AND 5),
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Bảng Nghiệp Vụ Chính: Đặt Món & Chi Tiết Hóa Đơn (DAT_MON - Bảng nghiệp vụ có > 1.000 records)
CREATE TABLE `dat_mon` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ban_id` BIGINT UNSIGNED NOT NULL,
    `mon_an_id` BIGINT UNSIGNED NOT NULL,
    `khach_hang_id` BIGINT UNSIGNED NULL,
    `so_luong` INT NOT NULL DEFAULT 1 CHECK (`so_luong` > 0),
    `don_gia` DOUBLE NOT NULL DEFAULT 0 CHECK (`don_gia` >= 0),
    `tong_tien` DOUBLE NOT NULL DEFAULT 0 CHECK (`tong_tien` >= 0),
    `options_json` TEXT NULL COMMENT 'Lưu modifier/topping đã chọn',
    `ghi_chu` VARCHAR(255) NULL,
    `trang_thai` ENUM('cho_xac_nhan', 'dang_che_bien', 'da_phuc_vu', 'hoan_thanh', 'da_huy') DEFAULT 'cho_xac_nhan',
    `phuong_thuc_thanh_toan` ENUM('tien_mat', 'chuyen_khoan', 'the', 'chua_thanh_toan') DEFAULT 'chua_thanh_toan',
    `session_token` VARCHAR(100) NULL,
    `thu_tu_uu_tien` INT DEFAULT 1,
    `so_luong_khach` INT DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_dat_mon_ban` FOREIGN KEY (`ban_id`) REFERENCES `ban`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_dat_mon_mon` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_dat_mon_khach` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Bảng Đánh Giá Món Ăn (Customer Feedback)
CREATE TABLE `danh_gia_mon_an` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `dat_mon_id` BIGINT UNSIGNED NULL,
    `ban_id` BIGINT UNSIGNED NULL,
    `so_sao` INT NOT NULL DEFAULT 5 CHECK (`so_sao` BETWEEN 1 AND 5),
    `noi_dung_danh_gia` TEXT NULL,
    `canh_bao_do` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_dg_dat_mon` FOREIGN KEY (`dat_mon_id`) REFERENCES `dat_mon`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_dg_ban` FOREIGN KEY (`ban_id`) REFERENCES `ban`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. Bảng Báo Cáo Quản Lý Ca Trực & Doanh Thu
CREATE TABLE `bao_cao_quan_ly` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ma_bao_cao` VARCHAR(50) NOT NULL UNIQUE,
    `ngay_lap` DATE NOT NULL,
    `nguoi_lap` VARCHAR(100) NOT NULL,
    `ca_lam_viec` ENUM('Sang', 'Chieu', 'Toi', 'CaNgay') DEFAULT 'CaNgay',
    `tong_so_hoa_don` INT DEFAULT 0,
    `tong_luong_khach` INT DEFAULT 0,
    `tong_doanh_thu` DOUBLE DEFAULT 0,
    `doanh_thu_tien_mat` DOUBLE DEFAULT 0,
    `doanh_thu_chuyen_khoan` DOUBLE DEFAULT 0,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================================
-- PHẦN 2: TẠO CÁC INDEX TỐI ƯU TRUY XUẤT HIỆU NĂNG CAO
-- =========================================================================
CREATE INDEX `idx_dat_mon_ban_trangthai` ON `dat_mon` (`ban_id`, `trang_thai`);
CREATE INDEX `idx_dat_mon_created_at` ON `dat_mon` (`created_at`);
CREATE INDEX `idx_dat_mon_mon_an` ON `dat_mon` (`mon_an_id`);
CREATE INDEX `idx_dat_mon_khach` ON `dat_mon` (`khach_hang_id`);
CREATE INDEX `idx_ban_trang_thai` ON `ban` (`trang_thai`, `khu_vuc`);
CREATE INDEX `idx_khach_hang_sdt` ON `khach_hang` (`so_dien_thoai`);
CREATE INDEX `idx_nguyen_lieu_ton` ON `nguyen_lieu` (`so_luong_ton`);
CREATE INDEX `idx_dat_ban_hen` ON `dat_ban_truoc` (`thoi_gian_hen`, `trang_thai`);

-- =========================================================================
-- PHẦN 3: NẠP DỮ LIỆU MẪU (SEED DATA > 1.000 RECORDS)
-- =========================================================================

-- Nạp Danh mục Loại Món
INSERT INTO `loai_mon` (`id`, `ma_loai`, `ten_loai`) VALUES
(1, 'KHAI_VI', 'Món Khai Vị'),
(2, 'MON_CHINH', 'Món Chính Đặc Sắc'),
(3, 'HAI_SAN', 'Hải Sản Tươi Sống'),
(4, 'LAU_NUONG', 'Lẩu & Nướng BBQ'),
(5, 'TRANG_MIENG', 'Tráng Miệng'),
(6, 'DO_UONG', 'Đồ Uống & Rượu Vang');

-- Nạp Thực Đơn Món Ăn
INSERT INTO `mon_an` (`id`, `ten_mon`, `loai_mon_id`, `gia`, `mo_ta`, `trang_thai`) VALUES
(1, 'Gỏi Ngó Sen Tôm Thịt', 1, 85000, 'Gỏi ngó sen giòn ngọt kết hợp tôm sú và thịt ba chỉ', 'con_hang'),
(2, 'Súp Bào Ngư Vi Cá', 1, 150000, 'Súp bào ngư thượng hạng bồi bổ sức khỏe', 'con_hang'),
(3, 'Bò Wagyu A5 Nướng Đá Núi Lửa', 2, 450000, 'Thịt bò Wagyu Nhật Bản vân mỡ cẩm thạch tuyệt hảo', 'con_hang'),
(4, 'Sườn Cừu Nướng Thảo Mộc', 2, 280000, 'Sườn cừu non ướp lá hương thảo và sốt tiêu đen', 'con_hang'),
(5, 'Cua Hoàng Đế Hấp Bia', 3, 890000, 'Cua hoàng đế King Crab Alaska tươi sống', 'con_hang'),
(6, 'Tôm Hùm Bông Nướng Phô Mai', 3, 650000, 'Tôm hùm Nha Trang phủ sốt phô mai Mozzarella đút lò', 'con_hang'),
(7, 'Lẩu Thái Hải Sản Chua Cay', 4, 320000, 'Nước dùng Tomyum đậm đà kèm đĩa hải sản thập cẩm', 'con_hang'),
(8, 'Set Nướng Bò Mỹ Thượng Hạng', 4, 380000, 'Ba chỉ bò Mỹ, dẻ sườn ướp sốt cay Hàn Quốc', 'con_hang'),
(9, 'Bánh Mousse Chanh Leo', 5, 45000, 'Bánh ngọt mềm mịn thanh mát giải ngấy', 'con_hang'),
(10, 'Trà Đào Cam Sả', 6, 35000, 'Trà đào tươi kết hợp nước cam và hương sả thơm lừng', 'con_hang'),
(11, 'Rượu Vang Đỏ Bordeaux 2018', 6, 550000, 'Vang đỏ Pháp hương gỗ sồi cao cấp', 'con_hang');

-- Nạp Bàn Ăn
INSERT INTO `ban` (`id`, `so_ban`, `suc_chua`, `trang_thai`, `khu_vuc`) VALUES
(1, 1, 4, 'trong', 'Tầng 1 - Sảnh Chính'),
(2, 2, 4, 'co_khach', 'Tầng 1 - Sảnh Chính'),
(3, 3, 2, 'trong', 'Tầng 1 - Sảnh Chính'),
(4, 4, 6, 'da_dat', 'Tầng 1 - Sảnh Chính'),
(5, 5, 8, 'trong', 'Tầng 2 - Phòng VIP 1'),
(6, 6, 12, 'trong', 'Tầng 2 - Phòng VIP 2'),
(7, 7, 4, 'trong', 'Tầng 3 - Sân Thượng'),
(8, 8, 4, 'co_khach', 'Tầng 3 - Sân Thượng');

-- Nạp Khách Hàng Thân Thiết
INSERT INTO `khach_hang` (`id`, `ho_ten`, `so_dien_thoai`, `email`, `diem_tich_luy`, `hang_thanh_vien`, `tong_chi_tieu`) VALUES
(1, 'Nguyễn Văn An', '0901234567', 'an.nguyen@gmail.com', 120, 'Vang', 12500000),
(2, 'Trần Thị Bình', '0912345678', 'binh.tran@yahoo.com', 45, 'Bac', 4800000),
(3, 'Lê Hoàng Cường', '0987654321', 'cuong.le@gmail.com', 310, 'KimCuong', 32000000),
(4, 'Phạm Minh Đức', '0978112233', 'duc.pm@outlook.com', 15, 'Dong', 1600000),
(5, 'Võ Tuyết Mai', '0933445566', 'mai.vo@gmail.com', 80, 'Bac', 8200000);

-- Nạp Người Dùng Hệ Thống
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `so_dien_thoai`) VALUES
(1, 'Quản Trị Viên', 'admin@nhahang.com', '$2y$12$eImiTXuWVxfM379Y4rmAHuGT7dF7T3m.wR2LpQxWc0X4L.4P6bJmK', 'admin', '0900000001'),
(2, 'Thu Ngân Hương', 'thungan@nhahang.com', '$2y$12$eImiTXuWVxfM379Y4rmAHuGT7dF7T3m.wR2LpQxWc0X4L.4P6bJmK', 'nhan_vien', '0900000002'),
(3, 'Bếp Trưởng Tuấn', 'bep@nhahang.com', '$2y$12$eImiTXuWVxfM379Y4rmAHuGT7dF7T3m.wR2LpQxWc0X4L.4P6bJmK', 'bep', '0900000003');

-- Nạp Kho Nguyên Liệu
INSERT INTO `nguyen_lieu` (`id`, `ten_nguyen_lieu`, `don_vi_tinh`, `so_luong_ton`, `gia_nhap_trung_binh`, `dinh_muc_toi_thieu`, `han_su_dung`) VALUES
(1, 'Thịt Bò Wagyu A5', 'kg', 15.5, 2500000, 5, '2026-10-30'),
(2, 'Cua Hoàng Đế King Crab', 'kg', 22.0, 1200000, 8, '2026-09-15'),
(3, 'Tôm Sú Tươi', 'kg', 35.0, 220000, 10, '2026-09-05'),
(4, 'Rau Ngó Sen Tươi', 'kg', 18.0, 35000, 5, '2026-09-01'),
(5, 'Thịt Ba Chỉ Bò Mỹ', 'kg', 40.0, 180000, 15, '2026-11-20'),
(6, 'Phô Mai Mozzarella', 'kg', 25.0, 140000, 5, '2026-12-31');

-- Nạp Nhà Cung Cấp
INSERT INTO `nha_cung_cap` (`id`, `ma_ncc`, `ten_ncc`, `so_dien_thoai`, `email`, `dia_chi`, `danh_gia_sao`) VALUES
(1, 'NCC-HAI-SAN', 'Công Ty Thủy Hải Sản Biển Đông', '0283888999', 'haisan@biendong.vn', '123 Cảng Cá, Vũng Tàu', 4.9),
(2, 'NCC-THIT-BO', 'Tập Đoàn Thực Phẩm Sạch Wagyu Foods', '0243999888', 'contact@wagyufoods.com', '456 Hoàng Mai, Hà Nội', 5.0),
(3, 'NCC-NONG-SAN', 'Nông Sản Hữu Cơ Đà Lạt GAP', '0263377889', 'dalatgap@organic.vn', '789 Phường 9, Đà Lạt', 4.8);

-- Nạp Lịch Đặt Bàn Mẫu
INSERT INTO `dat_ban_truoc` (`id`, `ma_reservation`, `ten_khach`, `sdt`, `ban_id`, `thoi_gian_hen`, `so_luong_khach`, `tien_coc`, `trang_thai`) VALUES
(1, 'RES-2026-001', 'Trần Thị Bình', '0912345678', 4, '2026-08-25 18:30:00', 6, 500000, 'da_xac_nhan'),
(2, 'RES-2026-002', 'Lê Hoàng Cường', '0987654321', 6, '2026-08-26 19:00:00', 10, 1000000, 'da_xac_nhan');

-- Sinh 1.200 Records Mẫu cho Bảng Nghiệp Vụ Chính: DAT_MON
DELIMITER //
CREATE PROCEDURE `sp_SinhDuLieuMauDatMon`()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE v_ban_id BIGINT;
    DECLARE v_mon_id BIGINT;
    DECLARE v_khach_id BIGINT;
    DECLARE v_sl INT;
    DECLARE v_gia DOUBLE;
    DECLARE v_tt DOUBLE;
    DECLARE v_trang_thai VARCHAR(50);
    DECLARE v_pttt VARCHAR(50);
    DECLARE v_ngay_tao DATETIME;

    WHILE i <= 1200 DO
        SET v_ban_id = FLOOR(1 + (RAND() * 8));
        SET v_mon_id = FLOOR(1 + (RAND() * 11));
        SET v_khach_id = IF(RAND() > 0.3, FLOOR(1 + (RAND() * 5)), NULL);
        SET v_sl = FLOOR(1 + (RAND() * 3));
        
        -- Lấy giá món
        SELECT `gia` INTO v_gia FROM `mon_an` WHERE `id` = v_mon_id;
        SET v_tt = v_gia * v_sl;

        -- Xác định trạng thái & phương thức thanh toán
        IF i <= 1000 THEN
            SET v_trang_thai = 'hoan_thanh';
            SET v_pttt = IF(RAND() > 0.4, 'chuyen_khoan', 'tien_mat');
        ELSEIF i <= 1150 THEN
            SET v_trang_thai = 'da_phuc_vu';
            SET v_pttt = 'chua_thanh_toan';
        ELSE
            SET v_trang_thai = 'dang_che_bien';
            SET v_pttt = 'chua_thanh_toan';
        END IF;

        -- Tạo ngày ngẫu nhiên trong 60 ngày gần nhất
        SET v_ngay_tao = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) DAY) + INTERVAL FLOOR(RAND() * 86400) SECOND;

        INSERT INTO `dat_mon` (
            `ban_id`, `mon_an_id`, `khach_hang_id`, `so_luong`, `don_gia`,
            `tong_tien`, `ghi_chu`, `trang_thai`, `phuong_thuc_thanh_toan`, `created_at`
        ) VALUES (
            v_ban_id, v_mon_id, v_khach_id, v_sl, v_gia,
            v_tt, 'Order mô phỏng', v_trang_thai, v_pttt, v_ngay_tao
        );

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL `sp_SinhDuLieuMauDatMon`();
DROP PROCEDURE `sp_SinhDuLieuMauDatMon`;

-- =========================================================================
-- PHẦN 4: THIẾT KẾ CÁC STORED PROCEDURE
-- =========================================================================

-- Stored Procedure 1: Thêm món gọi mới vào bàn & tính tiền
DELIMITER //
CREATE PROCEDURE `sp_ThemMonGoiVaKiemTraTonKho`(
    IN  p_ban_id        BIGINT,
    IN  p_mon_an_id     BIGINT,
    IN  p_khach_id      BIGINT,
    IN  p_so_luong      INT,
    IN  p_options_json  TEXT,
    IN  p_ghi_chu       VARCHAR(255),
    OUT p_dat_mon_id    BIGINT,
    OUT p_status        VARCHAR(20),
    OUT p_message       VARCHAR(255)
)
BEGIN
    DECLARE v_gia_mon DOUBLE DEFAULT 0;
    DECLARE v_trang_thai_mon VARCHAR(50);
    DECLARE v_tong_tien DOUBLE DEFAULT 0;

    -- Kiểm tra món ăn
    SELECT `gia`, `trang_thai` INTO v_gia_mon, v_trang_thai_mon 
    FROM `mon_an` WHERE `id` = p_mon_an_id;

    IF v_gia_mon IS NULL THEN
        SET p_status = 'ERROR';
        SET p_message = 'Món ăn không tồn tại trong thực đơn!';
    ELSEIF v_trang_thai_mon = 'ngung_ban' OR v_trang_thai_mon = 'tam_het' THEN
        SET p_status = 'ERROR';
        SET p_message = 'Món ăn hiện đang tạm hết hoặc ngưng phục vụ!';
    ELSEIF p_so_luong <= 0 THEN
        SET p_status = 'ERROR';
        SET p_message = 'Số lượng món đặt phải lớn hơn 0!';
    ELSE
        SET v_tong_tien = v_gia_mon * p_so_luong;

        INSERT INTO `dat_mon` (
            `ban_id`, `mon_an_id`, `khach_hang_id`, `so_luong`,
            `don_gia`, `tong_tien`, `options_json`, `ghi_chu`, `trang_thai`
        ) VALUES (
            p_ban_id, p_mon_an_id, p_khach_id, p_so_luong,
            v_gia_mon, v_tong_tien, p_options_json, p_ghi_chu, 'cho_xac_nhan'
        );
        SET p_dat_mon_id = LAST_INSERT_ID();

        UPDATE `ban` SET `trang_thai` = 'co_khach' WHERE `id` = p_ban_id;

        SET p_status = 'SUCCESS';
        SET p_message = 'Thêm món thành công vào bàn!';
    END IF;
END //
DELIMITER ;

-- Stored Procedure 2: Thanh toán hóa đơn bàn ăn & tích điểm CRM
DELIMITER //
CREATE PROCEDURE `sp_ThanhToanHoaDonBanAn`(
    IN  p_ban_id        BIGINT,
    IN  p_pttt          VARCHAR(50),
    IN  p_khach_id      BIGINT,
    IN  p_diem_dung     INT,
    OUT p_tam_tinh      DOUBLE,
    OUT p_giam_gia      DOUBLE,
    OUT p_thuc_thu      DOUBLE,
    OUT p_diem_moi      INT,
    OUT p_status        VARCHAR(20)
)
BEGIN
    DECLARE v_diem_hien_tai INT DEFAULT 0;
    DECLARE v_diem_tich_them INT DEFAULT 0;

    SELECT IFNULL(SUM(`tong_tien`), 0) INTO p_tam_tinh 
    FROM `dat_mon` 
    WHERE `ban_id` = p_ban_id AND `trang_thai` NOT IN ('da_huy', 'hoan_thanh');

    IF p_tam_tinh <= 0 THEN
        SET p_status = 'EMPTY_BILL';
        SET p_giam_gia = 0;
        SET p_thuc_thu = 0;
    ELSE
        SET p_giam_gia = 0;
        IF p_khach_id IS NOT NULL AND p_diem_dung > 0 THEN
            SELECT `diem_tich_luy` INTO v_diem_hien_tai FROM `khach_hang` WHERE `id` = p_khach_id;
            IF v_diem_hien_tai >= p_diem_dung THEN
                SET p_giam_gia = p_diem_dung * 1000;
                IF p_giam_gia > p_tam_tinh THEN SET p_giam_gia = p_tam_tinh; END IF;
            END IF;
        END IF;

        SET p_thuc_thu = p_tam_tinh - p_giam_gia;

        UPDATE `dat_mon` 
        SET `trang_thai` = 'hoan_thanh', `phuong_thuc_thanh_toan` = p_pttt
        WHERE `ban_id` = p_ban_id AND `trang_thai` NOT IN ('da_huy', 'hoan_thanh');

        IF p_khach_id IS NOT NULL THEN
            SET v_diem_tich_them = FLOOR(p_thuc_thu / 100000);
            UPDATE `khach_hang` 
            SET `diem_tich_luy` = `diem_tich_luy` - p_diem_dung + v_diem_tich_them,
                `tong_chi_tieu` = `tong_chi_tieu` + p_thuc_thu
            WHERE `id` = p_khach_id;
            SELECT `diem_tich_luy` INTO p_diem_moi FROM `khach_hang` WHERE `id` = p_khach_id;
        END IF;

        UPDATE `ban` SET `trang_thai` = 'trong', `yeu_cau_thanh_toan` = 0, `so_luong_khach` = 0 WHERE `id` = p_ban_id;
        SET p_status = 'SUCCESS';
    END IF;
END //
DELIMITER ;

-- Stored Procedure 3: Thống kê doanh thu & Top món bán chạy
DELIMITER //
CREATE PROCEDURE `sp_ThongKeDoanhThuVaTopMonBanChay`(
    IN p_tu_ngay    DATE,
    IN p_den_ngay   DATE,
    IN p_top_limit  INT
)
BEGIN
    -- 1. Tổng quan các chỉ số tài chính
    SELECT 
        COUNT(`id`) AS `tong_so_luot_goi_mon`,
        IFNULL(SUM(`tong_tien`), 0) AS `tong_doanh_thu`,
        IFNULL(SUM(CASE WHEN `phuong_thuc_thanh_toan` = 'tien_mat' THEN `tong_tien` ELSE 0 END), 0) AS `doanh_thu_tien_mat`,
        IFNULL(SUM(CASE WHEN `phuong_thuc_thanh_toan` = 'chuyen_khoan' THEN `tong_tien` ELSE 0 END), 0) AS `doanh_thu_chuyen_khoan`
    FROM `dat_mon`
    WHERE `trang_thai` = 'hoan_thanh'
      AND DATE(`created_at`) BETWEEN p_tu_ngay AND p_den_ngay;

    -- 2. Top N món ăn bán chạy nhất
    SELECT 
        m.`id` AS `ma_mon`,
        m.`ten_mon`,
        l.`ten_loai`,
        SUM(d.`so_luong`) AS `tong_so_luong_ban`,
        SUM(d.`tong_tien`) AS `tong_doanh_thu_mon`
    FROM `dat_mon` d
    JOIN `mon_an` m ON d.`mon_an_id` = m.`id`
    LEFT JOIN `loai_mon` l ON m.`loai_mon_id` = l.`id`
    WHERE d.`trang_thai` = 'hoan_thanh'
      AND DATE(d.`created_at`) BETWEEN p_tu_ngay AND p_den_ngay
    GROUP BY m.`id`, m.`ten_mon`, l.`ten_loai`
    ORDER BY `tong_so_luong_ban` DESC
    LIMIT p_top_limit;
END //
DELIMITER ;

-- Stored Procedure 4: Tra cứu thực đơn & khả năng phục vụ
DELIMITER //
CREATE PROCEDURE `sp_TraCuuThucDonVaTonKho`(
    IN p_loai_id   BIGINT,
    IN p_gia_min   DOUBLE,
    IN p_gia_max   DOUBLE
)
BEGIN
    SELECT 
        m.`id`,
        m.`ten_mon`,
        l.`ten_loai`,
        m.`gia`,
        m.`trang_thai`
    FROM `mon_an` m
    LEFT JOIN `loai_mon` l ON m.`loai_mon_id` = l.`id`
    WHERE (p_loai_id IS NULL OR m.`loai_mon_id` = p_loai_id)
      AND (p_gia_min IS NULL OR m.`gia` >= p_gia_min)
      AND (p_gia_max IS NULL OR m.`gia` <= p_gia_max)
    ORDER BY m.`gia` ASC;
END //
DELIMITER ;

-- =========================================================================
-- PHẦN 5: THIẾT KẾ CÁC FUNCTION
-- =========================================================================

-- Function 1: Tính tổng tiền sau khấu trừ điểm thưởng và cộng thuế VAT
DELIMITER //
CREATE FUNCTION `fn_TinhTongTienSauGiamGia`(
    p_tam_tinh      DOUBLE,
    p_diem_dung     INT,
    p_vat_percent   DOUBLE
)
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE v_tien_giam DOUBLE DEFAULT 0;
    DECLARE v_tien_sau_giam DOUBLE DEFAULT 0;
    DECLARE v_tong_thanh_toan DOUBLE DEFAULT 0;

    IF p_tam_tinh <= 0 THEN RETURN 0; END IF;
    SET v_tien_giam = IFNULL(p_diem_dung, 0) * 1000;
    IF v_tien_giam > p_tam_tinh THEN SET v_tien_giam = p_tam_tinh; END IF;
    SET v_tien_sau_giam = p_tam_tinh - v_tien_giam;
    SET v_tong_thanh_toan = v_tien_sau_giam * (1 + IFNULL(p_vat_percent, 0) / 100);
    RETURN ROUND(v_tong_thanh_toan, 0);
END //
DELIMITER ;

-- Function 2: Kiểm tra bàn có khả dụng không tại một mốc thời gian
DELIMITER //
CREATE FUNCTION `fn_KiemTraBanKhaDung`(
    p_ban_id        BIGINT,
    p_thoi_gian_hen DATETIME
)
RETURNS TINYINT(1)
READS SQL DATA
BEGIN
    DECLARE v_trang_thai_hien_tai VARCHAR(20);
    DECLARE v_so_lich_trung INT DEFAULT 0;

    SELECT `trang_thai` INTO v_trang_thai_hien_tai FROM `ban` WHERE `id` = p_ban_id;
    IF v_trang_thai_hien_tai = 'co_khach' THEN RETURN 0; END IF;

    SELECT COUNT(*) INTO v_so_lich_trung 
    FROM `dat_ban_truoc`
    WHERE `ban_id` = p_ban_id
      AND `trang_thai` = 'da_xac_nhan'
      AND `thoi_gian_hen` BETWEEN DATE_SUB(p_thoi_gian_hen, INTERVAL 2 HOUR) 
                              AND DATE_ADD(p_thoi_gian_hen, INTERVAL 2 HOUR);

    IF v_so_lich_trung > 0 THEN RETURN 0; END IF;
    RETURN 1;
END //
DELIMITER ;

-- Function 3: Tự động xếp hạng thành viên theo tổng chi tiêu
DELIMITER //
CREATE FUNCTION `fn_XepHangKhachHang`(
    p_tong_chi_tieu DOUBLE
)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    IF p_tong_chi_tieu >= 20000000 THEN
        RETURN 'KimCuong';
    ELSEIF p_tong_chi_tieu >= 10000000 THEN
        RETURN 'Vang';
    ELSEIF p_tong_chi_tieu >= 3000000 THEN
        RETURN 'Bac';
    ELSE
        RETURN 'Dong';
    END IF;
END //
DELIMITER ;

-- =========================================================================
-- PHẦN 6: MINH HỌA GIAO TÁC (TRANSACTIONS) & XỬ LÝ ĐỒNG THỜI
-- =========================================================================

-- Tình huống Giao tác 1: Đặt bàn và cọc tiền an toàn ACID
START TRANSACTION;
SELECT `trang_thai` FROM `ban` WHERE `id` = 5 FOR UPDATE;
INSERT INTO `dat_ban_truoc` (`ma_reservation`, `ten_khach`, `sdt`, `ban_id`, `thoi_gian_hen`, `so_luong_khach`, `tien_coc`, `trang_thai`)
VALUES ('RES-TEST-01', 'Hoang Minh', '0933999888', 5, '2026-08-30 19:30:00', 4, 200000, 'da_xac_nhan');
UPDATE `ban` SET `trang_thai` = 'da_dat' WHERE `id` = 5;
COMMIT;

-- Hoàn tất thiết lập cơ sở dữ liệu
SELECT 'Database Setup Completed Successfully!' AS Status;
