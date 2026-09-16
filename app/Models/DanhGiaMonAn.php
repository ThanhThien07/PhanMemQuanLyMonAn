<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DanhGiaMonAn extends Model
{
    protected $table = 'danh_gia_mon_an';

    protected $fillable = [
        'dat_mon_id',
        'ban_id',
        'so_sao',
        'noi_dung_danh_gia',
        'canh_bao_do',
        'trang_thai_xu_ly',
    ];

    protected $casts = [
        'so_sao' => 'integer',
        'canh_bao_do' => 'boolean',
    ];

    public function datMon(): BelongsTo
    {
        return $this->belongsTo(DatMon::class, 'dat_mon_id');
    }

    public function ban(): BelongsTo
    {
        return $this->belongsTo(Ban::class, 'ban_id');
    }
}
