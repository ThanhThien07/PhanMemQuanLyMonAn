<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChiTietDonDatHangNcc extends Model
{
    protected $table = 'chi_tiet_don_dat_hang_ncc';

    protected $fillable = [
        'don_dat_hang_ncc_id',
        'nguyen_lieu_id',
        'so_luong_dat',
        'don_gia_dat',
        'thanh_tien',
    ];

    protected $casts = [
        'so_luong_dat' => 'float',
        'don_gia_dat' => 'float',
        'thanh_tien' => 'float',
    ];

    public function donDatHang(): BelongsTo
    {
        return $this->belongsTo(DonDatHangNcc::class, 'don_dat_hang_ncc_id');
    }

    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }
}
