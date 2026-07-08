<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Lớp Model DonNhapHang - Đơn đặt mua/nhập hàng nguyên liệu từ Nhà cung cấp
 *
 * Quản lý quy trình đặt mua nguyên vật liệu thô từ các đối tác, theo dõi số lượng
 * đặt hàng so với số lượng nhận thực tế khi kiểm kho, cùng với trạng thái đơn hàng.
 */
class DonNhapHang extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'don_nhap_hang';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten_nguyen_lieu', // Tên nguyên liệu cần mua (ví dụ: Thịt bò Wagyu, Nấm Truffle)
        'nha_cung_cap',    // Tên nhà cung cấp được lựa chọn giao dịch
        'don_gia',         // Đơn giá thỏa thuận mua trên 1 đơn vị sản phẩm
        'so_luong_dat',    // Số lượng đặt mua dự kiến (đơn vị: kg, lít, hộp)
        'so_luong_nhan',   // Số lượng nhận thực tế sau khi thủ kho cân đong kiểm duyệt
        'trang_thai',      // Trạng thái đơn hàng: cho_duyet, dang_giao, da_nhan, da_huy
    ];
}
