<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ban extends Model
{
    protected $table = 'ban';

    protected $fillable = [
        'ten',
        'trang_thai',
        'khu_vuc',
        'yeu_cau_thanh_toan',
        'so_luong_khach',
    ];

    /**
     * Relationship: A table can have many ordered items.
     */
    public function datMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'ban_id');
    }

    /**
     * Relationship: Filter active ordered items that are not yet paid.
     */
    public function activeDatMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'ban_id')->where('trang_thai', '!=', 'da_thanh_toan');
    }

}
