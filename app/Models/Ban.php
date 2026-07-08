<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lớp Model Ban - Đại diện cho thực thể Bàn ăn trong Cơ sở dữ liệu
 * 
 * Quản lý thông tin số lượng khách ngồi tại bàn, khu vực phân bổ bàn,
 * trạng thái bàn ăn (trong, co_khach, v.v.) và các yêu cầu thanh toán.
 */
class Ban extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'ban';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',                  // Tên gọi bàn ăn (ví dụ: Bàn 01)
        'trang_thai',           // Trạng thái bàn: trong (trống), co_khach (đang có khách), dat_truoc
        'khu_vuc',              // Khu vực phòng ăn (ví dụ: Tầng 1, Tầng 2, Ngoài trời)
        'yeu_cau_thanh_toan',   // Yêu cầu thanh toán từ khách: null, tien_mat (tiền mặt), qr (chuyển khoản)
        'so_luong_khach',       // Số lượng khách đang ăn tại bàn
    ];

    /**
     * Mối quan hệ: Một bàn ăn có nhiều đĩa gọi món (DatMon) trong lịch sử.
     * 
     * @return HasMany
     */
    public function datMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'ban_id');
    }

    /**
     * Mối quan hệ: Lọc danh sách các đĩa gọi món ĐANG HOẠT ĐỘNG (chưa thanh toán).
     * 
     * Dùng để tính toán hóa đơn tạm tính và theo dõi tiến trình nấu ăn tại bàn hiện tại.
     * 
     * @return HasMany
     */
    public function activeDatMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'ban_id')->where('trang_thai', '!=', 'da_thanh_toan');
    }
}
