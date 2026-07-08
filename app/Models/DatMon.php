<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * Model DatMon - Đại diện cho một lượt gọi món thực tế tại bàn của khách
 *
 * Khi khách hàng quét mã QR và chọn món, một bản ghi mới được tạo trong bảng 'dat_mon'
 * để theo dõi trạng thái nấu, số lượng đĩa, giá bán tại thời điểm gọi và bàn ăn tương ứng.
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
        'so_luong_khach',      // Số lượng khách (chỉ ghi ở đơn đầu tiên của bàn)
        'thu_tu_uu_tien',      // Mức độ ưu tiên (1 mặc định, số cao hơn nấu trước)
        'don_gia',             // Đơn giá bán tại thời điểm gọi
        'thoi_gian_uoc_tinh',  // Thời gian nấu định mức cho 1 suất (phút)
        'trang_thai',          // Trạng thái: dang_cho, dang_lam, dang_giao, da_giao, da_thanh_toan, huy
        'ban_id',              // Khóa ngoại liên kết bảng 'ban'
        'khach_hang_id',       // Khóa ngoại liên kết 'khach_hang' để tích điểm CRM
    ];

    // Ép kiểu tự động
    protected $casts = [
        'so_luong'           => 'integer',
        'so_luong_khach'     => 'integer',
        'thu_tu_uu_tien'     => 'integer',
        'don_gia'            => 'integer',
        'thoi_gian_uoc_tinh' => 'integer',
    ];

    // =========================================================================
    // RELATIONSHIPS (Quan hệ)
    // =========================================================================

    /**
     * Lượt gọi món này thuộc về bàn ăn nào (Many-to-One).
     */
    public function ban(): BelongsTo
    {
        return $this->belongsTo(Ban::class, 'ban_id');
    }

    /**
     * Khách hàng CRM nào thanh toán (dùng để tích điểm thành viên).
     */
    public function khachHang(): BelongsTo
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    /**
     * Một lượt gọi món khi chế biến tiêu hao nhiều nguyên vật liệu trong kho.
     */
    public function chiTietTieuHao(): HasMany
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'dat_mon_id');
    }

    // =========================================================================
    // QUERY SCOPES (Bộ lọc tái sử dụng)
    // =========================================================================

    /**
     * Scope: Các đơn đã hoàn thành (da_giao hoặc da_thanh_toan).
     * Thay thế pattern whereIn('trang_thai', ['da_giao', 'da_thanh_toan']) lặp ở nhiều nơi.
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereIn('trang_thai', ['da_giao', 'da_thanh_toan']);
    }

    /**
     * Scope: Các đơn đang trong quá trình phục vụ (chưa thanh toán, chưa hủy).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('trang_thai', ['da_thanh_toan', 'huy']);
    }

    /**
     * Scope: Lọc đơn đặt theo ngày cụ thể.
     *
     * @param  Builder  $query
     * @param  string   $date  Ngày dạng 'Y-m-d' (mặc định hôm nay)
     */
    public function scopeForDate(Builder $query, ?string $date = null): Builder
    {
        return $query->whereDate('created_at', $date ?? now()->toDateString());
    }

    /**
     * Scope: Xếp theo mức ưu tiên giảm dần, sau đó theo thời gian tạo tăng dần (FIFO).
     * Dùng cho hàng đợi bếp KDS.
     */
    public function scopeQueueOrder(Builder $query): Builder
    {
        return $query->orderBy('thu_tu_uu_tien', 'desc')
                     ->orderBy('created_at', 'asc');
    }

    /**
     * Scope: Lọc các món đang chờ trong hàng đợi bếp (chờ nấu hoặc đang nấu).
     */
    public function scopeInKitchenQueue(Builder $query): Builder
    {
        return $query->whereIn('trang_thai', ['dang_cho', 'dang_lam']);
    }

    /**
     * Scope: Lọc các món đang hiển thị trên màn hình bếp KDS (chưa giao xong).
     */
    public function scopeKdsVisible(Builder $query): Builder
    {
        return $query->whereIn('trang_thai', ['dang_cho', 'dang_lam', 'dang_giao']);
    }

    // =========================================================================
    // ACCESSORS (Thuộc tính ảo tự động tính toán)
    // =========================================================================

    /**
     * Accessor: Tính thành tiền của dòng đơn hàng này (so_luong * don_gia).
     * Dùng: $datMon->total — thay thế closure tính lặp đi lặp lại ở nhiều chỗ.
     */
    public function getTotalAttribute(): int
    {
        return $this->so_luong * $this->don_gia;
    }

    /**
     * Accessor: Trả về TRUE nếu món ở trạng thái chờ và đã quá 50% định mức nấu.
     * Dùng: $datMon->is_late_warning — hiển thị cảnh báo đỏ trên KDS.
     */
    public function getIsLateWarningAttribute(): bool
    {
        if ($this->trang_thai !== 'dang_cho') {
            return false;
        }

        return $this->minutes_elapsed > ($this->thoi_gian_uoc_tinh / 2);
    }

    /**
     * Accessor: Số phút đã trôi qua kể từ khi khách đặt món.
     * Dùng: $datMon->minutes_elapsed — hiển thị bộ đếm thời gian trên KDS.
     */
    public function getMinutesElapsedAttribute(): int
    {
        return Carbon::parse($this->created_at)->diffInMinutes(Carbon::now());
    }
}
