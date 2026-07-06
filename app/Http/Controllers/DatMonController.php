<?php

namespace App\Http\Controllers;

use App\Models\Ban;
use App\Models\DatMon;
use App\Models\MonAn;
use App\Models\NguyenLieu;
use App\Models\LoHangNhap;
use App\Models\ChiTietTieuHaoDatMon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * DatMonController - Bộ điều khiển xử lý Đơn gọi món và Điều phối bếp KDS
 * 
 * Bộ điều khiển này quản lý luồng đặt món của khách hàng qua QR tại bàn, điều phối bếp
 * KDS (Kitchen Display System), thay đổi trạng thái món ăn, hủy đơn hoàn tồn kho, và
 * đặc biệt là thuật toán tự động trừ kho theo FEFO và ước tính thời gian chờ đợi.
 */
class DatMonController extends Controller
{
    /**
     * 1. Danh sách tất cả đơn đặt món (Trang lịch sử đơn hàng của Quản trị viên)
     * 
     * GET /dat-mon
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        
        // Khởi tạo truy vấn liên kết với bảng bàn ăn (ban)
        $query = DatMon::with('ban');
        
        // Nếu có bộ lọc trạng thái (ví dụ: đang chờ, đã phục vụ, đã thanh toán)
        if ($status) {
            $query->where('trang_thai', $status);
        }

        // Thực thi lấy dữ liệu sắp xếp theo ngày đặt mới nhất lên trước
        $orders = $query->orderBy('created_at', 'desc')->get();
        
        return view('dat_mon.index', compact('orders', 'status'));
    }

    /**
     * 2. Màn hình điều phối chế biến Bếp nấu ăn KDS (Kitchen Display System)
     * 
     * GET /dat-mon/bep
     */
    public function bep()
    {
        // Lấy tất cả các món ăn chưa hoàn thành (chờ nấu, đang nấu, đang giao)
        // Sắp xếp theo thời gian đặt cũ nhất lên trước (FIFO - First In First Out) để phục vụ công bằng
        $orders = DatMon::with('ban')
            ->whereIn('trang_thai', ['dang_cho', 'dang_lam', 'dang_giao'])
            ->orderBy('created_at', 'asc')
            ->get();

        return view('dat_mon.bep', compact('orders'));
    }

    /**
     * 3. Khách hàng quét mã QR tại bàn để xem thực đơn & gọi món ăn trực tuyến
     * 
     * GET /qr-order/{ban_id}
     */
    public function qrOrder($ban_id)
    {
        // Tra cứu bàn ăn kèm theo danh sách các món ăn bàn này đã đặt chưa thanh toán
        $ban = Ban::with('activeDatMons')->findOrFail($ban_id);
        
        // CƠ CHẾ DỄ HIỂU: Nếu bàn đang ở trạng thái trống (Trong), 
        // tự động chuyển sang trạng thái "Có khách" khi họ vừa quét mã truy cập menu.
        if ($ban->trang_thai === 'Trong') {
            $ban->update(['trang_thai' => 'Co_khach']);
        }

        // Lấy danh sách thực đơn món ăn từ database để hiển thị cho khách chọn
        $menuItems = MonAn::with('loaiMon')->orderBy('ten')->get();
        $categories = \App\Models\LoaiMon::orderBy('ma_loai')->get();

        // Tính tổng số tiền các món ăn đã được gọi và chấp nhận tại bàn này để khách theo dõi bill
        $totalBill = $ban->activeDatMons->sum(function($item) {
            return $item->so_luong * $item->don_gia;
        });

        return view('ban.qr_order', compact('ban', 'menuItems', 'categories', 'totalBill'));
    }

