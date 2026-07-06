<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonNhapHang extends Model
{
    protected $table = 'don_nhap_hang';

    protected $fillable = [
        'ten_nguyen_lieu',
        'nha_cung_cap',
        'don_gia',
        'so_luong_dat',
        'so_luong_nhan',
        'trang_thai',
    ];
}
