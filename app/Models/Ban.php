<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * Lớp Model Ban - Đại diện cho thực thể Bàn ăn trong Cơ sở dữ liệu
 *
 * Quản lý thông tin số lượng khách ngồi tại bàn, khu vực phân bổ bàn,
 * trạng thái bàn ăn (Trong, Co_khach, Da_goi) và các yêu cầu thanh toán.
 */
class Ban extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'ban';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',                  // Tên gọi bàn ăn (ví dụ: Bàn 01)
        'trang_thai',           // Trạng thái bàn: Trong, Co_khach, Da_goi
        'khu_vuc',              // Khu vực phòng ăn (ví dụ: Tầng 1, Ngoài trời)
        'yeu_cau_thanh_toan',   // Yêu cầu thanh toán: null, tien_mat, qr, qr_paid
        'so_luong_khach',       // Số lượng khách đang ăn tại bàn
    ];

    // Ép kiểu tự động cho các cột dữ liệu
    protected $casts = [
        'so_luong_khach' => 'integer',
    ];

    // =========================================================================
    // RELATIONSHIPS (Quan hệ)
    // =========================================================================

    /**
     * Mối quan hệ: Một bàn ăn có nhiều lượt gọi món (DatMon) trong lịch sử.
     */
    public function datMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'ban_id');
    }

    /**
     * Mối quan hệ: Lọc các đĩa gọi món ĐANG HOẠT ĐỘNG (chưa thanh toán, chưa hủy).
     *
     * Dùng để tính hóa đơn tạm tính và theo dõi tiến trình nấu ăn tại bàn.
     */
    public function activeDatMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'ban_id')
                    ->whereNotIn('trang_thai', ['da_thanh_toan', 'huy']);
    }

    // =========================================================================
    // QUERY SCOPES (Bộ lọc tái sử dụng)
    // =========================================================================

    /**
     * Scope: Lấy danh sách bàn kèm eager load activeDatMons trong 1 query.
     * Thay thế pattern Ban::with('activeDatMons')->get() lặp lại ở nhiều nơi.
     */
    public function scopeWithActiveOrders(Builder $query): Builder
    {
        return $query->with('activeDatMons');
    }

    /**
     * Scope: Lọc bàn theo trạng thái cụ thể.
     *
     * @param  Builder  $query
     * @param  string   $status  Trạng thái: 'Trong', 'Co_khach', 'Da_goi'
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('trang_thai', $status);
    }

    /**
     * Scope: Lấy các bàn đang có yêu cầu thanh toán chưa được xử lý.
     */
    public function scopePendingCheckout(Builder $query): Builder
    {
        return $query->whereNotNull('yeu_cau_thanh_toan');
    }

    // =========================================================================
    // HELPERS (Tiện ích)
    // =========================================================================

    /**
     * Tính tổng hóa đơn tạm tính của bàn dựa trên các món đang active.
     * Có thể gọi sau khi đã load activeDatMons để tránh query thêm.
     */
    public function getTongHoaDonAttribute(): int
    {
        return (int) $this->activeDatMons->sum(fn($item) => $item->so_luong * $item->don_gia);
    }
}
