<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model MonAn - Đại diện cho thực đơn món ăn cố định của nhà hàng
 *
 * Mỗi món ăn được định nghĩa trong menu sẽ tương ứng với một dòng trong bảng 'mon_an'.
 * Chú ý: Đây là thực đơn gốc (menu định nghĩa), khác với 'DatMon' (các lượt gọi món cụ thể).
 */
class MonAn extends Model
{
    // Chỉ định tên bảng trong cơ sở dữ liệu (mặc định Laravel sẽ tự suy luận dạng số nhiều)
    protected $table = 'mon_an';

    // Khai báo các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    // Khi dùng MonAn::create([...]) hoặc $monAn->update([...])
    protected $fillable = [
        'ten',            // Tên món ăn
        'gia',            // Đơn giá bán lẻ
        'time',           // Thời gian chế biến tiêu chuẩn (phút)
        'loai',           // Loại món (Chuỗi)
        'loai_mon_id',    // Khóa ngoại liên kết bảng loại món ăn
        'mota',           // Mô tả chi tiết món ăn
    ];

    /**
     * Mối quan hệ Nhiều-Một (Many-to-One / belongsTo)
     *
     * Nhiều món ăn sẽ cùng thuộc về một Danh mục loại món (ví dụ: các món lẩu cùng thuộc nhóm 'Lẩu').
     * Khóa ngoại lưu trữ ở bảng 'mon_an' là cột 'loai_mon_id'.
     */
    public function loaiMon()
    {
        return $this->belongsTo(LoaiMon::class, 'loai_mon_id');
    }

    /**
     * Mối quan hệ Nhiều-Nhiều (Many-to-Many / belongsToMany)
     *
     * Định nghĩa công thức định lượng (BOM - Bill of Materials) của món ăn:
     * - Một món ăn có thể được chế biến từ nhiều nguyên liệu khác nhau.
     * - Ngược lại, một nguyên liệu (ví dụ: muối, dầu ăn, bò) có thể dùng cho nhiều món ăn khác nhau.
     *
     * Laravel hỗ trợ giải quyết mối quan hệ này qua bảng trung gian 'mon_an_nguyen_lieu'.
     * Hàm withPivot() khai báo cột phụ 'so_luong_dinh_luong' nằm trên bảng trung gian này để lưu định lượng.
     */
    public function nguyenLieu()
    {
        return $this->belongsToMany(NguyenLieu::class, 'mon_an_nguyen_lieu', 'mon_an_id', 'nguyen_lieu_id')
            ->withPivot('so_luong_dinh_luong') // Lấy kèm định lượng nguyên liệu cho món này
            ->withTimestamps(); // Tự động điền ngày tạo / cập nhật cho bản ghi trung gian
    }
}
