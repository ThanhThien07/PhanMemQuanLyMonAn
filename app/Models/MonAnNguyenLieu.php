<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lớp Model MonAnNguyenLieu - Thực thể trung gian Định mức công thức (BOM)
 *
 * Lưu trữ định lượng chi tiết cần tiêu hao của từng nguyên vật liệu
 * để chế biến ra một phần ăn tương ứng (ví dụ: món Lẩu Bò cần 0.5kg thịt bò).
 */
class MonAnNguyenLieu extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'mon_an_nguyen_lieu';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'mon_an_id',           // ID món ăn trong thực đơn
        'nguyen_lieu_id',      // ID nguyên vật liệu cần định lượng
        'so_luong_dinh_luong', // Định mức lượng cần dùng (đơn vị: kg, lít, hộp)
    ];

    /**
     * Mối quan hệ: Bản ghi định mức thuộc về một món ăn cụ thể.
     */
    public function monAn(): BelongsTo
    {
        return $this->belongsTo(MonAn::class, 'mon_an_id');
    }

    /**
     * Mối quan hệ: Bản ghi định mức thuộc về một nguyên vật liệu cụ thể.
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }
}
