<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * Lớp Model NguyenLieu - Quản lý Danh mục Nguyên vật liệu thô trong kho
 *
 * Lưu trữ tên nguyên liệu, số lượng tồn kho tổng lũy kế và đơn vị tính (kg, lít, hộp...)
 * để quản lý kho hàng nhập khẩu và thực hiện trừ kho tự động khi khách gọi món.
 */
class NguyenLieu extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'nguyen_lieu';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',          // Tên nguyên vật liệu (ví dụ: Nấm hương, Thịt gà, Hành tây)
        'so_luong_ton', // Tổng số lượng tồn kho lũy kế
        'don_vi',       // Đơn vị tính (ví dụ: kg, g, ml, lít, quả)
    ];

    // Ép kiểu tự động
    protected $casts = [
        'so_luong_ton' => 'float',
    ];

    // =========================================================================
    // RELATIONSHIPS (Quan hệ)
    // =========================================================================

    /**
     * Một nguyên vật liệu có nhiều lô hàng nhập (LoHangNhap) để quản lý FEFO.
     */
    public function loHangNhap(): HasMany
    {
        return $this->hasMany(LoHangNhap::class, 'nguyen_lieu_id');
    }

    /**
     * Quan hệ Nhiều-Nhiều: Một nguyên liệu tham gia vào BOM của nhiều món ăn.
     */
    public function monAn(): BelongsToMany
    {
        return $this->belongsToMany(MonAn::class, 'mon_an_nguyen_lieu', 'nguyen_lieu_id', 'mon_an_id')
                    ->withPivot('so_luong_dinh_luong')
                    ->withTimestamps();
    }

    /**
     * Một nguyên vật liệu có nhiều chi tiết tiêu hao do các đĩa đặt món gây ra.
     */
    public function chiTietTieuHao(): HasMany
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'nguyen_lieu_id');
    }

    // =========================================================================
    // QUERY SCOPES (Bộ lọc tái sử dụng)
    // =========================================================================

    /**
     * Scope: Lọc các nguyên liệu có tồn kho ở mức thấp cần nhập thêm.
     *
     * @param  Builder  $query
     * @param  float    $threshold  Ngưỡng cảnh báo (mặc định lấy từ config)
     */
    public function scopeLowStock(Builder $query, ?float $threshold = null): Builder
    {
        $threshold = $threshold ?? config('restaurant.low_stock_threshold', 5);
        return $query->where('so_luong_ton', '<', $threshold);
    }

    /**
     * Scope: Lọc các nguyên liệu có tồn kho đủ (không cần nhập).
     */
    public function scopeAdequateStock(Builder $query, ?float $threshold = null): Builder
    {
        $threshold = $threshold ?? config('restaurant.low_stock_threshold', 5);
        return $query->where('so_luong_ton', '>=', $threshold);
    }
}
