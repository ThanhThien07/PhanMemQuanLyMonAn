<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChiTietTieuHaoDatMon extends Model
{
    protected $table = 'chi_tiet_tieu_hao_dat_mon';

    protected $fillable = [
        'dat_mon_id',
        'nguyen_lieu_id',
        'lo_hang_nhap_id',
        'so_luong_tieu_hao',
        'don_gia_von',
    ];

    /**
     * Relationship: Belongs to an ordered item (DatMon).
     */
    public function datMon(): BelongsTo
    {
        return $this->belongsTo(DatMon::class, 'dat_mon_id');
    }

    /**
     * Relationship: Belongs to an ingredient.
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }

    /**
     * Relationship: Belongs to a specific batch.
     */
    public function loHangNhap(): BelongsTo
    {
        return $this->belongsTo(LoHangNhap::class, 'lo_hang_nhap_id');
    }
}
