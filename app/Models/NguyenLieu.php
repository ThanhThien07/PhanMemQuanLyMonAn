<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NguyenLieu extends Model
{
    protected $table = 'nguyen_lieu';

    protected $fillable = [
        'ten',
        'so_luong_ton',
        'don_vi',
    ];

    /**
     * Relationship: An ingredient has many inventory import batches.
     */
    public function loHangNhap()
    {
        return $this->hasMany(LoHangNhap::class, 'nguyen_lieu_id');
    }

    /**
     * Relationship: An ingredient belongs to many dishes via recipe BOM.
     */
    public function monAn()
    {
        return $this->belongsToMany(MonAn::class, 'mon_an_nguyen_lieu', 'nguyen_lieu_id', 'mon_an_id')
            ->withPivot('so_luong_dinh_luong')
            ->withTimestamps();
    }

    /**
     * Relationship: An ingredient has many order consumption records.
     */
    public function chiTietTieuHao()
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'nguyen_lieu_id');
    }
}
