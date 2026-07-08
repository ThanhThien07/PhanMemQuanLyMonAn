<?php

namespace App\Http\Controllers;

use App\Models\Ban;
use App\Models\BaoCaoQuanLy;
use App\Models\ChiTietTieuHaoDatMon;
use App\Models\DatMon;
use App\Models\LoHangNhap;
use App\Models\NguyenLieu;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * ReportController - Bộ điều khiển Báo cáo & Sao lưu dành cho Admin
 *
 * Tách từ BanController để tuân thủ Single Responsibility Principle (SRP).
 * Controller này chỉ phụ trách:
 *   - Dashboard báo cáo điều hành tổng hợp (7-Section Report)
 *   - Xuất Excel báo cáo doanh thu
 *   - Lưu trữ và xem lịch sử báo cáo ca làm việc
 *   - Kích hoạt báo cáo tự động (Tuần/Tháng)
 *   - Quản lý file sao lưu (Backup Management)
 *   - Tải tài liệu hướng dẫn (.doc)
 */
class ReportController extends Controller
{
    /**
     * 1. Dashboard báo cáo điều hành toàn diện của Quản trị viên (7-Section Report)
     *
     * GET /quan-ly
     */
    public function quanLy(Request $request)
    {
        // Lấy dữ liệu bàn ăn và nguyên liệu
        $tables = Ban::withActiveOrders()->get();
        $ingredients = NguyenLieu::orderBy('ten')->get();

        // Thống kê trạng thái bàn
        $totalTables = $tables->count();
        $occupiedTables = $tables->where('trang_thai', 'Co_khach')->count();
        $orderedTables = $tables->where('trang_thai', 'Da_goi')->count();
        $freeTables = $tables->where('trang_thai', 'Trong')->count();

        // Lọc nguyên liệu sắp hết theo ngưỡng từ config
        $lowStockIngredients = $ingredients->filter(
            fn ($item) => $item->so_luong_ton < config('restaurant.low_stock_threshold', 5)
        );

        // Lấy các đơn hoàn thành theo bộ lọc thời gian
        $completedOrders = $this->layTruyVanBaoCao($request)->get();

        // Tính các chỉ số thống kê — dùng ->total accessor của DatMon
        $totalRevenue = $completedOrders->sum(fn ($item) => $item->total);
        $estimatedProfit = $totalRevenue * config('restaurant.profit_margin', 0.40);
        $savedFromLoss = $totalRevenue * config('restaurant.saved_from_loss_rate', 0.15);
        $totalOrdersCount = $completedOrders->count();
        $totalPlatesServed = $completedOrders->sum('so_luong');
        $totalGuestsServed = $completedOrders->sum('so_luong_khach');

        // TOP 5 món ăn bán chạy nhất
        $bestSellers = $completedOrders->groupBy('ten_mon')
            ->map(fn ($group, $key) => [
                'ten_mon' => $key,
                'so_luong' => $group->sum('so_luong'),
                'doanh_thu' => $group->sum(fn ($o) => $o->total),
            ])
            ->sortByDesc('so_luong')
            ->take(5)
            ->values();

        // 6 đơn gần nhất để hiển thị luồng hoạt động
        $recentOrders = DatMon::with('ban')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        // Danh sách file backup
        $backupFiles = $this->layDanhSachBackup();

        // Giữ lại trạng thái filter của form
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
     * 2. Xuất báo cáo doanh thu chi tiết ra file Excel (MIME UTF-8, không cần thư viện ngoài)
     *
     * GET /quan-ly/bao-cao/export
     */
    public function exportReport(Request $request)
    {
        $orders = $this->layTruyVanBaoCao($request)->with('ban', 'khachHang')->orderBy('created_at', 'desc')->get();
        $filterType = $request->input('filter_type', 'today');
        $filename = "bao_cao_doanh_thu_{$filterType}_".date('Ymd_His').'.xls';

        $headers = [
            'Content-type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]><xml>
                <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                    <x:Name>Doanh Thu</x:Name>
                    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
            </xml><![endif]-->
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
                        <th>ID Đơn Đặt</th><th>Bàn Phục Vụ</th><th>Tên Món Ăn</th>
                        <th class="text-center">Số Lượng</th><th class="text-end">Đơn Giá (VND)</th>
                        <th class="text-end">Tổng Tiền (VND)</th><th>Khách Hàng CRM</th>
                        <th>Số Điện Thoại</th><th>Trạng Thái</th><th>Thời Gian Đặt</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($orders as $order) {
            $tenBan = htmlspecialchars($order->ban->ten ?? 'Bàn');
            $tenMon = htmlspecialchars($order->ten_mon);
            $khachHang = htmlspecialchars($order->khachHang->ten ?? 'Khách hàng vãng lai');
            $sdt = htmlspecialchars($order->khachHang->sdt ?? 'Không có');
            $trangThai = $order->trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Đã giao';
            $thoiGian = $order->created_at->format('H:i d/m/Y');

            $html .= "<tr>
                <td class='text-center'>{$order->id}</td>
                <td>{$tenBan}</td><td>{$tenMon}</td>
                <td class='text-center'>{$order->so_luong}</td>
                <td class='text-end'>".number_format($order->don_gia)."</td>
                <td class='text-end'>".number_format($order->total)."</td>
                <td>{$khachHang}</td><td>'{$sdt}</td>
                <td>{$trangThai}</td><td class='text-center'>{$thoiGian}</td>
            </tr>";
        }

        $html .= '</tbody></table></body></html>';

        return response($html, 200, $headers);
    }

    /**
     * 3. Lưu trữ báo cáo ca làm việc vào CSDL
     *
     * POST /quan-ly/bao-cao/luu
     */
    public function storeBaoCao(Request $request)
    {
        $ngayLap = $request->input('ngay_lap', now()->toDateString());
        $caLamViec = $request->input('ca_lam_viec', 'Sáng');
        $nguoiLap = Auth::user()->name ?? 'Ban điều hành';

        // Lấy tất cả đơn trong ngày từ CSDL với eager load ban
        $orders = DatMon::with('ban')->whereDate('created_at', $ngayLap)->get();
        $completedOrders = $orders->whereIn('trang_thai', ['da_giao', 'da_thanh_toan']);

        $tongSoHoaDon = $completedOrders->count();
        $tongLuongKhach = $completedOrders->sum('so_luong_khach');
        $tongDoanhThu = $completedOrders->sum(fn ($item) => $item->total);

        // Phân bổ doanh thu theo tỷ lệ từ config
        $qrRate = config('restaurant.payment_split.qr', 0.65);
        $doanhThuChuyenKhoan = (int) round($tongDoanhThu * $qrRate);
        $doanhThuTienMat = $tongDoanhThu - $doanhThuChuyenKhoan;

        // Thống kê theo từng món ăn
        $doanhThuTheoMon = $completedOrders->groupBy('ten_mon')
            ->map(fn ($group, $name) => [
                'ten_mon' => $name,
                'so_luong' => $group->sum('so_luong'),
                'doanh_thu' => $group->sum(fn ($item) => $item->total),
            ])
            ->values()
            ->toArray();

        // Thống kê theo từng bàn
        $doanhThuTheoKhuVuc = $completedOrders->groupBy(fn ($item) => $item->ban->ten ?? 'Khác')
            ->map(fn ($group, $banName) => [
                'ban' => $banName,
                'doanh_thu' => $group->sum(fn ($item) => $item->total),
            ])
            ->values()
            ->toArray();

        // Thống kê số lượng đơn
        $tongDonHang = $orders->count();
        $donHoanThanh = $completedOrders->count();
        $donHuy = $orders->where('trang_thai', 'huy')->count();
        $donDangXuLy = $orders->whereIn('trang_thai', ['dang_cho', 'dang_lam'])->count();

        // Món bán chạy nhất và ít nhất
        $sortedDishes = collect($doanhThuTheoMon)->sortByDesc('so_luong');
        $monBanChay = $sortedDishes->first()['ten_mon'] ?? 'N/A';
        $monBanIt = $sortedDishes->last()['ten_mon'] ?? 'N/A';
        $soLuongMonDaBan = collect($doanhThuTheoMon)->pluck('so_luong', 'ten_mon')->toArray();

        // Chụp lại tồn kho cuối ca
        $ingredients = NguyenLieu::all();
        $nguyenLieuTonCuoi = $ingredients->pluck('so_luong_ton', 'ten')->toArray();
        $lowThreshold = config('restaurant.low_stock_threshold', 5);
        $nguyenLieuSapHet = $ingredients->where('so_luong_ton', '<', $lowThreshold)->pluck('ten')->toArray();

        // Lịch sử nhập hàng trong ngày
        $nguyenLieuNhap = LoHangNhap::whereDate('ngay_nhap', $ngayLap)
            ->with('nguyenLieu')
            ->get()
            ->groupBy('nguyenLieu.ten')
            ->map(fn ($g) => $g->sum('so_luong_nhap').' '.($g->first()->nguyenLieu->don_vi ?? 'kg'))
            ->toArray();

        // Nguyên liệu đã dùng trong ngày
        $nguyenLieuDung = ChiTietTieuHaoDatMon::whereHas('datMon', fn ($q) => $q->whereDate('created_at', $ngayLap))
            ->with('nguyenLieu')
            ->get()
            ->groupBy('nguyenLieu.ten')
            ->map(fn ($g) => $g->sum('so_luong_tieu_hao').' '.($g->first()->nguyenLieu->don_vi ?? 'kg'))
            ->toArray();

        // Mã báo cáo duy nhất
        $maBaoCao = 'BC-'.date('Ymd', strtotime($ngayLap)).'-'.strtoupper(Str::random(4));

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
            'so_nhan_vien' => (int) $request->input('so_nhan_vien', 4),
            'so_gio_lam' => (float) $request->input('so_gio_lam', 8),
            'hieu_suat' => 'Tốt',
            'phan_hoi_khach' => $request->input('phan_hoi_khach') ?: 'Khách hài lòng dịch vụ',
            'su_co' => $request->input('su_co') ?: 'Không có sự cố lớn',
            'de_xuat' => $request->input('de_xuat') ?: 'Không có đề xuất thêm',
        ]);

        return redirect()->back()->with('success', "Đã lưu báo cáo {$maBaoCao} thành công!");
    }

