<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lớp Model LoHangNhap - Lô hàng nguyên vật liệu nhập kho thực tế
 *
 * Lưu trữ thông tin chi tiết các đợt nhập kho của từng nguyên vật liệu, quản lý
 * hạn sử dụng (FIFO), số lượng tồn thực tế của lô, giá mua và vị trí xếp trong kho.
 */
class LoHangNhap extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'lo_hang_nhap';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ma_lo',            // Mã định danh lô hàng (ví dụ: LH-BEEF-20260708)
        'nguyen_lieu_id',   // ID nguyên liệu tương ứng
        'don_nhap_hang_id', // ID đơn đặt hàng nguyên liệu gốc
        'nha_cung_cap_id',  // ID nhà cung cấp giao lô hàng này
        'ngay_nhap',        // Ngày nhập kho thực tế
        'ngay_het_han',     // Hạn sử dụng của nguyên vật liệu trong lô
        'so_luong_nhap',    // Số lượng nhập kho ban đầu
        'so_luong_ton',     // Số lượng tồn thực tế còn lại trong kho của lô hàng này
        'don_gia_nhap',     // Đơn giá nhập thực tế
        'vi_tri_kho',       // Vị trí lưu kho (ví dụ: Tủ đông A, Kệ B1)
    ];

    /**
     * Mối quan hệ: Lô hàng nhập thuộc về một nguyên vật liệu cụ thể.
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }

    /**
     * Mối quan hệ: Lô hàng nhập thuộc về một đơn đặt nhập hàng cụ thể.
     */
    public function donNhapHang(): BelongsTo
    {
        return $this->belongsTo(DonNhapHang::class, 'don_nhap_hang_id');
    }

    /**
     * Mối quan hệ: Lô hàng nhập được cung cấp bởi một nhà cung cấp cụ thể.
     */
    public function nhaCungCap(): BelongsTo
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    /**
     * Mối quan hệ: Lô hàng nhập có thể bị tiêu hao bởi nhiều đĩa gọi món (DatMon).
     */
    public function chiTietTieuHao(): HasMany
    {
        return $this->hasMany(ChiTietTieuHaoDatMon::class, 'lo_hang_nhap_id');
    }
}
