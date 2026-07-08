<?php

namespace App\Http\Controllers;

use App\Events\DashboardUpdated;
use App\Events\TableStateUpdated;
use App\Models\Ban;
use App\Models\DatMon;
use App\Models\KhachHang;
use App\Services\CrmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * BanController - Bộ điều khiển quản lý Sơ đồ bàn và Thanh toán
 *
 * Phụ trách các nghiệp vụ cốt lõi của ca phục vụ:
 *   - Hiển thị sơ đồ bàn theo trạng thái thời gian thực
 *   - Thêm bàn mới vào sơ đồ nhà hàng
 *   - Tiếp nhận và xử lý yêu cầu thanh toán từ khách (tại bàn & QR)
 *   - Thanh toán toàn bộ hóa đơn và tích điểm CRM
 *   - Thanh toán tách hóa đơn (Split Bill)
 */
class BanController extends Controller
{
    /**
     * Inject CrmService qua constructor thay vì gọi private method trong controller.
     */
    public function __construct(protected CrmService $crm) {}

    // =========================================================================
    // ACTIONS
    // =========================================================================

    /**
     * 1. Hiển thị sơ đồ bàn (Dành cho nhân viên phục vụ và thu ngân)
     *
     * GET /ban
     */
    public function index()
    {
        // Tài khoản bếp bị chuyển hướng sang màn hình KDS để tránh hiển thị sai giao diện
        if (auth()->check() && auth()->user()->role === 'bep') {
            return redirect()->route('dat_mon.bep');
        }

        // Dùng scope withActiveOrders() thay vì with('activeDatMons') để tái sử dụng
        $tables = Ban::withActiveOrders()->get();

        // Thống kê trạng thái bàn từ Collection đã load (không query thêm)
        $totalTables = $tables->count();
        $occupiedTables = $tables->where('trang_thai', 'Co_khach')->count();
        $orderedTables = $tables->where('trang_thai', 'Da_goi')->count();
        $freeTables = $tables->where('trang_thai', 'Trong')->count();

        // Doanh thu hôm nay — dùng scope completed() + forDate() của DatMon
        $completedToday = DatMon::completed()->forDate()->get();
        $totalRevenue = $completedToday->sum(fn ($item) => $item->total);

        // ROI ước tính từ config thay vì hardcode
        $estimatedProfit = $totalRevenue * config('restaurant.profit_margin', 0.40);
        $savedFromLoss = $totalRevenue * config('restaurant.saved_from_loss_rate', 0.15);

        // Danh sách khách hàng CRM để dùng trong form tích điểm khi checkout
        $crmCustomers = KhachHang::orderBy('ten')->select(['id', 'ten', 'sdt', 'diem_tich_luy'])->get();

        return view('ban.ban', compact(
            'tables', 'totalTables', 'occupiedTables', 'orderedTables', 'freeTables',
            'totalRevenue', 'estimatedProfit', 'savedFromLoss', 'crmCustomers'
        ));
    }

    /**
     * 2. Thêm bàn ăn mới vào sơ đồ nhà hàng
     *
     * POST /ban/them
     */
    public function store(Request $request)
    {
        $request->validate(['ten' => 'required|string|max:100|unique:ban,ten']);

        $ban = Ban::create([
            'ten' => $request->ten,
            'trang_thai' => 'Trong',
        ]);

        // Phát WebSocket để tất cả màn hình đang mở cập nhật tức thì
        event(new TableStateUpdated($ban, 'store'));
        event(new DashboardUpdated('table_added'));

        return redirect()->back()->with('success', "Đã thêm bàn {$ban->ten} thành công vào sơ đồ!");
    }

    /**
     * 3. Khách bấm yêu cầu thanh toán từ màn hình QR Order tại bàn
     *
     * POST /ban/yeu-cau-thanh-toan/{id}
     */
    public function requestCheckout(Request $request, int $id): JsonResponse
    {
        $ban = Ban::findOrFail($id);
        $type = $request->input('type');

        if (! in_array($type, ['tien_mat', 'qr'])) {
            return response()->json(['success' => false, 'message' => 'Loại hình thanh toán không hợp lệ.'], 400);
        }

        $ban->update(['yeu_cau_thanh_toan' => $type]);

        $ban->load('activeDatMons');
        event(new TableStateUpdated($ban, 'request_checkout'));
        event(new DashboardUpdated('payment_requested'));

        $message = $type === 'tien_mat'
            ? 'Đã gửi yêu cầu nhân viên đến thanh toán tiền mặt tại quầy!'
            : 'Đã gửi yêu cầu thanh toán chuyển khoản QR!';

        return response()->json([
            'success' => true,
            'message' => $message,
            'ban_ten' => $ban->ten,
            'type' => $type,
        ]);
    }

