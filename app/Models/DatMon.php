<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * Model DatMon - Đại diện cho một lượt gọi món thực tế tại bàn của khách
 * 
 * Khác với MonAn (thực đơn cố định), DatMon là một lượt gọi món động.
 * Khi khách hàng quét mã QR và chọn món, một bản ghi mới sẽ được tạo trong bảng 'dat_mon'
 * để theo dõi trạng thái nấu, số lượng đĩa đặt, giá bán tại thời điểm gọi và bàn ăn tương ứng.
 */
class DatMon extends Model
{
    // Tên bảng cơ sở dữ liệu
    protected $table = 'dat_mon';

    // Các cột dữ liệu cho phép điền giá trị hàng loạt
    protected $fillable = [
        'ten_mon',             // Tên món ăn được gọi
        'ghi_chu',             // Ghi chú của khách (ví dụ: không cay, ít hành)
        'so_luong',            // Số lượng suất ăn đặt mua
        'so_luong_khach',      // Ghi nhận số lượng khách ngồi bàn (chỉ điền ở đơn đầu tiên)
        'thu_tu_uu_tien',      // Mức độ ưu tiên chế biến (mặc định là 1, số lớn hơn nấu trước)
        'don_gia',             // Đơn giá bán tại thời điểm khách gọi món
        'thoi_gian_uoc_tinh',  // Thời gian nấu định mức cho 1 suất ăn (phút)
        'trang_thai',          // Trạng thái chế biến: dang_cho, dang_lam, dang_giao, da_giao, da_thanh_toan, huy
        'ban_id',              // Khóa ngoại liên kết bảng 'ban'
        'khach_hang_id',       // Khóa ngoại liên kết bảng 'khach_hang' để tích điểm CRM
    ];

    /**
     * Mối quan hệ Nhiều-Một (Many-to-One / belongsTo)
     * 
     * Lượt gọi món này thuộc về bàn ăn nào.
     */
    public function ban(): BelongsTo
    {
        return $this->belongsTo(Ban::class, 'ban_id');
    }

    /**
     * Mối quan hệ Nhiều-Một (Many-to-One / belongsTo)
     * 
     * Khách hàng CRM nào thanh toán cho lượt gọi món này (dùng để tích điểm thành viên).
     */
    public function khachHang(): BelongsTo
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    /**
     * Mối quan hệ Một-Nhiều (One-to-Many / hasMany)
     * 
     * Một lượt gọi món ăn khi chế biến có thể tiêu hao nhiều nguyên vật liệu trong kho.
     * Liên kết tới bảng chi tiết tiêu hao 'chi_tiet_tieu_hao_dat_mon'.
     */
    public function chiTietTieuHao()
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'dat_mon_id');
    }

    /**
     * Accessor (Cột thuộc tính ảo tự động tính toán) - is_late_warning
     * 
     * Trả về TRUE nếu món ăn ở trạng thái chờ chế biến (dang_cho) bị quá giờ định mức.
     * Luật: Nếu số phút trôi qua kể từ khi khách đặt hàng lớn hơn một nửa thời gian chế biến định mức
     * thì coi như bị chậm trễ và hiển thị cảnh báo đỏ trên KDS.
     * 
     * Cách dùng trong Code/View: $datMon->is_late_warning
     */
    public function getIsLateWarningAttribute(): bool
    {
        if ($this->trang_thai !== 'dang_cho') {
            return false;
        }

        // Carbon dùng để xử lý ngày giờ
        $createdAt = Carbon::parse($this->created_at);
        $minutesElapsed = $createdAt->diffInMinutes(Carbon::now());
        
        // Quá 50% thời gian ước tính -> Cảnh báo trễ
        return $minutesElapsed > ($this->thoi_gian_uoc_tinh / 2);
    }

    /**
     * Accessor (Cột thuộc tính ảo tự động tính toán) - minutes_elapsed
     * 
     * Trả về số phút đã trôi qua kể từ thời điểm khách đặt món cho tới hiện tại.
     * 
     * Cách dùng trong Code/View: $datMon->minutes_elapsed
     */
    public function getMinutesElapsedAttribute(): int
    {
        $createdAt = Carbon::parse($this->created_at);
        return $createdAt->diffInMinutes(Carbon::now());
    }
}
