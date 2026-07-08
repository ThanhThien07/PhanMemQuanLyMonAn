<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lớp Model BienBanHaoHut - Đại diện cho Biên bản hao hụt nguyên vật liệu
 * 
 * Lưu trữ thông tin thất thoát nguyên vật liệu trong quá trình lưu kho hoặc chế biến dở dang,
 * liên kết với nguyên liệu bị hụt, lô hàng nhập và nhân sự lập biên bản.
 */
class BienBanHaoHut extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'bien_ban_hao_hut';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'nguyen_lieu_id',    // ID nguyên liệu bị hao hụt
        'lo_hang_nhap_id',   // ID lô hàng nhập tương ứng phát hiện hao hụt (nếu có)
        'so_luong_hao_hut',  // Số lượng hao hụt thực tế (đơn vị: kg, lít, v.v.)
        'ly_do',             // Lý do hao hụt (ví dụ: hết hạn sử dụng, hỏng hóc, rơi vỡ)
        'user_id',           // ID người dùng (nhân sự/đầu bếp) lập biên bản
        'thoi_gian',         // Thời điểm lập biên bản ghi nhận
    ];

    /**
     * Mối quan hệ: Biên bản hao hụt thuộc về một nguyên vật liệu cụ thể.
     * 
     * @return BelongsTo
     */
    public function nguyenLieu(): BelongsTo
    {
        return $this->belongsTo(NguyenLieu::class, 'nguyen_lieu_id');
    }

    /**
     * Mối quan hệ: Biên bản hao hụt thuộc về một lô hàng nhập cụ thể.
     * 
     * @return BelongsTo
     */
    public function loHangNhap(): BelongsTo
    {
        return $this->belongsTo(LoHangNhap::class, 'lo_hang_nhap_id');
    }

    /**
     * Mối quan hệ: Biên bản hao hụt được tạo bởi một nhân viên cụ thể.
     * 
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
