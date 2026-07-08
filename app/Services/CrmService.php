<?php

namespace App\Services;

use App\Models\KhachHang;

/**
 * CrmService - Service xử lý tích lũy điểm CRM khách hàng thân thiết
 *
 * Trích xuất logic CRM từ BanController thành Service độc lập.
 * Có thể inject vào bất kỳ Controller nào cần xử lý điểm thưởng,
 * tuân thủ nguyên tắc Single Responsibility (SRP) của SOLID.
 */
class CrmService
{
    /**
     * Tạo hoặc tra cứu khách hàng và tích lũy điểm thưởng sau thanh toán.
     *
     * Quy tắc tích điểm: {CRM_POINTS_PER_VND} VND hóa đơn = 1 điểm.
     * Mặc định từ config('restaurant.crm_points_per_vnd') = 10.000 VND/điểm.
     *
     * @param  string|null  $sdt          Số điện thoại khách hàng (nullable — bỏ qua nếu null)
     * @param  string|null  $khachHangTen Tên khách hàng (có thể cập nhật nếu đã có hồ sơ)
     * @param  float|int    $totalBill    Tổng giá trị hóa đơn thanh toán (VND)
     * @return array|null   Trả về ['customer' => KhachHang, 'diem_cong' => int] hoặc null nếu không có SDT
     */
    public function tichDiem(?string $sdt, ?string $khachHangTen, float|int $totalBill): ?array
    {
        // Bỏ qua nếu khách không cung cấp số điện thoại
        if (empty($sdt)) {
            return null;
        }

        // Tra cứu hoặc tạo mới hồ sơ khách hàng theo số điện thoại
        $customer = KhachHang::where('sdt', $sdt)->first();

        if (!$customer) {
            // Khách hàng mới — khởi tạo hồ sơ với điểm ban đầu = 0
            $customer = KhachHang::create([
                'ten'           => $khachHangTen ?: 'Khách hàng vãng lai',
                'sdt'           => $sdt,
                'diem_tich_luy' => 0,
            ]);
        } elseif (!empty($khachHangTen)) {
            // Khách cũ đổi tên — cập nhật tên mới
            $customer->update(['ten' => $khachHangTen]);
        }

        // Tính điểm tích lũy theo giá trị hóa đơn
        $pointsPerVnd = config('restaurant.crm_points_per_vnd', 10000);
        $diemCong = ($totalBill > 0) ? (int) floor($totalBill / $pointsPerVnd) : 0;

        if ($diemCong > 0) {
            $customer->increment('diem_tich_luy', $diemCong);
            $customer->refresh(); // Reload để lấy tổng điểm mới nhất sau increment
        }

        return [
            'customer'  => $customer,
            'diem_cong' => $diemCong,
        ];
    }
}