    /**
     * 4. Xem danh sách lịch sử báo cáo ca trực
     *
     * GET /quan-ly/bao-cao/danh-sach
     */
    public function listBaoCao()
    {
        $reports = BaoCaoQuanLy::orderBy('created_at', 'desc')->get();

        return view('ban.danh_sach_bao_cao', compact('reports'));
    }

    /**
     * 5. Kích hoạt sinh báo cáo tự động (Tuần/Tháng)
     *
     * POST /quan-ly/bao-cao/trigger-auto
     */
    public function triggerAutoReport(Request $request)
    {
        $type = in_array($request->input('type'), ['weekly', 'monthly'])
            ? $request->input('type')
            : 'weekly';

        try {
            Artisan::call('report:generate', ['--type' => $type]);
            $typeName = $type === 'weekly' ? 'Tuần' : 'Tháng';

            return redirect()->back()->with('success', "Đã khởi tạo Báo Cáo {$typeName} thành công.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Lỗi khi kích hoạt tạo báo cáo: '.$e->getMessage());
        }
    }

    /**
     * 6. Tải tài liệu hướng dẫn sử dụng phần mềm dưới dạng Word (.doc)
     *
     * GET /tai-lieu/tai-ve
     */
    public function downloadDocx()
    {
        $headers = [
            'Content-type' => 'application/vnd.ms-word',
            'Content-Disposition' => 'attachment;Filename=tai_lieu_chuc_nang.doc',
        ];

        $content = '<html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
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
            <p><strong>Ngày lập:</strong> '.date('d/m/Y').'</p>
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
     * 7. Tải file sao lưu (.sql hoặc .zip)
     *
     * GET /quan-ly/backup/download/{filename}
     */
    public function downloadBackup(string $filename)
    {
        // basename() chặn lỗ hổng Directory Traversal
        $path = storage_path('app/backups/'.basename($filename));

        if (! File::exists($path)) {
            return redirect()->back()->with('error', 'Tệp sao lưu không tồn tại trên hệ thống.');
        }

        return response()->download($path);
    }

    /**
     * 8. Xóa file sao lưu khỏi đĩa máy chủ
     *
     * DELETE /quan-ly/backup/delete/{filename}
     */
    public function deleteBackup(string $filename)
    {
        $path = storage_path('app/backups/'.basename($filename));

        if (File::exists($path)) {
            File::delete($path);

            return redirect()->back()->with('success', 'Xóa tệp sao lưu thành công.');
        }

        return redirect()->back()->with('error', 'Không tìm thấy tệp sao lưu để thực hiện xóa.');
    }

    /**
     * 9. Kích hoạt sao lưu cơ sở dữ liệu MySQL
     *
     * POST /quan-ly/backup/trigger-db
     */
    public function triggerDbBackup()
    {
        try {
            Artisan::call('db:backup');

            return redirect()->back()->with('success', 'Đã sao lưu cơ sở dữ liệu MySQL thành công.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Lỗi khi sao lưu database: '.$e->getMessage());
        }
    }

    /**
     * 10. Kích hoạt sao lưu tệp tin hệ thống (ZIP)
     *
     * POST /quan-ly/backup/trigger-system
     */
    public function triggerSystemBackup()
    {
        try {
            Artisan::call('system:backup');

            return redirect()->back()->with('success', 'Đã sao lưu tệp tin hệ thống (ZIP) thành công.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Lỗi khi sao lưu hệ thống: '.$e->getMessage());
        }
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Helper: Tạo query đơn hàng đã hoàn thành theo bộ lọc thời gian từ form
     */
    private function layTruyVanBaoCao(Request $request)
    {
        $filterType = $request->input('filter_type', 'today');
        $customDate = $request->input('custom_date');
        $customMonth = $request->input('custom_month');
        $customYear = $request->input('custom_year');

        // Dùng scope completed() từ DatMon model thay vì whereIn dài dòng
        $query = DatMon::completed();

        match ($filterType) {
            'today' => $query->whereDate('created_at', now()->toDateString()),
            'yesterday' => $query->whereDate('created_at', now()->subDay()->toDateString()),
            'custom_date' => $customDate ? $query->whereDate('created_at', $customDate) : null,
            'month' => $this->applyMonthFilter($query, $customMonth),
            'year' => $query->whereYear('created_at', $customYear ?: now()->format('Y')),
            default => $query->whereDate('created_at', now()->toDateString()),
        };

        return $query;
    }

    /**
     * Helper: Áp dụng bộ lọc theo tháng từ chuỗi 'Y-m'
     */
    private function applyMonthFilter($query, ?string $customMonth): void
    {
        $monthVal = $customMonth ?: now()->format('Y-m');
        $parts = explode('-', $monthVal);
        if (count($parts) === 2) {
            $query->whereYear('created_at', $parts[0])->whereMonth('created_at', $parts[1]);
        }
    }

    /**
     * Helper: Đọc danh sách file sao lưu từ storage/app/backups, sắp xếp mới nhất trước
     */
    private function layDanhSachBackup(): array
    {
        $backupPath = storage_path('app/backups');

        if (! File::exists($backupPath)) {
            return [];
        }

        return collect(File::files($backupPath))
            ->map(fn ($file) => [
                'name' => $file->getFilename(),
                'size' => $file->getSize(),
                'created_at' => Carbon::createFromTimestamp($file->getMTime()),
                'type' => str_ends_with($file->getFilename(), '.zip') ? 'ZIP Archive' : 'SQL Database',
            ])
            ->sortByDesc(fn ($f) => $f['created_at']->timestamp)
            ->values()
            ->toArray();
    }
}
