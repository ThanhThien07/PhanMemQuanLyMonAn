<?php

namespace App\Http\Controllers;

use App\Models\Ban;
use App\Models\DatMon;
use App\Models\NguyenLieu;
use App\Models\KhachHang;
use App\Models\BaoCaoQuanLy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;

/**
 * BanController - Bộ điều khiển xử lý Sơ đồ bàn, Hóa đơn, Báo cáo và Sao lưu
 * 
 * Bộ điều khiển này phụ trách quản lý trạng thái của các bàn ăn (Trống, Có khách, Đã gọi),
 * các nghiệp vụ thanh toán (thanh toán đủ, tách hóa đơn), xuất báo cáo doanh số Excel/Word,
 * lưu trữ báo cáo ngày và kích hoạt các chức năng sao lưu (backups) hệ thống.
 */
class BanController extends Controller
{
    /**
     * 1. Hiển thị sơ đồ bàn (Dành cho quản lý, phục vụ, thu ngân)
     * 
     * GET /ban
     */
    public function index()
    {
        // Nếu là tài khoản thuộc bộ phận nhà bếp (bep), tự động chuyển hướng họ
        // sang màn hình bếp KDS để tránh việc hiển thị sai lệch giao diện.
        if (auth()->check() && auth()->user()->role === 'bep') {
            return redirect()->route('dat_mon.bep');
        }

        // Lấy danh sách toàn bộ các bàn ăn kèm theo các món đang được chế biến/phục vụ chưa thanh toán
        // Sử dụng Eager Loading 'with("activeDatMons")' để tối ưu hóa truy vấn CSDL (tránh lỗi N+1 query).
        $tables = Ban::with('activeDatMons')->get();
        
        // Thống kê nhanh số lượng bàn theo từng trạng thái phục vụ
        $totalTables = $tables->count();
        $occupiedTables = $tables->where('trang_thai', 'Co_khach')->count();
        $orderedTables = $tables->where('trang_thai', 'Da_goi')->count();
        $freeTables = $tables->where('trang_thai', 'Trong')->count();
        
        // Tính toán doanh thu thực tế phát sinh trong ngày hôm nay
        // Lấy các bản ghi gọi món trong ngày hôm nay có trạng thái đã giao (da_giao) hoặc đã thanh toán (da_thanh_toan)
        $completedOrders = DatMon::whereDate('created_at', now()->toDateString())
            ->whereIn('trang_thai', ['da_giao', 'da_thanh_toan'])
            ->get();

        // Sử dụng hàm sum() của Collection để tính tổng doanh thu
        $totalRevenue = $completedOrders->sum(function($item) {
            return $item->so_luong * $item->don_gia;
        });

        // Ước tính ROI: Lợi nhuận gộp khoảng 40% doanh thu, tiết kiệm hao hụt kho 15%
        $estimatedProfit = $totalRevenue * 0.40;
        $savedFromLoss = $totalRevenue * 0.15;

        // Lấy danh sách tất cả khách hàng CRM để hiển thị trong form chọn nhanh khi thanh toán tích điểm
        $crmCustomers = KhachHang::orderBy('ten')->get();

        // Trả về view: resources/views/ban/ban.blade.php kèm dữ liệu đã chuẩn bị
        return view('ban.ban', compact(
            'tables', 
            'totalTables', 
            'occupiedTables', 
            'orderedTables', 
            'freeTables', 
            'totalRevenue',
            'estimatedProfit',
            'savedFromLoss',
            'crmCustomers'
        ));
    }

    /**
     * 2. Thêm bàn ăn mới vào sơ đồ nhà hàng
     * 
     * POST /ban/them
     */
    public function store(Request $request)
    {
        // Xác thực dữ liệu đầu vào: Tên bàn là bắt buộc và không được trùng lặp
        $request->validate([
            'ten' => 'required|string|max:100|unique:ban,ten',
        ]);

        // Tạo bàn mới với trạng thái mặc định ban đầu là "Trong" (Trống)
        $ban = Ban::create([
            'ten' => $request->ten,
            'trang_thai' => 'Trong',
        ]);

        // Phát sự kiện cập nhật thời gian thực qua Laravel Reverb (WebSockets)
        // Điều này giúp trình duyệt của tất cả nhân sự đang mở sơ đồ bàn tự động cập nhật mà không cần F5.
        event(new \App\Events\TableStateUpdated($ban, 'store'));
        event(new \App\Events\DashboardUpdated('table_added'));

        return redirect()->back()->with('success', 'Đã thêm bàn ' . $ban->ten . ' thành công vào sơ đồ!');
    }

