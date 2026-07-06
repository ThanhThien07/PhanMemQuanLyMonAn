<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KhachHang extends Model
{
    protected $table = 'khach_hang';

    protected $fillable = [
        'ten',
        'sdt',
        'diem_tich_luy',
    ];

    /**
     * Relationship: A customer can have many ordered items (history).
     */
    public function datMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'khach_hang_id');
    }
}
