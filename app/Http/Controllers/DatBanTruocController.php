<?php

namespace App\Http\Controllers;

use App\Models\Ban;
use App\Models\DatBanTruoc;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DatBanTruocController extends Controller
{
    /**
     * Màn hình Quản lý Đặt Bàn Trước (Dành cho Thu ngân / Manager)
     */
    public function index()
    {
        $reservations = DatBanTruoc::with('ban')
            ->orderBy('thoi_gian_hen', 'asc')
            ->get();
        $bans = Ban::where('trang_thai', 'trong')->get();

        return view('ban.reservation_index', compact('reservations', 'bans'));
    }

    /**
     * Khách hàng đặt bàn trực tuyến (Cổng công cộng / Admin tạo hộ)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_khach' => 'required|string|max:255',
            'sdt' => 'required|string|max:20',
            'ban_id' => 'nullable|exists:ban,id',
            'thoi_gian_hen' => 'required|date',
            'so_luong_khach' => 'required|integer|min:1',
            'tien_coc' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ]);

        $maRes = 'RES-' . strtoupper(Str::random(5)) . '-' . date('dmY');

        $reservation = DatBanTruoc::create([
            'ma_reservation' => $maRes,
            'ten_khach' => $validated['ten_khach'],
            'sdt' => $validated['sdt'],
            'ban_id' => $validated['ban_id'] ?? null,
            'thoi_gian_hen' => $validated['thoi_gian_hen'],
            'so_luong_khach' => $validated['so_luong_khach'],
            'tien_coc' => $validated['tien_coc'] ?? 0,
            'trang_thai' => 'cho_xac_nhan',
            'ghi_chu' => $validated['ghi_chu'] ?? null,
        ]);

        return redirect()->back()->with('success', "Đã ghi nhận yêu cầu Đặt Bàn Trước thành công! Mã giữ bàn: {$maRes}");
    }

    /**
     * Thay đổi trạng thái Đặt bàn (Xác nhận, Khách đã đến, Hủy)
     */
    public function updateStatus(Request $request, $id)
    {
        $reservation = DatBanTruoc::findOrFail($id);
        $status = $request->input('trang_thai');

        $reservation->update(['trang_thai' => $status]);

        if ($status === 'khach_da_den' && $reservation->ban_id) {
            $ban = Ban::find($reservation->ban_id);
            if ($ban) {
                $ban->update(['trang_thai' => 'co_khach']);
            }
        }

        return redirect()->back()->with('success', "Đã cập nhật trạng thái phiếu đặt bàn #{$reservation->ma_reservation} thành '{$status}'");
    }
}
