<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Lớp Model NguyenLieu - Quản lý Danh mục Nguyên vật liệu thô trong kho
 * 
 * Lưu trữ tên nguyên liệu, số lượng tồn kho tổng lũy kế, và đơn vị tính (kg, lít, hộp...)
 * để quản lý kho hàng nhập khẩu và thực hiện quy trình trừ kho tự động khi khách gọi món.
 */
class NguyenLieu extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'nguyen_lieu';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',          // Tên nguyên vật liệu (ví dụ: Nấm hương, Thịt gà, Hành tây)
        'so_luong_ton', // Tổng số lượng tồn kho lũy kế (lấy tổng từ các lô hàng lo_hang_nhap)
        'don_vi',       // Đơn vị tính (ví dụ: kg, g, ml, lít, quả)
    ];

    /**
     * Mối quan hệ: Một nguyên vật liệu có nhiều lô hàng nhập (LoHangNhap) để quản lý FIFO.
     * 
     * @return HasMany
     */
    public function loHangNhap(): HasMany
    {
        return $this->hasMany(LoHangNhap::class, 'nguyen_lieu_id');
    }

    /**
     * Mối quan hệ Nhiều-Nhiều: Một nguyên liệu có thể tham gia vào công thức định mức (BOM) của nhiều món ăn.
     * 
     * @return BelongsToMany
     */
    public function monAn(): BelongsToMany
    {
        return $this->belongsToMany(MonAn::class, 'mon_an_nguyen_lieu', 'nguyen_lieu_id', 'mon_an_id')
            ->withPivot('so_luong_dinh_luong')
            ->withTimestamps();
    }

    /**
     * Mối quan hệ: Một nguyên vật liệu có nhiều chi tiết tiêu hao (ChiTietTieuHaoDatMon) do các đĩa đặt món gây ra.
     * 
     * @return HasMany
     */
    public function chiTietTieuHao(): HasMany
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'nguyen_lieu_id');
    }
}
