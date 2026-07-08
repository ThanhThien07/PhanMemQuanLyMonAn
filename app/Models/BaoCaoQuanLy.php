<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Lớp Model BaoCaoQuanLy - Đại diện cho thực thể Báo cáo Ca & Quản lý
 * 
 * Lưu trữ chi tiết toàn bộ báo cáo doanh số, số lượng đơn hàng, lượng khách,
 * tình hình nguyên vật liệu tiêu thụ và nhân sự sau mỗi ca trực hoặc ngày làm việc.
 */
class BaoCaoQuanLy extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'bao_cao_quan_ly';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ma_bao_cao',             // Mã định danh báo cáo duy nhất (ví dụ: BC-08072026-CA1)
        'ngay_lap',               // Ngày lập báo cáo
        'nguoi_lap',              // Tên quản lý hoặc trưởng ca lập báo cáo
        'ca_lam_viec',            // Ca trực: Ca 1, Ca 2, Ca 3 hoặc Cả ngày
        'tong_so_hoa_don',        // Tổng số hóa đơn đã phát sinh
        'tong_luong_khach',       // Tổng lượt khách hàng đã phục vụ
        'tong_doanh_thu',         // Tổng tiền doanh thu gộp
        'doanh_thu_tien_mat',     // Doanh thu nhận bằng tiền mặt
        'doanh_thu_chuyen_khoan', // Doanh thu nhận qua VietQR
        'doanh_thu_theo_mon',     // Mảng phân bổ doanh số của từng món ăn
        'doanh_thu_theo_khu_vuc', // Mảng phân bổ doanh số theo khu vực tầng/bàn
        'tong_don_hang',          // Tổng số đơn đã đặt xuống bếp
        'don_hoan_thanh',         // Số đơn hoàn thành (đã giao khách)
        'don_huy',                // Số đơn bị hủy bỏ
        'don_dang_xu_ly',         // Số đơn còn đang chế biến dở dang
        'mon_ban_chay',           // Tên món ăn bán chạy nhất trong kỳ lọc
        'mon_ban_it',             // Tên món ăn ít được khách gọi nhất
        'so_luong_mon_da_ban',    // Mảng lưu chi tiết số lượng đĩa bán ra của từng món
        'nguyen_lieu_nhap',       // Mảng thống kê nguyên liệu nhập kho trong ca
        'nguyen_lieu_dung',       // Mảng thống kê nguyên liệu tiêu hao ước tính cho recipe
        'nguyen_lieu_ton_cuoi',   // Mảng thống kê số lượng tồn kho nguyên liệu cuối ca
        'nguyen_lieu_sap_het',    // Mảng lưu danh sách nguyên liệu có nguy cơ cạn kho (<5kg)
        'so_nhan_vien',           // Số lượng nhân viên tham gia ca trực
        'so_gio_lam',             // Tổng số giờ công tích lũy của toàn nhân sự trong ca
        'hieu_suat',              // Đánh giá hiệu suất ca trực (ví dụ: Tốt, Trung bình, Quá tải)
        'phan_hoi_khach',         // Tổng hợp các ý kiến phản hồi tiêu biểu của khách hàng
        'su_co',                  // Ghi nhận sự cố xảy ra (ví dụ: mất điện, hỏng thiết bị, trễ món)
        'de_xuat',                // Đề xuất hướng cải tiến của Quản lý ca
    ];

    // Ép kiểu các thuộc tính JSON tự động sang dạng Array trong PHP khi truy vấn
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
