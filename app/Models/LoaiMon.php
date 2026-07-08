<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lớp Model LoaiMon - Danh mục phân loại các món ăn trong thực đơn
 * 
 * Lưu trữ mã danh mục và tên phân loại (ví dụ: Khai vị, Món chính, Tráng miệng, Đồ uống)
 * để nhóm thực đơn và hỗ trợ khách hàng tìm kiếm dễ dàng trên Menu QR.
 */
class LoaiMon extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'loai_mon';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ma_loai',   // Mã danh mục (ví dụ: LOAI-01)
        'ten_loai',  // Tên loại danh mục (ví dụ: Món khai vị)
    ];

    /**
     * Mối quan hệ: Một loại danh mục chứa nhiều món ăn (MonAn) cụ thể.
     * 
     * @return HasMany
     */
    public function monAns(): HasMany
    {
        return $this->hasMany(MonAn::class, 'loai_mon_id');
    }
}
