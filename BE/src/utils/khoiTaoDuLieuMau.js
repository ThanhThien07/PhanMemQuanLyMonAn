/**
 * @file khoiTaoDuLieuMau.js
 * @description Tập lệnh tự động nạp dữ liệu mẫu ban đầu (Seed Database Data) vào cơ sở dữ liệu MongoDB:
 * - 4 Tài khoản nhân sự phân quyền đa cấp (Admin, Thu ngân, Bếp trưởng, Phục vụ) với mật khẩu mặc định đã băm Bcrypt: 123456
 * - 6 Danh mục nhóm món ăn (Khai vị, Món chính, Nướng BBQ, Hải sản, Tráng miệng, Đồ uống)
 * - 11 Món ăn đặc sắc kèm hình ảnh, giá niêm yết và mô tả
 * - 12 Bàn ăn phân bố theo các khu vực (Sảnh chính, Ban công tầng 2, Phòng VIP Hoàng Gia, VIP Kim Cương)
 * - 10 Nguyên vật liệu kho thực phẩm (Bò Wagyu, Tôm hùm, Cá hồi, Sườn heo...)
 * - 8 Công thức định lượng BOM liên kết món ăn với nguyên liệu kho
 * - 4 Hồ sơ khách hàng thân thiết tích điểm CRM
 * - 3 Nhà cung cấp thực phẩm uy tín
 * - 2 Phiếu đặt bàn trước tiệc sinh nhật & đối tác VIP
 * - 5 Đơn gọi món mẫu đang phục vụ tại bàn 2 và bàn 4
 * - Bộ đếm Counter khởi tạo giá trị tuần tự cho các bảng
 * @module utils/khoiTaoDuLieuMau
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import bcrypt from 'bcryptjs';
import { ketNoiCSDL } from '../config/coSoDuLieu.js';
import {
  NguoiDung,
  LoaiMon,
  MonAn,
  BanAn,
  DatMon,
  NguyenLieu,
  MonAnNguyenLieu,
  NhaCungCap,
  DatBanTruoc,
  KhachHang,
  BoDem
} from '../models/moHinhDuLieu.js';

/**
 * Hàm kiểm tra và nạp bộ dữ liệu mẫu vào MongoDB nếu CSDL đang trống
 * @async
 * @function napDuLieuMau
 */
