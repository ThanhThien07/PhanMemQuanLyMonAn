<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lớp Model KhachHang - Quản lý thông tin Khách hàng thân thiết (CRM)
 * 
 * Lưu trữ họ tên, số điện thoại liên lạc của khách và điểm thưởng tích lũy tích lũy
 * qua các đơn hàng để áp dụng các chính sách chiết khấu, khuyến mãi.
 */
class KhachHang extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'khach_hang';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',            // Họ và tên khách hàng
        'sdt',            // Số điện thoại liên lạc duy nhất để tra cứu
        'diem_tich_luy',  // Điểm tích lũy cộng dồn (100k doanh thu = 1 điểm thưởng)
    ];

    /**
     * Mối quan hệ: Một khách hàng thân thiết có thể có nhiều đĩa đặt món (DatMon) trong lịch sử.
     * 
     * @return HasMany
     */
    public function datMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'khach_hang_id');
    }
}
