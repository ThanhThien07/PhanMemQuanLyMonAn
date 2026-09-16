<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DonDatHangNcc extends Model
{
    protected $table = 'don_dat_hang_ncc';

    protected $fillable = [
        'ma_don_po',
        'nha_cung_cap_id',
        'ngay_dat',
        'du_kien_giao',
        'tong_tien',
        'trang_thai',
        'che_do_toi_uu',
        'user_id',
        'ghi_chu',
    ];

    protected $casts = [
        'tong_tien' => 'float',
        'ngay_dat' => 'date',
        'du_kien_giao' => 'date',
    ];

    public function nhaCungCap(): BelongsTo
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function chiTiet(): HasMany
    {
        return $this->hasMany(ChiTietDonDatHangNcc::class, 'don_dat_hang_ncc_id');
    }
}