export async function napDuLieuMau() {
  console.log('🔄 Đang kiểm tra và khởi tạo dữ liệu CSDL MongoDB...');

  try {
    await ketNoiCSDL();

    const soLuongNguoiDungHienCo = await NguoiDung.countDocuments();
    if (soLuongNguoiDungHienCo === 0) {
      console.log('🌱 CSDL đang trống. Bắt đầu nạp dữ liệu mẫu khởi đầu vào MongoDB...');

      const salt = await bcrypt.genSalt(10);
      const matKhauMacDinh = await bcrypt.hash('123456', salt);

      // 1. Chèn Tài khoản Người dùng (NguoiDung)
      await NguoiDung.insertMany([
        { id: 1, name: 'Nguyễn Ngọc Hà Thảo (Quản Lý)', email: 'admin@nhahang.com', password: matKhauMacDinh, role: 'admin', so_dien_thoai: '0901234567', trang_thai: 'hoat_dong' },
        { id: 2, name: 'Trần Văn Thu Ngân', email: 'thungan@nhahang.com', password: matKhauMacDinh, role: 'nhan_vien', so_dien_thoai: '0902345678', trang_thai: 'hoat_dong' },
        { id: 3, name: 'Lê Bếp Trưởng', email: 'bep@nhahang.com', password: matKhauMacDinh, role: 'bep', so_dien_thoai: '0903456789', trang_thai: 'hoat_dong' },
        { id: 4, name: 'Phạm Phục Vụ', email: 'phucvu@nhahang.com', password: matKhauMacDinh, role: 'nhan_vien', so_dien_thoai: '0904567890', trang_thai: 'hoat_dong' }
      ]);

      // 2. Chèn Danh mục Loại Món (LoaiMon)
      await LoaiMon.insertMany([
        { id: 1, ma_loai: 'KV', ten_loai: 'Món Khai Vị' },
        { id: 2, ma_loai: 'MC', ten_loai: 'Món Chính Đặc Sắc' },
        { id: 3, ma_loai: 'NUONG', ten_loai: 'Món Nướng BBQ' },
        { id: 4, ma_loai: 'HAISAN', ten_loai: 'Hải Sản Tươi Sống' },
        { id: 5, ma_loai: 'TM', ten_loai: 'Tráng Miệng' },
        { id: 6, ma_loai: 'DU', ten_loai: 'Đồ Uống & Rượu Vang' }
      ]);

      // 3. Chèn Thực đơn Món Ăn (MonAn)
      await MonAn.insertMany([
        { id: 1, ten_mon: 'Bò Wagyu A5 Nướng Sốt Tiêu Đen', loai_mon_id: 3, gia: 450000, mo_ta: 'Thịt bò Wagyu vân mỡ tuyệt hảo nướng than hoa kèm sốt tiêu Phú Quốc đặc biệt', hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', trang_thai: 'con_hang' },
        { id: 2, ten_mon: 'Tôm Hùm Alaska Sốt Bơ Tỏi', loai_mon_id: 4, gia: 680000, mo_ta: 'Tôm hùm Alaska tươi nguyên con nướng bơ tỏi thơm lừng kèm bánh mì nướng', hinh_anh: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500', trang_thai: 'con_hang' },
        { id: 3, ten_mon: 'Lẩu Hải Sản Hoàng Gia', loai_mon_id: 4, gia: 520000, mo_ta: 'Nước dùng chua cay đậm đà, tôm sú, mực ống, cua biển và nấm tươi', hinh_anh: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', trang_thai: 'con_hang' },
        { id: 4, ten_mon: 'Salad Cá Hồi Xông Khói Sốt Mè Rang', loai_mon_id: 1, gia: 135000, mo_ta: 'Cá hồi Na Uy xông khói, xà lách Romanie, trứng cá chuồn sốt mè Nhật Bản', hinh_anh: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', trang_thai: 'con_hang' },
        { id: 5, ten_mon: 'Súp Bào Ngư Vi Cá Thượng Hạng', loai_mon_id: 1, gia: 280000, mo_ta: 'Bào ngư tươi hầm nước cốt gà thượng hạng thơm bùi bổ dưỡng', hinh_anh: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', trang_thai: 'con_hang' },
        { id: 6, ten_mon: 'Sườn Heo Nướng Tảng BBQ', loai_mon_id: 3, gia: 320000, mo_ta: 'Sườn heo ướp sốt BBQ đậm vị nướng chậm 4 tiếng mềm tan trong miệng', hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', trang_thai: 'con_hang' },
        { id: 7, ten_mon: 'Gà Ta Hấp Muối Hoa Tiêu', loai_mon_id: 2, gia: 260000, mo_ta: 'Gà đồi hấp muối hột giữ trọn độ ngọt dai tự nhiên kèm muối ớt chanh', hinh_anh: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500', trang_thai: 'con_hang' },
        { id: 8, ten_mon: 'Cơm Chiên Hải Sản Hoàng Bào', loai_mon_id: 2, gia: 160000, mo_ta: 'Cơm chiên hạt ngọc, tôm, mực, cồi sò điệp gói trong lớp trứng mỏng', hinh_anh: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500', trang_thai: 'con_hang' },
        { id: 9, ten_mon: 'Bánh Mousse Chanh Leo Tráng Miệng', loai_mon_id: 5, gia: 65000, mo_ta: 'Bánh mềm xốp chua ngọt thanh mát giải ngấy sau bữa tiệc', hinh_anh: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', trang_thai: 'con_hang' },
        { id: 10, ten_mon: 'Trà Đào Cam Sả Tươi', loai_mon_id: 6, gia: 45000, mo_ta: 'Trà đen Ceylon ủ lạnh kết hợp đào miếng giòn ngọt và cam vàng sả tươi', hinh_anh: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', trang_thai: 'con_hang' },
        { id: 11, ten_mon: 'Rượu Vang Đỏ Cabernet Sauvignon', loai_mon_id: 6, gia: 850000, mo_ta: 'Vang đỏ Chile 2020 hậu vị tannin mượt mà, kết hợp hoàn hảo với bò Wagyu', hinh_anh: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500', trang_thai: 'con_hang' }
      ]);

      // 4. Chèn Sơ đồ Bàn Ăn (BanAn)
      await BanAn.insertMany([
        { id: 1, so_ban: 1, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', so_luong_khach: 0 },
        { id: 2, so_ban: 2, suc_chua: 4, trang_thai: 'co_khach', khu_vuc: 'Tầng 1 - Sảnh Chính', so_luong_khach: 3 },
        { id: 3, so_ban: 3, suc_chua: 2, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', so_luong_khach: 0 },
        { id: 4, so_ban: 4, suc_chua: 6, trang_thai: 'co_khach', khu_vuc: 'Tầng 1 - Sảnh Chính', so_luong_khach: 5 },
        { id: 5, so_ban: 5, suc_chua: 8, trang_thai: 'da_dat', khu_vuc: 'Tầng 1 - Cửa Sổ View', so_luong_khach: 0 },
        { id: 6, so_ban: 6, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Ban Công', so_luong_khach: 0 },
        { id: 7, so_ban: 7, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Ban Công', so_luong_khach: 0 },
        { id: 8, so_ban: 8, suc_chua: 6, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Ban Công', so_luong_khach: 0 },
        { id: 9, so_ban: 9, suc_chua: 10, trang_thai: 'trong', khu_vuc: 'Phòng VIP 1 (Hoàng Gia)', so_luong_khach: 0 },
        { id: 10, so_ban: 10, suc_chua: 12, trang_thai: 'co_khach', khu_vuc: 'Phòng VIP 2 (Kim Cương)', so_luong_khach: 8 },
        { id: 11, so_ban: 11, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', so_luong_khach: 0 },
        { id: 12, so_ban: 12, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Ban Công', so_luong_khach: 0 }
      ]);

      // 5. Chèn Nguyên Liệu Kho (NguyenLieu)
      await NguyenLieu.insertMany([
        { id: 1, ten_nguyen_lieu: 'Thịt Bò Wagyu A5', don_vi_tinh: 'kg', so_luong_ton: 18.5, gia_nhap_trung_binh: 950000, dinh_muc_toi_thieu: 5 },
        { id: 2, ten_nguyen_lieu: 'Tôm Hùm Alaska', don_vi_tinh: 'kg', so_luong_ton: 8.2, gia_nhap_trung_binh: 1200000, dinh_muc_toi_thieu: 3 },
        { id: 3, ten_nguyen_lieu: 'Cá Hồi Na Uy Tươi', don_vi_tinh: 'kg', so_luong_ton: 12.0, gia_nhap_trung_binh: 380000, dinh_muc_toi_thieu: 4 },
        { id: 4, ten_nguyen_lieu: 'Sườn Heo Tươi Cắt Tảng', don_vi_tinh: 'kg', so_luong_ton: 25.0, gia_nhap_trung_binh: 140000, dinh_muc_toi_thieu: 8 },
        { id: 5, ten_nguyen_lieu: 'Gà Ta Thả Vườn', don_vi_tinh: 'con', so_luong_ton: 30.0, gia_nhap_trung_binh: 160000, dinh_muc_toi_thieu: 10 },
        { id: 6, ten_nguyen_lieu: 'Gạo Thơm Lài', don_vi_tinh: 'kg', so_luong_ton: 85.0, gia_nhap_trung_binh: 22000, dinh_muc_toi_thieu: 20 },
        { id: 7, ten_nguyen_lieu: 'Bơ Lạt Anchor', don_vi_tinh: 'kg', so_luong_ton: 4.5, gia_nhap_trung_binh: 180000, dinh_muc_toi_thieu: 5 },
        { id: 8, ten_nguyen_lieu: 'Tiêu Đen Phú Quốc', don_vi_tinh: 'kg', so_luong_ton: 3.0, gia_nhap_trung_binh: 220000, dinh_muc_toi_thieu: 2 },
        { id: 9, ten_nguyen_lieu: 'Rau Xà Lách Romanie', don_vi_tinh: 'kg', so_luong_ton: 14.0, gia_nhap_trung_binh: 45000, dinh_muc_toi_thieu: 5 },
        { id: 10, ten_nguyen_lieu: 'Vang Đỏ Chile Chai', don_vi_tinh: 'chai', so_luong_ton: 24.0, gia_nhap_trung_binh: 450000, dinh_muc_toi_thieu: 6 }
      ]);

      // 6. Chèn Định Lượng BOM (MonAnNguyenLieu)
      await MonAnNguyenLieu.insertMany([
        { id: 1, mon_an_id: 1, nguyen_lieu_id: 1, so_luong_can: 0.25, don_vi_tinh: 'kg' },
        { id: 2, mon_an_id: 1, nguyen_lieu_id: 8, so_luong_can: 0.02, don_vi_tinh: 'kg' },
        { id: 3, mon_an_id: 2, nguyen_lieu_id: 2, so_luong_can: 0.50, don_vi_tinh: 'kg' },
        { id: 4, mon_an_id: 2, nguyen_lieu_id: 7, so_luong_can: 0.05, don_vi_tinh: 'kg' },
        { id: 5, mon_an_id: 4, nguyen_lieu_id: 3, so_luong_can: 0.12, don_vi_tinh: 'kg' },
        { id: 6, mon_an_id: 4, nguyen_lieu_id: 9, so_luong_can: 0.15, don_vi_tinh: 'kg' },
        { id: 7, mon_an_id: 6, nguyen_lieu_id: 4, so_luong_can: 0.40, don_vi_tinh: 'kg' },
        { id: 8, mon_an_id: 7, nguyen_lieu_id: 5, so_luong_can: 1.00, don_vi_tinh: 'con' }
      ]);

      // 7. Chèn Khách Hàng Thân Thiết (KhachHang)
      await KhachHang.insertMany([
        { id: 1, ho_ten: 'Nguyễn Văn An', so_dien_thoai: '0912345678', email: 'an.nguyen@gmail.com', diem_tich_luy: 450, hang_thanh_vien: 'Vang', tong_chi_tieu: 14500000 },
        { id: 2, ho_ten: 'Trần Thị Bích', so_dien_thoai: '0987654321', email: 'bich.tran@gmail.com', diem_tich_luy: 820, hang_thanh_vien: 'KimCuong', tong_chi_tieu: 32000000 },
        { id: 3, ho_ten: 'Lê Hoàng Nam', so_dien_thoai: '0933112233', email: 'nam.le@gmail.com', diem_tich_luy: 120, hang_thanh_vien: 'Dong', tong_chi_tieu: 2800000 },
        { id: 4, ho_ten: 'Vũ Thùy Dương', so_dien_thoai: '0977889900', email: 'duong.vu@gmail.com', diem_tich_luy: 260, hang_thanh_vien: 'Bac', tong_chi_tieu: 6500000 }
      ]);

      // 8. Chèn Đối tác Nhà Cung Cấp (NhaCungCap)
      await NhaCungCap.insertMany([
        { id: 1, ma_ncc: 'NCC_WAGYU', ten_ncc: 'Công Ty Thực Phẩm Sạch Wagyu Japan', so_dien_thoai: '0283899999', email: 'contact@wagyuvn.com', dia_chi: '120 Nguyễn Thị Minh Khai, Q.3, TP.HCM', danh_gia_sao: 4.9 },
        { id: 2, ma_ncc: 'NCC_SEAFOOD', ten_ncc: 'Vựa Hải Sản Biển Đông Cao Cấp', so_dien_thoai: '0908887766', email: 'sales@haisanbiendong.vn', dia_chi: '45 Cảng Cát Lái, TP.Thủ Đức', danh_gia_sao: 4.8 },
        { id: 3, ma_ncc: 'NCC_ORGANIC', ten_ncc: 'Nông Trại Rau Củ Quả Đà Lạt GAP', so_dien_thoai: '0263388888', email: 'dalatfarm@organic.vn', dia_chi: 'Thung Lũng Tình Yêu, TP.Đà Lạt', danh_gia_sao: 4.7 }
      ]);

      // 9. Chèn Phiếu Đặt Bàn Trước (DatBanTruoc)
      await DatBanTruoc.insertMany([
        { id: 1, ma_reservation: 'RES-20260908-01', ten_khach: 'Trần Thị Bích', sdt: '0987654321', ban_id: 5, thoi_gian_hen: new Date(), so_luong_khach: 8, tien_coc: 500000, trang_thai: 'da_xac_nhan', ghi_chu: 'Tiệc sinh nhật, cần chuẩn bị nến và hoa' },
        { id: 2, ma_reservation: 'RES-20260908-02', ten_khach: 'Lê Hoàng Nam', sdt: '0933112233', ban_id: 9, thoi_gian_hen: new Date(), so_luong_khach: 10, tien_coc: 1000000, trang_thai: 'da_xac_nhan', ghi_chu: 'Gặp đối tác quan trọng VIP' }
      ]);

      // 10. Chèn Đơn Gọi Món Mẫu (DatMon)
      await DatMon.insertMany([
        { id: 1, ban_id: 2, mon_an_id: 1, khach_hang_id: 1, so_luong: 2, don_gia: 450000, tong_tien: 900000, options_json: '{"do_chin":"Medium Rare","sot":"Tieu den"}', ghi_chu: 'Nấu ít cay', trang_thai: 'dang_che_bien', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 3 },
        { id: 2, ban_id: 2, mon_an_id: 4, khach_hang_id: 1, so_luong: 1, don_gia: 135000, tong_tien: 135000, options_json: '{}', ghi_chu: 'Sốt để riêng', trang_thai: 'da_phuc_vu', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 2, so_luong_khach: 3 },
        { id: 3, ban_id: 2, mon_an_id: 10, khach_hang_id: 1, so_luong: 3, don_gia: 45000, tong_tien: 135000, options_json: '{"da":"Ít đá","duong":"70%"}', ghi_chu: '', trang_thai: 'da_phuc_vu', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 3 },
        { id: 4, ban_id: 4, mon_an_id: 2, khach_hang_id: 3, so_luong: 1, don_gia: 680000, tong_tien: 680000, options_json: '{"sot":"Bo toi"}', ghi_chu: 'Làm nóng', trang_thai: 'cho_xac_nhan', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 5 },
        { id: 5, ban_id: 4, mon_an_id: 3, khach_hang_id: 3, so_luong: 1, don_gia: 520000, tong_tien: 520000, options_json: '{"cay":"Vừa"}', ghi_chu: '', trang_thai: 'dang_che_bien', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 2, so_luong_khach: 5 }
      ]);

      // 11. Khởi tạo Bảng Đếm Bộ đếm tuần tự (BoDem)
      await BoDem.insertMany([
        { _id: 'user_id', seq: 4 },
        { _id: 'category_id', seq: 6 },
        { _id: 'dish_id', seq: 11 },
        { _id: 'table_id', seq: 12 },
        { _id: 'ingredient_id', seq: 10 },
        { _id: 'dish_ingredient_id', seq: 8 },
        { _id: 'customer_id', seq: 4 },
        { _id: 'supplier_id', seq: 3 },
        { _id: 'reservation_id', seq: 2 },
        { _id: 'order_id', seq: 5 },
        { _id: 'review_id', seq: 0 }
      ]);

      console.log('✅ Đã nạp thành công bộ dữ liệu mẫu vào MongoDB!');
    } else {
      console.log('ℹ️ MongoDB đã có sẵn dữ liệu, bỏ qua bước nạp mẫu.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo CSDL MongoDB:', error);
    throw error;
  }
}

// Bí danh tương thích
export const seedDatabase = napDuLieuMau;

// Hỗ trợ thực thi trực tiếp từ dòng lệnh
if (process.argv[1]?.includes('khoiTaoDuLieuMau.js') || process.argv[1]?.includes('seedDb.js')) {
  napDuLieuMau().then(() => {
    console.log('🎉 Hoàn tất kiểm tra và khởi tạo CSDL MongoDB!');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default napDuLieuMau;
