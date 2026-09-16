<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonAnModifier extends Model
{
    protected $table = 'mon_an_modifiers';

    protected $fillable = [
        'mon_an_id',
        'ten_modifier',
        'gia_tang_them',
        'nguyen_lieu_id',
        'luong_tieu_hao',
    ];

    protected $casts = [
        'gia_tang_them' => 'float',
        'luong_tieu_hao' => 'float',
    ];

    public function monAn(): BelongsTo
    {
        return $this->belongsTo(MonAn::class, 'mon_an_id');
    }

    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }
}
