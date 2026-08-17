<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NhaCungCapNguyenLieu extends Model
{
    protected $table = 'nha_cung_cap_nguyen_lieu';

    protected $fillable = [
        'nha_cung_cap_id',
        'nguyen_lieu_id',
        'don_gia_chao',
        'don_vi_tinh',
        'moq',
        'lead_time_days',
        'danh_gia_star',
        'ghi_chu',
    ];

    protected $casts = [
        'don_gia_chao' => 'float',
        'moq' => 'float',
        'lead_time_days' => 'integer',
        'danh_gia_star' => 'float',
    ];

    public function nhaCungCap(): BelongsTo
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }
}
