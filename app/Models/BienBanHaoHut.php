<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BienBanHaoHut extends Model
{
    protected $table = 'bien_ban_hao_hut';

    protected $fillable = [
        'nguyen_lieu_id',
        'lo_hang_nhap_id',
        'so_luong_hao_hut',
        'ly_do',
        'user_id',
        'thoi_gian',
    ];

    /**
     * Relationship: Belongs to an ingredient.
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }

    /**
     * Relationship: Belongs to a batch.
     */
    public function loHangNhap(): BelongsTo
    {
        return $this->belongsTo(LoHangNhap::class, 'lo_hang_nhap_id');
    }

    /**
     * Relationship: Belongs to a user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