    /**
     * 3. Khách hàng bấm gửi yêu cầu thanh toán từ màn hình thiết bị cá nhân
     * 
     * POST /ban/yeu-cau-thanh-toan/{id}
     */
    public function requestCheckout(Request $request, $id): JsonResponse
    {
        $ban = Ban::findOrFail($id);
        $type = $request->input('type'); // 'tien_mat' (tiền mặt) hoặc 'qr' (chuyển khoản QR)
        
        if (!in_array($type, ['tien_mat', 'qr'])) {
            return response()->json(['success' => false, 'message' => 'Loại hình thanh toán yêu cầu không hợp lệ.'], 400);
        }

        // Cập nhật trường yêu cầu thanh toán của bàn ăn
        $ban->update([
            'yeu_cau_thanh_toan' => $type
        ]);

        // Đồng bộ thời gian thực để thiết bị của thu ngân/phục vụ lập tức rung chuông hoặc nhấp nháy báo bàn cần tính tiền
        $ban->load('activeDatMons');
        event(new \App\Events\TableStateUpdated($ban, 'request_checkout'));
        event(new \App\Events\DashboardUpdated('payment_requested'));

        $message = $type === 'tien_mat' 
            ? 'Đã gửi yêu cầu nhân viên đến thanh toán tiền mặt tại quầy!'
            : 'Đã gửi yêu cầu thanh toán chuyển khoản QR!';

        return response()->json([
            'success' => true,
            'message' => $message,
            'ban_ten' => $ban->ten,
            'type' => $type
        ]);
    }

    /**
     * 4. Xác nhận khách hàng báo đã chuyển khoản thành công từ màn hình QR Order
     * 
     * POST /ban/xac-nhan-chuyen-khoan/{id}
     */
    public function confirmQrPaid($id): JsonResponse
    {
        $ban = Ban::findOrFail($id);
        
        // Đặt trạng thái yêu cầu thanh toán là 'qr_paid' (khách báo đã chuyển khoản thành công)
        $ban->update([
            'yeu_cau_thanh_toan' => 'qr_paid'
        ]);

        // Phát tín hiệu thời gian thực để thu ngân đối soát ngân hàng và hoàn tất thủ tục
        $ban->load('activeDatMons');
        event(new \App\Events\TableStateUpdated($ban, 'confirm_qr_paid'));
        event(new \App\Events\DashboardUpdated('qr_paid_confirmed'));

        return response()->json([
            'success' => true,
            'message' => 'Hệ thống đã nhận được thông báo chuyển khoản thành công từ bàn của bạn!'
        ]);
    }