    /**
     * 4. API nhận yêu cầu gọi món trực tuyến của khách qua QR bàn
     * 
     * POST /qr-order/{ban_id}/order
     */
    public function placeOrder(Request $request, $ban_id): JsonResponse
    {
        $ban = Ban::findOrFail($ban_id);
        
        // Xác thực thông tin món ăn gửi lên từ client
        $request->validate([
            'ten_mon' => 'required|string',
            'don_gia' => 'required|numeric',
            'thoi_gian_uoc_tinh' => 'required|integer',
            'so_luong' => 'required|integer|min:1',
            'ghi_chu' => 'nullable|string|max:255',
            'thu_tu_uu_tien' => 'nullable|integer|min:1',
        ]);

        // Kiểm tra xem bàn đã có món nào đang trong tiến trình phục vụ hay chưa
        $hasActive = DatMon::where('ban_id', $ban_id)
            ->where('trang_thai', '!=', 'da_thanh_toan')
            ->exists();
            
        // LUẬT: Số lượng khách chỉ được gán vào hóa đơn đầu tiên (su suất đầu) của bàn ăn
        // để tránh việc tính lặp lại số lượng khách khi họ gọi thêm món lẻ tẻ sau đó.
        $soLuongKhachOrder = $hasActive ? 0 : $ban->so_luong_khach;

        // Tạo bản ghi gọi món mới lưu vào cơ sở dữ liệu
        $datMon = DatMon::create([
            'ten_mon' => $request->ten_mon,
            'don_gia' => $request->don_gia,
            'thoi_gian_uoc_tinh' => $request->thoi_gian_uoc_tinh,
            'so_luong' => $request->so_luong,
            'so_luong_khach' => $soLuongKhachOrder,
            'ghi_chu' => $request->ghi_chu,
            'thu_tu_uu_tien' => $request->input('thu_tu_uu_tien', 1),
            'trang_thai' => 'dang_cho', // Trạng thái mặc định: Đang chờ nấu
            'ban_id' => $ban_id,
        ]);

        // Cập nhật trạng thái bàn ăn thành "Đã gọi" (nhân viên biết để kiểm tra)
        $ban->update(['trang_thai' => 'Da_goi']);

        // PHÁT SỰ KIỆN BROADCASTING: Sử dụng Laravel Reverb (WebSockets) để gửi dữ liệu đơn mới
        // xuống màn hình bếp KDS và sơ đồ bàn của nhân viên tức thì, giúp bếp tự động phát nhạc báo.
        $datMon->load('ban');
        event(new \App\Events\OrderStatusUpdated($datMon));
        event(new \App\Events\TableStateUpdated($ban, 'new_order'));
        event(new \App\Events\DashboardUpdated('order_placed'));

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi đơn món ' . $request->ten_mon . ' xuống nhà bếp thành công!',
            'order' => $datMon
        ]);
    }

    /**
     * 5. API cập nhật trạng thái chế biến (Bếp bắt đầu nấu / Phục vụ giao món)
     * 
     * POST /dat-mon/doi-trang-thai/{id}
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $order = DatMon::findOrFail($id);
        $status = $request->input('status'); // dang_cho (chờ), dang_lam (nấu), dang_giao (giao), da_giao (hoàn tất)

        if (!in_array($status, ['dang_cho', 'dang_lam', 'dang_giao', 'da_giao'])) {
            return response()->json(['success' => false, 'message' => 'Trạng thái chuyển đổi không hợp lệ.'], 400);
        }

        // CƠ CHẾ KHẤU TRỪ KHO TỰ ĐỘNG:
        // Khi bếp bắt đầu chế biến món ăn (dang_lam, dang_giao, da_giao), hệ thống sẽ kiểm tra
        // xem món ăn này đã từng thực hiện trừ kho nguyên liệu trước đó chưa. 
        // Nếu chưa, hệ thống tự động chạy quy trình trừ kho theo nguyên tắc cận date dùng trước (FEFO).
        if (in_array($status, ['dang_lam', 'dang_giao', 'da_giao'])) {
            $daTieuHao = ChiTietTieuHaoDatMon::where('dat_mon_id', $order->id)->exists();

            if (!$daTieuHao) {
                try {
                    $this->khauTruKhoFEFO($order);
                } catch (\Exception $e) {
                    // Nếu thiếu hụt nguyên liệu trong kho, trả về lỗi ngăn không cho chế biến
                    return response()->json([
                        'success' => false,
                        'message' => $e->getMessage()
                    ], 400);
                }
            }
        }

        // Cập nhật trạng thái chế biến cho món ăn
        $order->update(['trang_thai' => $status]);

        // Tự động kiểm tra và cập nhật trạng thái bàn ăn
        $ban = Ban::with('activeDatMons')->find($order->ban_id);
        if ($ban) {
            // Đếm xem bàn này còn món nào chưa phục vụ xong hay không
            $undeliveredCount = $ban->activeDatMons->where('trang_thai', '!=', 'da_giao')->count();
            if ($undeliveredCount == 0 && $ban->trang_thai === 'Da_goi') {
                // Nếu toàn bộ món ăn đã phục vụ xong -> Đổi trạng thái bàn về "Có khách" (đang ăn)
                $ban->update(['trang_thai' => 'Co_khach']); 
            } else if ($undeliveredCount > 0) {
                // Nếu vẫn còn món đang chờ -> Giữ trạng thái bàn là "Đã gọi"
                $ban->update(['trang_thai' => 'Da_goi']);
            }
        }

        // Phát tín hiệu đồng bộ WebSocket tức thì lên các màn hình giám sát
        $order->load('ban');
        event(new \App\Events\OrderStatusUpdated($order));
        if ($ban) {
            event(new \App\Events\TableStateUpdated($ban, 'status_updated'));
        }
        event(new \App\Events\DashboardUpdated('status_updated'));

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái chế biến món ăn và tự động khấu trừ kho thành công!',
            'new_status' => $status
        ]);
    }

    /**
     * 6. API hủy/xóa món ăn (Có cơ chế tự động hoàn trả nguyên vật liệu vào kho)
     * 
     * Khi khách hoặc phục vụ muốn hủy món, hệ thống phải thực hiện:
     * 1. Hủy món khỏi hóa đơn.
     * 2. Tìm kiếm lịch sử tiêu hao và cộng trả lại số lượng nguyên liệu vào kho tổng và lô hàng ban đầu.
     * 
     * POST /dat-mon/huy/{id}
     */
    public function destroy($id)
    {
        $order = DatMon::findOrFail($id);
        $banId = $order->ban_id;

        try {
            // Sử dụng Database Transactions để đảm bảo: hoặc hoàn kho toàn bộ thành công,
            // hoặc không làm gì cả (tránh lỗi lệch kho nếu một bước bị lỗi giữa chừng).
            DB::beginTransaction();

            // Tìm toàn bộ lịch sử tiêu hao nguyên liệu của món ăn này
            $consumptionRecords = ChiTietTieuHaoDatMon::where('dat_mon_id', $order->id)->get();

            foreach ($consumptionRecords as $record) {
                // Cộng trả lại số lượng nguyên liệu tiêu hao vào đúng lô hàng đã nhập ban đầu
                $batch = LoHangNhap::find($record->lo_hang_nhap_id);
                if ($batch) {
                    $batch->increment('so_luong_ton', $record->so_luong_tieu_hao);
                }

                // Cộng trả lại số lượng nguyên liệu vào bảng kho nguyên liệu tổng
                $ing = NguyenLieu::find($record->nguyen_lieu_id);
                if ($ing) {
                    $ing->increment('so_luong_ton', $record->so_luong_tieu_hao);
                }

                // Xóa bỏ bản ghi tiêu hao nguyên vật liệu chi tiết
                $record->delete();
            }

            DB::commit(); // Xác nhận giao dịch hoàn kho thành công
        } catch (\Exception $e) {
            DB::rollBack(); // Hủy bỏ các thao tác nếu có lỗi xảy ra
            Log::warning('Không thể hoàn lại tồn kho khi hủy đơn #' . $order->id . ': ' . $e->getMessage());
        }

        // Phát sự kiện xóa đơn cho Client biết để ẩn dòng khỏi bảng
        $deletedOrder = clone $order;
        $deletedOrder->trang_thai = 'deleted';
        $deletedOrder->load('ban');
        event(new \App\Events\OrderStatusUpdated($deletedOrder));

        // Tiến hành xóa món ăn khỏi CSDL
        $order->delete();

        // Kiểm tra xem bàn ăn còn món nào không, nếu trống trơn thì đặt trạng thái bàn về Trống
        $ban = Ban::with('activeDatMons')->find($banId);
        if ($ban && $ban->activeDatMons->count() == 0) {
            $ban->update(['trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null]);
        }

        if ($ban) {
            $ban->load('activeDatMons');
            event(new \App\Events\TableStateUpdated($ban, 'order_cancelled'));
        }
        event(new \App\Events\DashboardUpdated('order_cancelled'));

        return redirect()->back()->with('success', 'Đã hủy món ăn và hoàn trả lại số lượng tồn kho nguyên liệu thành công!');
    }

    /**
     * 7. Màn hình giám sát và phục vụ của nhân viên chạy bàn
     * 
     * GET /nhan-vien
     */
    public function nhanVien()
    {
        $tables = Ban::with('activeDatMons')->get();
        $menuItems = MonAn::all();

        return view('dat_mon.nhan_vien', compact('tables', 'menuItems'));
    }

    /**
     * 8. API lấy dữ liệu cập nhật thời gian thực (Hỗ trợ cơ chế Polling)
     * 
     * Trả về danh sách đơn chờ, ước tính thời gian chờ thực tế, bàn yêu cầu thanh toán
     * và cảnh báo nguyên vật liệu sắp cạn kiệt dưới dạng JSON.
     * 
     * GET /api/realtime-updates
     */
    public function getRealtimeUpdates(Request $request): JsonResponse
    {
        $chefCount = (int)$request->input('chefs', 3);
        if ($chefCount < 1) $chefCount = 1;

        // Lấy tất cả các món ăn đang trong hàng đợi chế biến (chờ nấu và đang nấu)
        $activeQueue = DatMon::whereIn('trang_thai', ['dang_cho', 'dang_lam'])
            ->orderBy('thu_tu_uu_tien', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        // Thuật toán lập lịch bếp để tính thời gian chờ của từng món ăn
        $estimatedWaitTimes = $this->tinhThoiGianChoUocTinh($activeQueue, $chefCount);

        $tables = Ban::with('activeDatMons')->get();

        // Chuẩn bị dữ liệu gửi về Client
        $orders = DatMon::with('ban')
            ->whereIn('trang_thai', ['dang_cho', 'dang_lam', 'dang_giao'])
            ->orderBy('thu_tu_uu_tien', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($o) use ($estimatedWaitTimes) {
                return [
                    'id' => $o->id,
                    'ban_id' => $o->ban_id,
                    'ban_ten' => $o->ban->ten ?? 'Bàn',
                    'ten_mon' => $o->ten_mon,
                    'so_luong' => $o->so_luong,
                    'don_gia' => $o->don_gia,
                    'trang_thai' => $o->trang_thai,
                    'thoi_gian_uoc_tinh' => $o->thoi_gian_uoc_tinh,
                    'thu_tu_uu_tien' => $o->thu_tu_uu_tien,
                    'real_wait_time' => $estimatedWaitTimes[$o->id] ?? 0,
                    'minutes_elapsed' => $o->minutes_elapsed,
                    'is_late_warning' => $o->is_late_warning,
                    'ghi_chu' => $o->ghi_chu,
                    'created_at' => $o->created_at->toIso8601String()
                ];
            });

        // Danh sách bàn đang bấm nút yêu cầu thanh toán
        $paymentRequests = $tables->whereNotNull('yeu_cau_thanh_toan')
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'ten' => $t->ten,
                    'yeu_cau_thanh_toan' => $t->yeu_cau_thanh_toan,
                    'tong_tien' => $t->activeDatMons->sum(function($item) { return $item->so_luong * $item->don_gia; })
                ];
            })->values();

        // Cảnh báo nguyên liệu sắp hết trong kho (tồn kho tổng dưới 5)
        $lowStockIngredients = NguyenLieu::where('so_luong_ton', '<', 5)
            ->get()
            ->map(function($i) {
                return [
                    'id' => $i->id,
                    'ten' => $i->ten,
                    'so_luong_ton' => $i->so_luong_ton,
                    'don_vi' => $i->don_vi
                ];
            });

        return response()->json([
            'success' => true,
            'orders' => $orders,
            'payment_requests' => $paymentRequests,
            'low_stock_materials' => $lowStockIngredients
        ]);
    }

    /**
     * 9. API cập nhật số khách ngồi tại bàn ăn khi quét QR
     * 
     * POST /qr-order/{ban_id}/cap-nhat-so-khach
     */
    public function updateGuestCount(Request $request, $ban_id): JsonResponse
    {
        $ban = Ban::findOrFail($ban_id);
        $soKhach = (int)$request->input('so_luong_khach', 1);

        if ($soKhach < 1) {
            return response()->json(['success' => false, 'message' => 'Số lượng khách không hợp lệ.'], 400);
        }

        $ban->update(['so_luong_khach' => $soKhach]);

        // Phát WebSocket cập nhật dữ liệu Dashboard quản lý doanh số
        $ban->load('activeDatMons');
        event(new \App\Events\TableStateUpdated($ban, 'guest_count_updated'));
        event(new \App\Events\DashboardUpdated('guest_count_updated'));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật số lượng khách thành công!',
            'so_luong_khach' => $soKhach
        ]);
    }

    /**
     * 10. API: Trả về HTML màn hình bếp (Phục vụ AJAX Grid cập nhật mượt mà không cần F5)
     * 
     * GET /api/bep-grid-html
     */
    public function bepGridHtml(Request $request)
    {
        $orders = DatMon::with('ban')
            ->whereIn('trang_thai', ['dang_cho', 'dang_lam', 'dang_giao'])
            ->orderBy('created_at', 'asc')
            ->get();

        return view('dat_mon.bep_grid', compact('orders'));
    }

    /**
     * 11. API: Trả về HTML sơ đồ bàn của nhân viên
     * 
     * GET /api/nhan-vien-grid-html
     */
    public function nhanVienGridHtml(Request $request)
    {
        $tables = Ban::with('activeDatMons')->get();
        return view('dat_mon.nhan_vien_grid', compact('tables'));
    }

    /**
     * 12. API: Trả về HTML danh sách món ăn đã đặt tại bàn (dành cho màn hình khách hàng tự theo dõi)
     * 
     * GET /api/qr-ordered-grid-html/{ban_id}
     */
    public function qrOrderedGridHtml($ban_id)
    {
        $ban = Ban::with('activeDatMons')->findOrFail($ban_id);
        return view('ban.ordered_items_grid', compact('ban'));
    }

    // =========================================================================
    // CÁC PHƯƠNG THỨC XỬ LÝ NỘI BỘ (PRIVATE HELPER METHODS)
    // =========================================================================

    /**
     * Helper: Khấu trừ nguyên vật liệu kho theo công thức định lượng (BOM) và nguyên tắc FEFO
     * 
     * FEFO (First Expired, First Out): Ưu tiên trừ nguyên liệu thuộc lô hàng có Hạn sử dụng gần nhất.
     */
    private function khauTruKhoFEFO(DatMon $order)
    {
        // 1. Tìm thông tin định nghĩa món ăn trong thực đơn dựa trên tên món
        $monAn = MonAn::where('ten', $order->ten_mon)->first();
        
        // Nếu món ăn này không định nghĩa nguyên liệu cấu thành (ví dụ đồ đóng chai lon uống liền), bỏ qua trừ kho.
        if (!$monAn || $monAn->nguyenLieu()->count() === 0) {
            return;
        }

        DB::transaction(function() use ($monAn, $order) {
            // BƯỚC 1: Kiểm tra trước tổng tồn kho của tất cả nguyên liệu liên quan.
            // Nếu có bất kỳ nguyên liệu nào bị thiếu hụt, lập tức bắn Exception để rollback toàn bộ.
            foreach ($monAn->nguyenLieu as $ing) {
                // Lượng nguyên liệu cần = (định lượng cho 1 suất món) * (số lượng đĩa gọi)
                $qtyNeeded = $ing->pivot->so_luong_dinh_luong * $order->so_luong;
                if ($ing->so_luong_ton < $qtyNeeded) {
                    throw new \Exception('Không đủ nguyên liệu [' . $ing->ten . '] để chế biến! Hệ thống yêu cầu ' . $qtyNeeded . ' ' . $ing->don_vi . ', tồn kho hiện tại chỉ còn: ' . $ing->so_luong_ton . ' ' . $ing->don_vi . '. Vui lòng báo kho nhập thêm hàng!');
                }
            }

            // BƯỚC 2: Tiến hành trừ kho theo FEFO và ghi nhận lịch sử tiêu hao chi tiết
            foreach ($monAn->nguyenLieu as $ing) {
                $remaining = $ing->pivot->so_luong_dinh_luong * $order->so_luong; // Số lượng cần trừ tiếp tục

                // Lấy tất cả các lô hàng đã nhập của nguyên liệu này, xếp theo hạn sử dụng tăng dần (gần hết hạn nhất đứng đầu)
                $batches = LoHangNhap::where('nguyen_lieu_id', $ing->id)
                    ->where('so_luong_ton', '>', 0)
                    ->orderBy('ngay_het_han', 'asc')
                    ->get();

                foreach ($batches as $batch) {
                    if ($remaining <= 0) break; // Đã trừ đủ số lượng cần thiết

                    if ($batch->so_luong_ton >= $remaining) {
                        // Trường hợp lô hàng hiện tại đủ cung cấp toàn bộ phần còn lại
                        $consumeQty = $remaining;
                        $batch->decrement('so_luong_ton', $consumeQty);

                        // Ghi vết tiêu hao
                        ChiTietTieuHaoDatMon::create([
                            'dat_mon_id' => $order->id,
                            'nguyen_lieu_id' => $ing->id,
                            'lo_hang_nhap_id' => $batch->id,
                            'so_luong_tieu_hao' => $consumeQty,
                            'don_gia_von' => $batch->don_gia_nhap, // Lưu đơn giá nhập của lô để tính giá vốn chuẩn
                        ]);

                        $remaining = 0;
                    } else {
                        // Trường hợp lô hàng hiện tại không đủ, trừ sạch lô này rồi chuyển sang lô tiếp theo
                        $consumeQty = $batch->so_luong_ton;
                        $batch->update(['so_luong_ton' => 0]);

                        ChiTietTieuHaoDatMon::create([
                            'dat_mon_id' => $order->id,
                            'nguyen_lieu_id' => $ing->id,
                            'lo_hang_nhap_id' => $batch->id,
                            'so_luong_tieu_hao' => $consumeQty,
                            'don_gia_von' => $batch->don_gia_nhap,
                        ]);

                        $remaining -= $consumeQty;
                    }
                }

                // Cập nhật lại tồn kho tổng của nguyên liệu đó trong bảng 'nguyen_lieu'
                $ing->decrement('so_luong_ton', $ing->pivot->so_luong_dinh_luong * $order->so_luong);
            }
        });
    }

    /**
     * Helper: Thuật toán xếp lịch và ước tính thời gian chờ chế biến
     * 
     * Phân phối các món ăn đang xếp hàng chế biến vào các dòng thời gian của số đầu bếp trực ca.
     */
    private function tinhThoiGianChoUocTinh($activeQueue, $chefCount)
    {
        // Mảng chứa thời điểm rảnh rỗi tiếp theo của từng đầu bếp (mặc định ban đầu là 0)
        $chefTimeline = array_fill(0, $chefCount, 0);
        $estimatedWaitTimes = [];

        foreach ($activeQueue as $order) {
            // Tổng thời gian nấu món này = (định mức nấu 1 suất) * (số suất gọi)
            $prepDuration = $order->thoi_gian_uoc_tinh * $order->so_luong;
            
            // Tìm đầu bếp rảnh sớm nhất trong ca trực (người có thời gian bận ít nhất hiện tại)
            $earliestChefIndex = 0;
            $minFreeTime = $chefTimeline[0];
            for ($i = 1; $i < $chefCount; $i++) {
                if ($chefTimeline[$i] < $minFreeTime) {
                    $minFreeTime = $chefTimeline[$i];
                    $earliestChefIndex = $i;
                }
            }

            if ($order->trang_thai === 'dang_lam') {
                // Nếu món ăn đang nấu:
                // Thời gian còn lại = Tổng thời gian nấu ước tính - số phút đã trôi qua kể từ lúc đặt
                $elapsed = $order->minutes_elapsed;
                $remaining = max(0, $prepDuration - $elapsed);
                
                // Cộng dồn vào dòng thời gian của đầu bếp được phân công nấu món này
                $chefTimeline[$earliestChefIndex] += $remaining;
                $estimatedWaitTimes[$order->id] = $chefTimeline[$earliestChefIndex];
            } else {
                // Nếu món ăn đang xếp hàng chờ:
                // Thời điểm hoàn thành = Thời điểm đầu bếp rảnh + tổng thời gian nấu món này
                $finishTime = $minFreeTime + $prepDuration;
                $chefTimeline[$earliestChefIndex] = $finishTime;
                $estimatedWaitTimes[$order->id] = $finishTime;
            }
        }

        return $estimatedWaitTimes;
    }
}
