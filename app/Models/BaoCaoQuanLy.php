<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaoCaoQuanLy extends Model
{
    protected $table = 'bao_cao_quan_ly';

    protected $fillable = [
        'ma_bao_cao',
        'ngay_lap',
        'nguoi_lap',
        'ca_lam_viec',
        'tong_so_hoa_don',
        'tong_luong_khach',
        'tong_doanh_thu',
        'doanh_thu_tien_mat',
        'doanh_thu_chuyen_khoan',
        'doanh_thu_theo_mon',
        'doanh_thu_theo_khu_vuc',
        'tong_don_hang',
        'don_hoan_thanh',
        'don_huy',
        'don_dang_xu_ly',
        'mon_ban_chay',
        'mon_ban_it',
        'so_luong_mon_da_ban',
        'nguyen_lieu_nhap',
        'nguyen_lieu_dung',
        'nguyen_lieu_ton_cuoi',
        'nguyen_lieu_sap_het',
        'so_nhan_vien',
        'so_gio_lam',
        'hieu_suat',
        'phan_hoi_khach',
        'su_co',
        'de_xuat',
    ];

    protected $casts = [
        'ngay_lap' => 'date',
        'doanh_thu_theo_mon' => 'array',
        'doanh_thu_theo_khu_vuc' => 'array',
        'so_luong_mon_da_ban' => 'array',
        'nguyen_lieu_nhap' => 'array',
        'nguyen_lieu_dung' => 'array',
        'nguyen_lieu_ton_cuoi' => 'array',
        'nguyen_lieu_sap_het' => 'array',
    ];
}
