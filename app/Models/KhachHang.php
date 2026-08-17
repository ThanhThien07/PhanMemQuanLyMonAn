<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lớp Model KhachHang - Quản lý thông tin Khách hàng thân thiết (CRM)
 *
 * Lưu trữ họ tên, số điện thoại liên lạc của khách và điểm thưởng tích lũy
 * qua các đơn hàng để áp dụng các chính sách chiết khấu, nâng hạng thành viên.
 */
class KhachHang extends Model
{
    // Tên bảng tương ứng trong CSDL
    protected $table = 'khach_hang';

    // Các cột dữ liệu được phép gán giá trị hàng loạt (Mass Assignment)
    protected $fillable = [
        'ten',            // Họ và tên khách hàng
        'sdt',            // Số điện thoại liên lạc duy nhất để tra cứu
        'diem_tich_luy',  // Điểm tích lũy cộng dồn
    ];

    /**
     * Mối quan hệ: Một khách hàng thân thiết có thể có nhiều đĩa đặt món (DatMon) trong lịch sử.
     */
    public function datMons(): HasMany
    {
        return $this->hasMany(DatMon::class, 'khach_hang_id');
    }

    /**
     * Xác định hạng thành viên (Tier) dựa trên điểm tích lũy
     * - Thành Viên / Đồng: 0 - 99 điểm
     * - Hạng Bạc: 100 - 299 điểm
     * - Hạng Vàng: 300 - 499 điểm
     * - Hạng VIP Kim Cương: 500+ điểm
     */
    public function getHangThanhVienAttribute(): string
    {
        $diem = $this->diem_tich_luy ?? 0;
        if ($diem >= 500) {
            return 'VIP Kim Cương';
        } elseif ($diem >= 300) {
            return 'Hạng Vàng';
        } elseif ($diem >= 100) {
            return 'Hạng Bạc';
        }
        return 'Thành Viên Mới';
    }

    /**
     * Lấy class CSS Badge hiển thị cho từng Hạng
     */
    public function getHangBadgeClassAttribute(): string
    {
        return match($this->hang_thanh_vien) {
            'VIP Kim Cương' => 'bg-purple-600 text-white border-purple-300',
            'Hạng Vàng' => 'bg-warning text-dark border-warning-subtle',
            'Hạng Bạc' => 'bg-secondary text-white border-secondary-subtle',
            default => 'bg-dark text-white border-dark-subtle',
        };
    }

    /**
     * Lấy thông tin Voucher ưu đãi độc quyền dành cho khách hàng theo Hạng
     */
    public function getVoucherUuDaiAttribute(): array
    {
        $hang = $this->hang_thanh_vien;
        return match($hang) {
            'VIP Kim Cương' => [
                'code' => 'VIPDIAMOND200K',
                'title' => 'Voucher VIP Kim Cương 200.000đ',
                'discount_val' => 200000,
                'discount_percent' => 15,
                'desc' => 'Đặc quyền VIP Kim Cương: Giảm ngay 15% tối đa 200.000đ cho đơn hàng và tặng 1 phần nước uống miễn phí!',
                'badge' => '💎 VIP Kim Cương'
            ],
            'Hạng Vàng' => [
                'code' => 'GOLD100K',
                'title' => 'Voucher Hạng Vàng 100.000đ',
                'discount_val' => 100000,
                'discount_percent' => 10,
                'desc' => 'Ưu đãi Hạng Vàng: Giảm 10% tối đa 100.000đ trực tiếp vào hóa đơn của bạn.',
                'badge' => '🥇 Hạng Vàng'
            ],
            'Hạng Bạc' => [
                'code' => 'SILVER50K',
                'title' => 'Voucher Hạng Bạc 50.000đ',
                'discount_val' => 50000,
                'discount_percent' => 5,
                'desc' => 'Ưu đãi Hạng Bạc: Giảm 5% cho toàn bộ thực đơn gọi món tại bàn.',
                'badge' => '🥈 Hạng Bạc'
            ],
            default => [
                'code' => 'WELCOME10K',
                'title' => 'Voucher Chào Mừng 10.000đ',
                'discount_val' => 10000,
                'discount_percent' => 3,
                'desc' => 'Ưu đãi thành viên mới: Giảm 3% cho đơn hàng đầu tiên. Đặt thêm món để tích điểm nâng cấp Hạng Bạc!',
                'badge' => '🥉 Thành Viên Mới'
            ],
        };
    }

    /**
     * Lấy thông tin mục tiêu nâng cấp Hạng tiếp theo
     */
    public function getNextTierInfoAttribute(): array
    {
        $diem = $this->diem_tich_luy ?? 0;
        if ($diem >= 500) {
            return [
                'next_tier' => 'Đã đạt Hạng Tối Đa',
                'target_points' => 500,
                'current_points' => $diem,
                'needed_points' => 0,
                'progress_percent' => 100,
            ];
        } elseif ($diem >= 300) {
            $needed = 500 - $diem;
            $percent = round(($diem - 300) / (500 - 300) * 100);
            return [
                'next_tier' => 'VIP Kim Cương (Giảm 15%)',
                'target_points' => 500,
                'current_points' => $diem,
                'needed_points' => $needed,
                'progress_percent' => max(10, min(99, $percent)),
            ];
        } elseif ($diem >= 100) {
            $needed = 300 - $diem;
            $percent = round(($diem - 100) / (300 - 100) * 100);
            return [
                'next_tier' => 'Hạng Vàng (Giảm 10%)',
                'target_points' => 300,
                'current_points' => $diem,
                'needed_points' => $needed,
                'progress_percent' => max(10, min(99, $percent)),
            ];
        } else {
            $needed = 100 - $diem;
            $percent = round(($diem / 100) * 100);
            return [
                'next_tier' => 'Hạng Bạc (Giảm 5%)',
                'target_points' => 100,
                'current_points' => $diem,
                'needed_points' => $needed,
                'progress_percent' => max(10, min(99, $percent)),
            ];
        }
    }
}