    /**
     * 4. Xác nhận khách báo đã chuyển khoản thành công (từ màn hình QR Order)
     *
     * POST /ban/xac-nhan-chuyen-khoan/{id}
     */
    public function confirmQrPaid(int $id): JsonResponse
    {
        $ban = Ban::findOrFail($id);
        $ban->update(['yeu_cau_thanh_toan' => 'qr_paid']);

        $ban->load('activeDatMons');
        event(new TableStateUpdated($ban, 'confirm_qr_paid'));
        event(new DashboardUpdated('qr_paid_confirmed'));

        return response()->json([
            'success' => true,
            'message' => 'Hệ thống đã nhận được thông báo chuyển khoản thành công từ bàn của bạn!',
        ]);
    }

    /**
     * 5. Thu ngân xác nhận thanh toán toàn bộ hóa đơn
     *
     * POST /ban/thanh-toan/{id}
     */
    public function checkout(Request $request, int $id)
    {
        $ban = Ban::with('activeDatMons')->findOrFail($id);
        $activeOrders = $ban->activeDatMons;

        // Tính tổng hóa đơn — dùng ->total accessor của DatMon
        $totalBill = $activeOrders->sum(fn ($item) => $item->total);

        // Tích điểm CRM qua Service
        $crm = $this->crm->tichDiem($request->input('sdt'), $request->input('khach_hang_ten'), $totalBill);

        // Đánh dấu toàn bộ món ăn là "đã thanh toán"
        $activeOrders->each(fn ($order) => $order->update([
            'trang_thai' => 'da_thanh_toan',
            'khach_hang_id' => $crm ? $crm['customer']->id : null,
        ]));

        // Giải phóng bàn ăn về trạng thái Trống
        $ban->update(['trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null, 'so_luong_khach' => 0]);

        // Phát WebSocket cập nhật sơ đồ bàn
        $ban->load('activeDatMons');
        event(new TableStateUpdated($ban, 'checkout'));
        event(new DashboardUpdated('checkout_completed'));

        $msg = 'Đã thanh toán '.number_format($totalBill)."đ và giải phóng {$ban->ten}!";
        if ($crm) {
            $msg .= " Tích lũy {$crm['diem_cong']} điểm cho {$crm['customer']->ten} (Tổng: {$crm['customer']->diem_tich_luy} điểm).";
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * 6. Thanh toán tách hóa đơn (Split Bill) — một phần món thanh toán trước
     *
     * POST /ban/tach-thanh-toan/{id}
     */
    public function splitCheckout(Request $request, int $id)
    {
        // Validate input trước khi foreach để tránh lỗi runtime
        $request->validate([
            'splits' => 'required|array|min:1',
            'splits.*.order_id' => 'required|integer',
            'splits.*.pay_qty' => 'required|integer|min:1',
        ]);

        $ban = Ban::findOrFail($id);
        $splits = $request->input('splits', []);
        $totalBillA = 0;
        $paidOrderIds = [];

        foreach ($splits as $split) {
            $orderId = (int) $split['order_id'];
            $payQty = (int) $split['pay_qty'];

            // Tìm đơn món còn active của bàn này
            $order = DatMon::where('ban_id', $ban->id)->active()->findOrFail($orderId);

            if ($payQty >= $order->so_luong) {
                // Thanh toán toàn bộ dòng này (Bill A)
                $totalBillA += $order->total;
                $order->update(['trang_thai' => 'da_thanh_toan']);
                $paidOrderIds[] = $order->id;
            } else {
                // Thanh toán một phần — nhân bản dòng đã trả
                $totalBillA += $payQty * $order->don_gia;

                $paidOrder = $order->replicate();
                $paidOrder->so_luong = $payQty;
                $paidOrder->trang_thai = 'da_thanh_toan';
                $paidOrder->save();
                $paidOrderIds[] = $paidOrder->id;

                // Giảm số lượng gốc
                $order->decrement('so_luong', $payQty);
            }
        }

        // Tích điểm CRM cho Bill A
        $crm = $this->crm->tichDiem($request->input('sdt'), $request->input('khach_hang_ten'), $totalBillA);
        if ($crm && ! empty($paidOrderIds)) {
            DatMon::whereIn('id', $paidOrderIds)->update(['khach_hang_id' => $crm['customer']->id]);
        }

        // Kiểm tra còn món nào chưa thanh toán không
        $remainingCount = DatMon::where('ban_id', $ban->id)->active()->count();

        if ($remainingCount === 0) {
            $ban->update(['trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null, 'so_luong_khach' => 0]);
            $msg = 'Đã thanh toán Bill A: '.number_format($totalBillA).'đ. Bàn đã sạch bill và được giải phóng!';
        } else {
            $ban->update(['yeu_cau_thanh_toan' => null]);
            $msg = 'Đã thanh toán Bill A: '.number_format($totalBillA).'đ. Bill B vẫn còn lưu trên bàn.';
        }

        $ban->load('activeDatMons');
        event(new TableStateUpdated($ban, 'split_checkout'));
        event(new DashboardUpdated('split_checkout_completed'));

        if ($crm) {
            $msg .= " Tích lũy {$crm['diem_cong']} điểm cho {$crm['customer']->ten}.";
        }

        return redirect()->back()->with('success', $msg);
    }
}
