<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonAnNguyenLieu extends Model
{
    protected $table = 'mon_an_nguyen_lieu';

    protected $fillable = [
        'mon_an_id',
        'nguyen_lieu_id',
        'so_luong_dinh_luong',
    ];

    /**
     * Relationship: Belongs to a dish.
     */
    public function monAn(): BelongsTo
    {
        return $this->belongsTo(MonAn::class, 'mon_an_id');
    }

    /**
     * Relationship: Belongs to an ingredient.
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }
}
