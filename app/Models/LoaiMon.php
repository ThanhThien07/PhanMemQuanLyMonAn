<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoaiMon extends Model
{
    protected $table = 'loai_mon';

    protected $fillable = [
        'ma_loai',
        'ten_loai',
    ];

    /**
     * Relationship: A category contains many dishes.
     */
    public function monAns(): HasMany
    {
        return $this->hasMany(MonAn::class, 'loai_mon_id');
    }
}