    /**
     * 5. Thu ngân bấm xác nhận thanh toán (Tích điểm CRM & Giải phóng bàn ăn)
     * 
     * POST /ban/thanh-toan/{id}
     */
    public function checkout(Request $request, $id)
    {
        $ban = Ban::findOrFail($id);
        
        // Lấy tất cả các món ăn chưa thanh toán của bàn này
        $activeOrders = $ban->activeDatMons;
        $totalBill = $activeOrders->sum(function($item) {
            return $item->so_luong * $item->don_gia;
        });

        // Xử lý tích lũy điểm CRM dựa trên số điện thoại khách hàng gửi lên form
        $crm = $this->tichDiemCRM($request->input('sdt'), $request->input('khach_hang_ten'), $totalBill);

        // Chuyển toàn bộ các món ăn liên kết với bàn ăn này thành trạng thái "da_thanh_toan" (đã thanh toán)
        foreach ($activeOrders as $order) {
            $order->update([
                'trang_thai' => 'da_thanh_toan',
                'khach_hang_id' => $crm ? $crm['customer']->id : null
            ]);
        }

        // Đặt trạng thái bàn ăn về mặc định: Trống, dọn dẹp số lượng khách và các yêu cầu thanh toán
        $ban->update([
            'trang_thai' => 'Trong',
            'yeu_cau_thanh_toan' => null,
            'so_luong_khach' => 0
        ]);

        // Phát sự kiện đồng bộ thời gian thực giải phóng bàn trên sơ đồ
        $ban->load('activeDatMons');
        event(new \App\Events\TableStateUpdated($ban, 'checkout'));
        event(new \App\Events\DashboardUpdated('checkout_completed'));

        $msg = 'Đã hoàn tất thanh toán hóa đơn trị giá ' . number_format($totalBill) . 'đ và giải phóng bàn ' . $ban->ten . '!';
        if ($crm) {
            $msg .= ' Đã tích lũy thêm ' . $crm['diem_cong'] . ' điểm cho khách ' . $crm['customer']->ten . ' (Tổng điểm hiện tại: ' . $crm['customer']->diem_tich_luy . ').';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * 6. Thanh toán tách hóa đơn (Split Bill)
     * 
     * Cho phép khách thanh toán trước một phần số lượng món ăn (gọi là Bill A),
     * phần còn lại (Bill B) vẫn lưu trên bàn để thanh toán sau.
     * 
     * POST /ban/tach-thanh-toan/{id}
     */
    public function splitCheckout(Request $request, $id)
    {
        $ban = Ban::findOrFail($id);
        $splits = $request->input('splits', []); // Danh sách mảng chứa: [{'order_id': id_món, 'pay_qty': số_lượng_tách}]
        $totalBillA = 0;
        $orderIdsForCrm = [];

        // Duyệt qua từng món ăn yêu cầu tách thanh toán
        foreach ($splits as $split) {
            $orderId = $split['order_id'];
            $payQty = (int)$split['pay_qty'];

            if ($payQty <= 0) continue;

            // Tìm đơn món chưa thanh toán khớp với bàn ăn này
            $order = DatMon::where('ban_id', $ban->id)
                ->where('trang_thai', '!=', 'da_thanh_toan')
                ->findOrFail($orderId);

            if ($payQty >= $order->so_luong) {
                // Trường hợp 1: Tách toàn bộ số lượng của dòng món này sang Bill A
                $totalBillA += $order->so_luong * $order->don_gia;
                $order->update(['trang_thai' => 'da_thanh_toan']);
                $orderIdsForCrm[] = $order->id;
            } else {
                // Trường hợp 2: Tách một phần số lượng (ví dụ: gọi 3 bát phở, thanh toán trước 1 bát)
                $totalBillA += $payQty * $order->don_gia;

                // Nhân bản (replicate) bản ghi gọi món đó để làm bản ghi đại diện đã thanh toán cho Bill A
                $paidOrder = $order->replicate();
                $paidOrder->so_luong = $payQty;
                $paidOrder->trang_thai = 'da_thanh_toan';
                $paidOrder->save();
                $orderIdsForCrm[] = $paidOrder->id;

                // Giảm số lượng của bản ghi gốc trên bàn đi tương ứng với phần đã thanh toán
                $order->decrement('so_luong', $payQty);
            }
        }

        // Tích lũy điểm CRM cho khách hàng thanh toán Bill A
        $crm = $this->tichDiemCRM($request->input('sdt'), $request->input('khach_hang_ten'), $totalBillA);

        if ($crm && !empty($orderIdsForCrm)) {
            DatMon::whereIn('id', $orderIdsForCrm)->update(['khach_hang_id' => $crm['customer']->id]);
        }

        // Kiểm tra xem bàn ăn còn món nào chưa được thanh toán hay không
        $remainingCount = DatMon::where('ban_id', $ban->id)
            ->where('trang_thai', '!=', 'da_thanh_toan')
            ->count();

        if ($remainingCount === 0) {
            // Nếu không còn món nào chưa trả tiền -> Giải phóng bàn ăn về Trống
            $ban->update([
                'trang_thai' => 'Trong',
                'yeu_cau_thanh_toan' => null,
                'so_luong_khach' => 0
            ]);
            $msg = 'Đã thanh toán tách Bill A thành công: ' . number_format($totalBillA) . 'đ. Bàn ăn hiện đã hoàn tất sạch bill và được giải phóng!';
        } else {
            // Nếu vẫn còn món chưa trả tiền (Bill B) -> Giữ trạng thái bàn nhưng hủy yêu cầu thanh toán để phục vụ tiếp
            $ban->update(['yeu_cau_thanh_toan' => null]);
            $msg = 'Đã thanh toán tách Bill A thành công: ' . number_format($totalBillA) . 'đ. Số món còn lại (Bill B) vẫn lưu trên bàn để thanh toán sau.';
        }

        // Phát sự kiện cập nhật thời gian thực
        $ban->load('activeDatMons');
        event(new \App\Events\TableStateUpdated($ban, 'split_checkout'));
        event(new \App\Events\DashboardUpdated('split_checkout_completed'));

        if ($crm) {
            $msg .= ' Tích lũy thêm ' . $crm['diem_cong'] . ' điểm cho khách ' . $crm['customer']->ten . '.';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * 7. Dashboard báo cáo điều hành toàn diện của Quản trị viên (7-Section Report)
     * 
     * GET /quan-ly
     */
    public function quanLy(Request $request)
    {
        $tables = Ban::with('activeDatMons')->get();
        $ingredients = NguyenLieu::all();
        
        $totalTables = $tables->count();
        $occupiedTables = $tables->where('trang_thai', 'Co_khach')->count();
        $orderedTables = $tables->where('trang_thai', 'Da_goi')->count();
        $freeTables = $tables->where('trang_thai', 'Trong')->count();

        // Lọc ra các nguyên liệu có số lượng tồn kho ở mức thấp (< 5) cần nhập thêm
        $lowStockIngredients = $ingredients->filter(function($item) {
            return $item->so_luong_ton < 5;
        });

        // Lấy danh sách các đơn hàng đã phục vụ dựa trên bộ lọc thời gian chọn trên form (today, yesterday,...)
        $completedOrders = $this->layTruyVanBaoCao($request)->get();

        // Tính toán các chỉ số thống kê
        $totalRevenue = $completedOrders->sum(function($item) {
            return $item->so_luong * $item->don_gia;
        });

        $estimatedProfit = $totalRevenue * 0.40; // Lợi nhuận ước tính
        $savedFromLoss = $totalRevenue * 0.15; // Ước tính hao hụt tiết kiệm được
        $totalOrdersCount = $completedOrders->count(); // Tổng số đơn món
        $totalPlatesServed = $completedOrders->sum('so_luong'); // Tổng số suất ăn đã bán
        $totalGuestsServed = $completedOrders->sum('so_luong_khach'); // Tổng số lượt khách phục vụ

        // Lọc ra TOP 5 món ăn bán chạy nhất để vẽ biểu đồ và hiển thị bảng xếp hạng
        $bestSellers = $completedOrders->groupBy('ten_mon')
            ->map(function($group, $key) {
                return [
                    'ten_mon' => $key,
                    'so_luong' => $group->sum('so_luong'),
                    'doanh_thu' => $group->sum(function($o) { return $o->so_luong * $o->don_gia; })
                ];
            })
            ->sortByDesc('so_luong')
            ->take(5)
            ->values();

        // Lấy 6 đơn đặt món mới nhất của hệ thống để hiển thị luồng hoạt động gần đây
        $recentOrders = DatMon::with('ban')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        // Lấy danh sách các file sao lưu cơ sở dữ liệu và mã nguồn hiện có trong hệ thống
        $backupFiles = $this->layDanhSachBackup();

        // Giữ lại trạng thái lọc của form gửi lên để hiển thị đúng trên giao diện
        $filterType = $request->input('filter_type', 'today');
        $customDate = $request->input('custom_date');
        $customMonth = $request->input('custom_month');
        $customYear = $request->input('custom_year');

        return view('ban.quan_ly', compact(
            'tables', 'ingredients', 'totalTables', 'occupiedTables', 'orderedTables', 'freeTables',
            'lowStockIngredients', 'totalRevenue', 'estimatedProfit', 'savedFromLoss', 'recentOrders',
            'filterType', 'customDate', 'customMonth', 'customYear', 'totalOrdersCount',
            'totalPlatesServed', 'totalGuestsServed', 'bestSellers', 'backupFiles'
        ));
    }

    /**
     * 8. Xuất báo cáo doanh thu chi tiết ra file Excel (MIME UTF-8)
     * 
     * Giải pháp gọn nhẹ không cần thư viện bên ngoài: Render bảng HTML và gửi kèm tiêu đề header
     * định dạng Excel (application/vnd.ms-excel). MS Excel sẽ tự động đọc bảng này và hiển thị thành cột.
     * 
     * GET /quan-ly/bao-cao/export
     */
    public function exportReport(Request $request)
    {
        // Lấy các đơn món theo bộ lọc thời gian tương ứng
        $orders = $this->layTruyVanBaoCao($request)->with('ban', 'khachHang')->orderBy('created_at', 'desc')->get();
        $filterType = $request->input('filter_type', 'today');

        $filename = "bao_cao_doanh_thu_" . $filterType . "_" . date('Ymd_His') . ".xls";

        // Thiết lập các tiêu đề HTTP header để bắt buộc trình duyệt phải tải xuống file dưới dạng Excel
        $headers = [
            "Content-type"        => "application/vnd.ms-excel; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Xây dựng chuỗi HTML chứa bảng dữ liệu với các cấu hình tương thích Excel
        $html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Doanh Thu</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table { border-collapse: collapse; }
                th, td { border: 0.5pt solid #cccccc; padding: 6px; font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; }
                th { background-color: #8e192a; color: #ffffff; font-weight: bold; }
                .text-center { text-align: center; }
                .text-end { text-align: right; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        <th>ID Đơn Đặt</th>
                        <th>Bàn Phục Vụ</th>
                        <th>Tên Món Ăn</th>
                        <th class="text-center">Số Lượng</th>
                        <th class="text-end">Đơn Giá (VND)</th>
                        <th class="text-end">Tổng Tiền (VND)</th>
                        <th>Khách Hàng CRM</th>
                        <th>Số Điện Thoại</th>
                        <th>Trạng Thái</th>
                        <th>Thời Gian Đặt</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($orders as $order) {
            $tongTien = $order->so_luong * $order->don_gia;
            $tenBan = htmlspecialchars($order->ban->ten ?? 'Bàn');
            $tenMon = htmlspecialchars($order->ten_mon);
            $khachHang = htmlspecialchars($order->khachHang->ten ?? 'Khách hàng vãng lai');
            $sdt = htmlspecialchars($order->khachHang->sdt ?? 'Không có');
            $trangThai = $order->trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Đã giao';
            $thoiGian = $order->created_at->format('H:i d/m/Y');

            $html .= "<tr>
                <td class='text-center'>{$order->id}</td>
                <td>{$tenBan}</td>
                <td>{$tenMon}</td>
                <td class='text-center'>{$order->so_luong}</td>
                <td class='text-end'>" . number_format($order->don_gia) . "</td>
                <td class='text-end'>" . number_format($tongTien) . "</td>
                <td>{$khachHang}</td>
                <td>'{$sdt}</td>
                <td>{$trangThai}</td>
                <td class='text-center'>{$thoiGian}</td>
            </tr>";
        }

        $html .= '</tbody></table></body></html>';

        return response($html, 200, $headers);
    }

    /**
     * 9. Lưu trữ báo cáo ca làm việc vào Cơ sở dữ liệu (Kết thúc ca / Cuối ngày)
     * 
     * Lưu trữ toàn bộ thống kê hoạt động của ca trực/ngày vào bảng 'bao_cao_quan_ly' 
     * dưới dạng bản ghi chi tiết để ban quản trị đối soát lịch sử.
     * 
     * POST /quan-ly/bao-cao/luu
     */
    public function storeBaoCao(Request $request)
    {
        $ngayLap = $request->input('ngay_lap', now()->toDateString());
        $caLamViec = $request->input('ca_lam_viec', 'Sáng');
        $nguoiLap = Auth::user()->name ?? 'Ban điều hành';

        // Lấy danh sách các đơn trong ngày lập báo cáo
        $orders = DatMon::whereDate('created_at', $ngayLap)->get();
        $completedOrders = $orders->whereIn('trang_thai', ['da_giao', 'da_thanh_toan']);

        $tongSoHoaDon = $completedOrders->count();
        $tongLuongKhach = $completedOrders->sum('so_luong_khach');
        $tongDoanhThu = $completedOrders->sum(function($item) {
            return $item->so_luong * $item->don_gia;
        });

        // Phân bổ doanh thu giả lập theo loại thanh toán (chuyển khoản 65% và tiền mặt 35%)
        $doanhThuChuyenKhoan = round($tongDoanhThu * 0.65);
        $doanhThuTienMat = $tongDoanhThu - $doanhThuChuyenKhoan;

        // Thống kê doanh thu chi tiết theo từng món ăn
        $doanhThuTheoMon = $completedOrders->groupBy('ten_mon')->map(function($group, $name) {
            return [
                'ten_mon' => $name,
                'so_luong' => $group->sum('so_luong'),
                'doanh_thu' => $group->sum(function($item) { return $item->so_luong * $item->don_gia; })
            ];
        })->values()->toArray();

        // Thống kê doanh thu chi tiết theo từng bàn
        $doanhThuTheoKhuVuc = $completedOrders->groupBy(function($item) {
            return $item->ban->ten ?? 'Khác';
        })->map(function($group, $banName) {
            return [
                'ban' => $banName,
                'doanh_thu' => $group->sum(function($item) { return $item->so_luong * $item->don_gia; })
            ];
        })->values()->toArray();

        // Thống kê số lượng đơn theo trạng thái
        $tongDonHang = $orders->count();
        $donHoanThanh = $completedOrders->count();
        $donHuy = $orders->where('trang_thai', 'huy')->count();
        $donDangXuLy = $orders->whereIn('trang_thai', ['dang_cho', 'dang_lam'])->count();

        // Tìm món bán chạy nhất và ít nhất trong ca
        $sortedDishes = collect($doanhThuTheoMon)->sortByDesc('so_luong');
        $monBanChay = $sortedDishes->first()['ten_mon'] ?? 'N/A';
        $monBanIt = $sortedDishes->last()['ten_mon'] ?? 'N/A';
        $soLuongMonDaBan = collect($doanhThuTheoMon)->pluck('so_luong', 'ten_mon')->toArray();

        // Chụp lại trạng thái tồn kho của các nguyên liệu vào cuối ca
        $ingredients = NguyenLieu::all();
        $nguyenLieuTonCuoi = $ingredients->pluck('so_luong_ton', 'ten')->toArray();
        $nguyenLieuSapHet = $ingredients->where('so_luong_ton', '<', 5)->pluck('ten')->toArray();
        
        // Thống kê số lượng nguyên liệu nhập và sử dụng thực tế trong ngày
        $nguyenLieuNhap = \App\Models\LoHangNhap::whereDate('ngay_nhap', $ngayLap)
            ->with('nguyenLieu')
            ->get()
            ->groupBy('nguyenLieu.ten')
            ->map(function($g) {
                $total = $g->sum('so_luong_nhap');
                $donVi = $g->first()->nguyenLieu->don_vi ?? 'kg';
                return $total . ' ' . $donVi;
            })->toArray();

        $nguyenLieuDung = \App\Models\ChiTietTieuHaoDatMon::whereHas('datMon', function($q) use ($ngayLap) {
                $q->whereDate('created_at', $ngayLap);
            })
            ->with('nguyenLieu')
            ->get()
            ->groupBy('nguyenLieu.ten')
            ->map(function($g) {
                $total = $g->sum('so_luong_tieu_hao');
                $donVi = $g->first()->nguyenLieu->don_vi ?? 'kg';
                return $total . ' ' . $donVi;
            })->toArray();

        // Sinh mã báo cáo ngẫu nhiên không trùng lặp
        $maBaoCao = 'BC-' . date('Ymd', strtotime($ngayLap)) . '-' . strtoupper(Str::random(4));

        // Lưu bản ghi báo cáo quản lý vào database
        // Mảng cấu trúc dữ liệu như 'doanh_thu_theo_mon', 'nguyen_lieu_ton_cuoi' sẽ được tự động
        // serialize thành chuỗi JSON trong CSDL nhờ tính năng $casts định nghĩa trong Model BaoCaoQuanLy.
        BaoCaoQuanLy::create([
            'ma_bao_cao' => $maBaoCao,
            'ngay_lap' => $ngayLap,
            'nguoi_lap' => $nguoiLap,
            'ca_lam_viec' => $caLamViec,
            'tong_so_hoa_don' => $tongSoHoaDon,
            'tong_luong_khach' => $tongLuongKhach,
            'tong_doanh_thu' => $tongDoanhThu,
            'doanh_thu_tien_mat' => $doanhThuTienMat,
            'doanh_thu_chuyen_khoan' => $doanhThuChuyenKhoan,
            'doanh_thu_theo_mon' => $doanhThuTheoMon,
            'doanh_thu_theo_khu_vuc' => $doanhThuTheoKhuVuc,
            'tong_don_hang' => $tongDonHang,
            'don_hoan_thanh' => $donHoanThanh,
            'don_huy' => $donHuy,
            'don_dang_xu_ly' => $donDangXuLy,
            'mon_ban_chay' => $monBanChay,
            'mon_ban_it' => $monBanIt,
            'so_luong_mon_da_ban' => $soLuongMonDaBan,
            'nguyen_lieu_nhap' => $nguyenLieuNhap,
            'nguyen_lieu_dung' => $nguyenLieuDung,
            'nguyen_lieu_ton_cuoi' => $nguyenLieuTonCuoi,
            'nguyen_lieu_sap_het' => $nguyenLieuSapHet,
            'so_nhan_vien' => (int)$request->input('so_nhan_vien', 4),
            'so_gio_lam' => (double)$request->input('so_gio_lam', 8),
            'hieu_suat' => 'Tốt',
            'phan_hoi_khach' => $request->input('phan_hoi_khach') ?: 'Khách hài lòng dịch vụ',
            'su_co' => $request->input('su_co') ?: 'Không có sự cố lớn',
            'de_xuat' => $request->input('de_xuat') ?: 'Không có đề xuất thêm',
        ]);

        return redirect()->back()->with('success', 'Đã lưu báo cáo định kỳ mã số ' . $maBaoCao . ' thành công vào Cơ sở dữ liệu!');
    }

    /**
     * 10. Xem danh sách lịch sử các báo cáo ca trực đã lưu
     * 
     * GET /quan-ly/bao-cao/danh-sach
     */
    public function listBaoCao()
    {
        $reports = BaoCaoQuanLy::orderBy('created_at', 'desc')->get();
        return view('ban.danh_sach_bao_cao', compact('reports'));
    }

    /**
     * 11. Tải tài liệu hướng dẫn sử dụng phần mềm dưới dạng Word (.doc)
     * 
     * Tương tự Excel, xuất HTML thô kèm header của MS Word để tạo file tải nhanh chóng.
     * 
     * GET /tai-lieu/tai-ve
     */
    public function downloadDocx()
    {
        $headers = [
            "Content-type" => "application/vnd.ms-word",
            "Content-Disposition" => "attachment;Filename=tai_lieu_chuc_nang.doc"
        ];
        
        $content = '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <title>Tài liệu Hướng dẫn Chức năng Hệ thống M&S</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                h1 { color: #8e192a; text-align: center; }
                h2 { color: #e6b15c; border-bottom: 2px solid #8e192a; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #8e192a; color: white; }
            </style>
        </head>
        <body>
            <h1>HƯỚNG DẪN CHỨC NĂNG HỆ THỐNG QUẢN LÝ NHÀ HÀNG M&S</h1>
            <p><strong>Ngày lập:</strong> ' . date('d/m/Y') . '</p>
            <p><strong>Phiên bản:</strong> 2.0 (Tiếng Việt chính thức)</p>
            <h2>1. MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ</h2>
            <p>Bảo mật phân quyền 3 vai trò chính: admin (Ban điều hành), nhan_vien (Phục vụ/Thu ngân), bep (Nhà bếp).</p>
            <h2>2. SƠ ĐỒ BÀN & QUÉT QR</h2>
            <p>Hiển thị sơ đồ bàn theo trạng thái màu sắc thực tế và cho phép khách hàng quét mã QR đặt món trực tiếp tại bàn.</p>
            <h2>3. MÀN HÌNH BẾP KDS REAL-TIME</h2>
            <p>Tự động hóa lập lịch thời gian chờ nấu và kiểm kho trừ lô hàng theo FEFO cận date.</p>
        </body>
        </html>';

        return response($content, 200, $headers);
    }

    /**
     * 12. Tải tệp sao lưu dữ liệu (.sql hoặc .zip)
     * 
     * GET /quan-ly/backup/download/{filename}
     */
    public function downloadBackup($filename)
    {
        // Sử dụng basename() để lọc bỏ các đường dẫn thư mục giả mạo nhằm tránh lỗ hổng bảo mật Directory Traversal
        $filename = basename($filename);
        $path = storage_path('app/backups/' . $filename);

        if (!File::exists($path)) {
            return redirect()->back()->with('error', 'Tệp sao lưu không tồn tại trên hệ thống.');
        }

        // Tải file về máy của người dùng
        return response()->download($path);
    }

    /**
     * 13. Xóa tệp sao lưu khỏi đĩa lưu trữ của máy chủ
     * 
     * DELETE /quan-ly/backup/delete/{filename}
     */
    public function deleteBackup($filename)
    {
        $filename = basename($filename);
        $path = storage_path('app/backups/' . $filename);

        if (File::exists($path)) {
            File::delete($path);
            return redirect()->back()->with('success', 'Xóa tệp sao lưu thành công.');
        }

        return redirect()->back()->with('error', 'Không tìm thấy tệp sao lưu để thực hiện xóa.');
    }

    /**
     * 14. Kích hoạt thủ công tạo sao lưu cơ sở dữ liệu MySQL
     * 
     * POST /quan-ly/backup/trigger-db
     */
    public function triggerDbBackup()
    {
        try {
            // Thực thi câu lệnh Artisan console 'db:backup' từ trong mã PHP
            Artisan::call('db:backup');
            return redirect()->back()->with('success', 'Đã thực hiện sao lưu cơ sở dữ liệu MySQL thành công.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Lỗi khi sao lưu database: ' . $e->getMessage());
        }
    }

    /**
     * 15. Kích hoạt thủ công tạo sao lưu tệp tin hệ thống (Mã nguồn & Uploads) thành file ZIP
     * 
     * POST /quan-ly/backup/trigger-system
     */
    public function triggerSystemBackup()
    {
        try {
            // Thực thi lệnh Artisan 'system:backup'
            Artisan::call('system:backup');
            return redirect()->back()->with('success', 'Đã thực hiện sao lưu tệp tin hệ thống (ZIP) thành công.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Lỗi khi sao lưu hệ thống: ' . $e->getMessage());
        }
    }

    /**
     * 16. Kích hoạt thủ công chạy lệnh tự sinh báo cáo định kỳ (Tuần / Tháng)
     * 
     * POST /quan-ly/bao-cao/trigger-auto
     */
    public function triggerAutoReport(Request $request)
    {
        $type = $request->input('type', 'weekly');
        if (!in_array($type, ['weekly', 'monthly'])) {
            $type = 'weekly';
        }

        try {
            // Chạy lệnh Artisan với tham số truyền vào
            Artisan::call('report:generate', [
                '--type' => $type
            ]);
            
            $typeName = ($type === 'weekly' ? 'Tuần' : 'Tháng');
            return redirect()->back()->with('success', 'Đã tự động tính toán dữ liệu và khởi tạo Báo Cáo ' . $typeName . ' (kèm file Excel và biểu đồ) thành công.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Lỗi khi kích hoạt tạo báo cáo tự động: ' . $e->getMessage());
        }
    }

    // =========================================================================
    // CÁC HÀM TRỢ GIÚP NỘI BỘ (PRIVATE HELPER FUNCTIONS)
    // =========================================================================

    /**
     * Helper: Tạo hoặc tra cứu khách hàng và tích lũy điểm thưởng CRM
     */
    private function tichDiemCRM($sdt, $khachHangTen, $totalBill)
    {
        if (!$sdt) return null;

        // Tra cứu khách hàng theo số điện thoại
        $customer = KhachHang::where('sdt', $sdt)->first();
        if (!$customer) {
            // Nếu là khách hàng mới, tạo hồ sơ mới
            $customer = KhachHang::create([
                'ten' => $khachHangTen ?: 'Khách hàng vãng lai',
                'sdt' => $sdt,
                'diem_tich_luy' => 0
            ]);
        } else if ($khachHangTen) {
            // Nếu khách cũ có đổi tên mới thì cập nhật lại tên cho đúng
            $customer->update(['ten' => $khachHangTen]);
        }

        // Tích điểm thưởng: 10,000 VND hóa đơn cộng 1 điểm CRM
        $diemCong = 0;
        if ($totalBill > 0) {
            $diemCong = (int)($totalBill / 10000); 
            $customer->increment('diem_tich_luy', $diemCong);
        }

        return [
            'customer' => $customer,
            'diem_cong' => $diemCong
        ];
    }

    /**
     * Helper: Tạo truy vấn đơn hàng đã hoàn thành dựa trên bộ lọc thời gian chọn trên form
     */
    private function layTruyVanBaoCao(Request $request)
    {
        $filterType = $request->input('filter_type', 'today');
        $customDate = $request->input('custom_date');
        $customMonth = $request->input('custom_month');
        $customYear = $request->input('custom_year');

        // Khởi tạo Eloquent Query Builder trên bảng 'dat_mon'
        // Chỉ lấy các món ăn đã giao hoặc đã thanh toán thành công
        $query = DatMon::query()->whereIn('trang_thai', ['da_giao', 'da_thanh_toan']);

        // Áp dụng bộ lọc thời gian tương ứng
        if ($filterType === 'today') {
            $query->whereDate('created_at', now()->toDateString());
        } elseif ($filterType === 'yesterday') {
            $query->whereDate('created_at', now()->subDay()->toDateString());
        } elseif ($filterType === 'custom_date' && $customDate) {
            $query->whereDate('created_at', $customDate);
        } elseif ($filterType === 'month') {
            $monthVal = $customMonth ?: now()->format('Y-m');
            $parts = explode('-', $monthVal);
            if (count($parts) === 2) {
                $query->whereYear('created_at', $parts[0])->whereMonth('created_at', $parts[1]);
            }
        } elseif ($filterType === 'year') {
            $yearVal = $customYear ?: now()->format('Y');
            $query->whereYear('created_at', $yearVal);
        }

        return $query;
    }

    /**
     * Helper: Đọc danh sách các tệp sao lưu hiện có trong thư mục storage/app/backups
     */
    private function layDanhSachBackup()
    {
        $backupPath = storage_path('app/backups');
        $backupFiles = [];

        if (File::exists($backupPath)) {
            // Lấy tất cả tệp tin trong thư mục backup
            $files = File::files($backupPath);
            foreach ($files as $file) {
                $filename = $file->getFilename();
                // Loại bỏ thư mục ẩn hoặc thư mục con
                if ($filename !== '.' && $filename !== '..' && !is_dir($file->getRealPath())) {
                    $backupFiles[] = [
                        'name' => $filename,
                        'size' => $file->getSize(),
                        'created_at' => Carbon::createFromTimestamp($file->getMTime()),
                        'type' => str_ends_with($filename, '.zip') ? 'ZIP Archive' : 'SQL Database',
                    ];
                }
            }

            // Sắp xếp các tệp sao lưu theo thời gian tạo giảm dần (file mới nhất lên đầu)
            usort($backupFiles, function($a, $b) {
                return $b['created_at']->timestamp <=> $a['created_at']->timestamp;
            });
        }

        return $backupFiles;
    }
}
