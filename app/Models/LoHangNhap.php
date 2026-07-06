<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoHangNhap extends Model
{
    protected $table = 'lo_hang_nhap';

    protected $fillable = [
        'ma_lo',
        'nguyen_lieu_id',
        'don_nhap_hang_id',
        'nha_cung_cap_id',
        'ngay_nhap',
        'ngay_het_han',
        'so_luong_nhap',
        'so_luong_ton',
        'don_gia_nhap',
        'vi_tri_kho',
    ];

    /**
     * Relationship: A batch belongs to an ingredient.
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }

    /**
     * Relationship: A batch belongs to a purchase/import order.
     */
    public function donNhapHang(): BelongsTo
    {
        return $this->belongsTo(DonNhapHang::class, 'don_nhap_hang_id');
    }

    /**
     * Relationship: A batch belongs to a supplier.
     */
    public function nhaCungCap(): BelongsTo
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    /**
     * Relationship: A batch can have many consumption logs.
     */
    public function chiTietTieuHao(): HasMany
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'lo_hang_nhap_id');
    }
}
