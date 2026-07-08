<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Lớp Model NhaCungCap - Quản lý Danh sách đối tác Nhà cung cấp nguyên liệu
 *
 * Lưu trữ tên đơn vị nhà cung cấp, số điện thoại hotline, địa chỉ kho/văn phòng
 * để liên hệ đặt mua hàng hóa nguyên liệu thô phục vụ chế biến của nhà hàng.
 */
class NhaCungCap extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'nha_cung_cap';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',     // Tên nhà cung cấp (ví dụ: Công ty Thực phẩm sạch M&S)
        'sdt',     // Số điện thoại liên lạc/đại diện kinh doanh
        'dia_chi', // Địa chỉ giao dịch/trụ sở nhà cung ứng
    ];
}
