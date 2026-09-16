<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DatBanTruoc extends Model
{
    protected $table = 'dat_ban_truoc';

    protected $fillable = [
        'ma_reservation',
        'ten_khach',
        'sdt',
        'ban_id',
        'thoi_gian_hen',
        'so_luong_khach',
        'tien_coc',
        'trang_thai',
        'ghi_chu',
    ];

    protected $casts = [
        'thoi_gian_hen' => 'datetime',
        'tien_coc' => 'float',
        'so_luong_khach' => 'integer',
    ];

    public function ban(): BelongsTo
    {
        return $this->belongsTo(Ban::class, 'ban_id');
    }
}
