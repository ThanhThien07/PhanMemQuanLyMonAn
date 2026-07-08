<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lớp Model ChiTietTieuHaoDatMon - Chi tiết tiêu hao nguyên liệu của từng đĩa gọi món
 * 
 * Lưu trữ vết cụ thể đĩa gọi món này đã tiêu hao bao nhiêu nguyên liệu,
 * lấy ra từ lô hàng nhập nào và giá vốn nhập tương ứng để phục vụ tính ROI/doanh thu thuần.
 */
class ChiTietTieuHaoDatMon extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'chi_tiet_tieu_hao_dat_mon';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'dat_mon_id',         // ID đĩa gọi món tương ứng
        'nguyen_lieu_id',     // ID nguyên liệu bị tiêu thụ
        'lo_hang_nhap_id',    // ID lô hàng nhập cụ thể bị trừ kho
        'so_luong_tieu_hao',  // Lượng nguyên liệu tiêu hao thực tế (kg, g, v.v.)
        'don_gia_von',        // Đơn giá nhập tại thời điểm mua lô hàng này
    ];

    /**
     * Mối quan hệ: Chi tiết tiêu hao thuộc về một đĩa gọi món (DatMon) nhất định.
     * 
     * @return BelongsTo
     */
    public function datMon(): BelongsTo
    {
        return $this->belongsTo(DatMon::class, 'dat_mon_id');
    }

    /**
     * Mối quan hệ: Chi tiết tiêu hao thuộc về một nguyên vật liệu cụ thể.
     * 
     * @return BelongsTo
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }

    /**
     * Mối quan hệ: Chi tiết tiêu hao trích xuất kho từ một lô hàng nhập cụ thể.
     * 
     * @return BelongsTo
     */
    public function loHangNhap(): BelongsTo
    {
        return $this->belongsTo(LoHangNhap::class, 'lo_hang_nhap_id');
    }
}
