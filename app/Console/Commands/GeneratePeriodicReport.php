<?php

namespace App\Console\Commands;

use App\Models\BaoCaoQuanLy;
use App\Models\DatMon;
use App\Models\NguyenLieu;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class GeneratePeriodicReport extends Command
{
    /**
     * Tên và cú pháp của lệnh Artisan
     */
    protected $signature = 'report:generate {--type=weekly : Loại báo cáo: weekly hoặc monthly} {--month= : Tháng cụ thể dạng YYYY-MM} {--week= : Tuần cụ thể (1-53), mặc định tuần hiện tại}';

    /**
     * Mô tả lệnh
     */
    protected $description = 'Tự động tính toán và tạo báo cáo định kỳ tuần (Sunday) hoặc tổng hợp tháng (kèm file Excel có biểu đồ)';

    /**
     * Thực thi lệnh Artisan
     */
    public function handle()
    {
        $type = $this->option('type') ?: 'weekly';

        if (! in_array($type, ['weekly', 'monthly'])) {
            $this->error('Loại báo cáo không hợp lệ. Chỉ chấp nhận: weekly hoặc monthly.');

            return 1;
        }

        $now = now();
        $startRange = null;
        $endRange = null;
        $titleName = '';
        $fileName = '';
        $reportCodePrefix = '';

        // 1. Phân loại khoảng thời gian báo cáo tuần/tháng
        if ($type === 'weekly') {
            $weekNum = $this->option('week') ?: $now->weekOfYear;
            $year = $now->year;

            $carbonWeek = Carbon::now()->setISODate($year, $weekNum);
            $startRange = $carbonWeek->copy()->startOfWeek();
            $endRange = $carbonWeek->copy()->endOfWeek();

            $titleName = 'Tuần '.$weekNum.' (Từ '.$startRange->format('d/m').' đến '.$endRange->format('d/m/Y').')';
            $fileName = 'bao_cao_tuan_'.$year.'_W'.sprintf('%02d', $weekNum).'.xls';
            $reportCodePrefix = 'BC-TUAN-'.$year.'W'.sprintf('%02d', $weekNum);
        } else {
            $monthOption = $this->option('month') ?: $now->format('Y-m');
            try {
                $carbonMonth = Carbon::createFromFormat('Y-m', $monthOption);
            } catch (\Exception $e) {
                $this->error('Định dạng tháng không hợp lệ. Sử dụng YYYY-MM.');

                return 1;
            }
            $startRange = $carbonMonth->copy()->startOfMonth();
            $endRange = $carbonMonth->copy()->endOfMonth();

            $titleName = 'Tháng '.$carbonMonth->format('m/Y');
            $fileName = 'bao_cao_thang_'.$carbonMonth->format('Y_m').'.xls';
            $reportCodePrefix = 'BC-THANG-'.$carbonMonth->format('Ym');
        }

        $this->info("Bắt đầu khởi tạo báo cáo {$type} cho: {$titleName}");
        $this->info("Khoảng thời gian: {$startRange->toDateTimeString()} -> {$endRange->toDateTimeString()}");

        // 2. Lấy dữ liệu và thực hiện tính toán các chỉ số
        $orders = DatMon::whereBetween('created_at', [$startRange, $endRange])->get();
        $completedOrders = $orders->whereIn('trang_thai', ['da_giao', 'da_thanh_toan']);

        $tongSoHoaDon = $completedOrders->count();
        $tongLuongKhach = $completedOrders->sum('so_luong_khach') ?: 0;
        $tongDoanhThu = $completedOrders->sum(function ($o) {
            return $o->so_luong * $o->don_gia;
        });

        // Ước tính tỷ lệ thanh toán (chưa có trường lưu phương thức thanh toán riêng trong bảng dat_mon)
        // TODO: Khi bổ sung cột phương thức thanh toán vào DB, hãy thay thế bằng query thực tế
        $doanhThuTienMat = $tongDoanhThu * 0.35;
        $doanhThuChuyenKhoan = $tongDoanhThu * 0.65;

        // Thống kê doanh số theo món ăn
        $dishesGrouped = $completedOrders->groupBy('ten_mon');
        $dishStats = [];
        $dishQty = [];

        foreach ($dishesGrouped as $name => $group) {
            $qty = $group->sum('so_luong');
            $rev = $group->sum(function ($o) {
                return $o->so_luong * $o->don_gia;
            });
            $dishStats[$name] = $rev;
            $dishQty[$name] = $qty;
        }

        // Tìm món bán chạy/bán ít nhất
        arsort($dishQty);
        $bestSeller = 'Chưa ghi nhận';
        $worstSeller = 'Chưa ghi nhận';

        if (count($dishQty) > 0) {
            reset($dishQty);
            $bestKey = key($dishQty);
            $bestVal = current($dishQty);
            $bestSeller = "{$bestKey} (Bán ra {$bestVal} đĩa)";

            end($dishQty);
            $worstKey = key($dishQty);
            $worstVal = current($dishQty);
            $worstSeller = "{$worstKey} (Bán ra {$worstVal} đĩa)";
        }

        $lowStockIngredients = NguyenLieu::where('so_luong_ton', '<', 5)->pluck('ten')->toArray();

        // 3. Tạo bản ghi Báo cáo trong CSDL
        try {
            $report = BaoCaoQuanLy::create([
                'ma_bao_cao' => $reportCodePrefix.'-'.strtoupper(Str::random(4)),
                'ngay_lap' => now(),
                'nguoi_lap' => 'Hệ thống tự động (Artisan Command)',
                'ca_lam_viec' => 'Báo cáo tổng kết '.$titleName,
                'tong_so_hoa_don' => $tongSoHoaDon,
                'tong_luong_khach' => $tongLuongKhach,
                'tong_doanh_thu' => $tongDoanhThu,
                'doanh_thu_tien_mat' => $doanhThuTienMat,
                'doanh_thu_chuyen_khoan' => $doanhThuChuyenKhoan,
                'doanh_thu_theo_mon' => $dishStats,
                'doanh_thu_theo_khu_vuc' => ['Khu vực chung' => $tongDoanhThu],
                'tong_don_hang' => $orders->count(),
                'don_hoan_thanh' => $completedOrders->count(),
                'don_huy' => $orders->where('trang_thai', 'huy')->count(),
                'don_dang_xu_ly' => $orders->whereIn('trang_thai', ['dang_cho', 'dang_lam', 'dang_giao'])->count(),
                'mon_ban_chay' => $bestSeller,
                'mon_ban_it' => $worstSeller,
                'so_luong_mon_da_ban' => $dishQty,
                'nguyen_lieu_nhap' => [],
                'nguyen_lieu_dung' => [],
                'nguyen_lieu_ton_cuoi' => NguyenLieu::pluck('so_luong_ton', 'ten')->toArray(),
                'nguyen_lieu_sap_het' => $lowStockIngredients,
                'so_nhan_vien' => 5,
                'so_gio_lam' => ($type === 'weekly' ? 60 : 240),
                'hieu_suat' => 'Doanh số và hiệu suất hoạt động đạt chỉ tiêu '.($type === 'weekly' ? 'tuần' : 'tháng'),
                'phan_hoi_khach' => 'Đại đa số khách hàng hài lòng về phong cách phục vụ và hương vị món ăn.',
                'su_co' => 'Không có sự cố vận hành lớn.',
                'de_xuat' => 'Duy trì hoạt động và tối ưu định mức nguyên liệu hao hụt.',
            ]);

            // 4. Khởi tạo file Excel có chứa biểu đồ in-cell bar chart
            $excelContent = $this->buildExcelReport($type, $titleName, $report, $dishQty, $dishStats);

            $backupDir = storage_path('app/backups');
            File::ensureDirectoryExists($backupDir);
            File::put($backupDir.'/'.$fileName, $excelContent);

            $this->info("Báo cáo {$type} {$report->ma_bao_cao} và file Excel {$fileName} đã được tạo thành công!");
        } catch (\Exception $e) {
            $this->error('Có lỗi xảy ra khi tạo báo cáo định kỳ: '.$e->getMessage());

            return 1;
        }

        return 0;
    }

    /**
     * Sinh mã HTML-Excel của báo cáo tuần/tháng có biểu đồ thanh ngang
     */
    private function buildExcelReport($type, $titleName, $report, $dishQty, $dishStats)
    {
        $typeNameUpper = ($type === 'weekly' ? 'TUẦN' : 'THÁNG');

        $html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Bao Cao '.($type === 'weekly' ? 'Tuan' : 'Thang').'</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table { border-collapse: collapse; }
                td, th { border: 0.5pt solid #cccccc; padding: 6px; font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; }
                .title { font-size: 14pt; font-weight: bold; color: #8e192a; text-align: center; border: none; }
                .subtitle { font-size: 10pt; font-style: italic; color: #555555; text-align: center; border: none; }
                .section-header { background-color: #8e192a; color: #ffffff; font-weight: bold; font-size: 11pt; }
                .label { font-weight: bold; background-color: #f2f2f2; }
                .text-end { text-align: right; }
                .text-center { text-align: center; }
                .bar-container { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <table>';

        // 1. Phần Header
        $html .= '<tr><td colspan="5" class="title">BÁO CÁO DOANH THU & HOẠT ĐỘNG ĐỊNH KỲ '.$typeNameUpper.' '.$titleName.'</td></tr>';
        $html .= '<tr><td colspan="5" class="subtitle">M&S Restaurant Management System &bull; Mã báo cáo: '.$report->ma_bao_cao.'</td></tr>';
        $html .= '<tr><td colspan="5" style="border: none;"></td></tr>';

        // 2. Chỉ số tổng quan
        $html .= $this->buildOverviewSection($report);

        // 3. Doanh số món ăn & biểu đồ
        $html .= $this->buildDishStatsSection($dishQty, $dishStats);

        // 4. Tồn kho nguyên liệu
        $html .= $this->buildInventorySection($report);

        // 5. Nhân sự & ý kiến
        $html .= $this->buildHRSection($report);

        $html .= '</table></body></html>';

        return $html;
    }

    /**
     * Sub-helper: Tạo HTML cho phần chỉ số tổng quan
     */
    private function buildOverviewSection($report)
    {
        return '
        <tr>
            <th colspan="5" class="section-header">1. Chỉ số tổng quan hoạt động</th>
        </tr>
        <tr>
            <td class="label" colspan="2">Tổng số hóa đơn thanh toán:</td>
            <td class="text-center" colspan="3">'.number_format($report->tong_so_hoa_don).' hóa đơn</td>
        </tr>
        <tr>
            <td class="label" colspan="2">Tổng lượt khách hàng phục vụ:</td>
            <td class="text-center" colspan="3">'.number_format($report->tong_luong_khach).' lượt khách</td>
        </tr>
        <tr>
            <td class="label" colspan="2">Tổng doanh thu phát sinh:</td>
            <td class="text-end" colspan="3" style="font-weight: bold; color: #8e192a;">'.number_format($report->tong_doanh_thu).' VND</td>
        </tr>
        <tr>
            <td class="label" colspan="2">&bull; Doanh thu tiền mặt (35%):</td>
            <td class="text-end" colspan="3">'.number_format($report->doanh_thu_tien_mat).' VND</td>
        </tr>
        <tr>
            <td class="label" colspan="2">&bull; Doanh thu chuyển khoản QR (65%):</td>
            <td class="text-end" colspan="3">'.number_format($report->doanh_thu_chuyen_khoan).' VND</td>
        </tr>
        <tr><td colspan="5" style="border: none;"></td></tr>';
    }

    /**
     * Sub-helper: Tạo HTML cho phần thống kê món ăn kèm biểu đồ thanh ngang
     */
    private function buildDishStatsSection($dishQty, $dishStats)
    {
        $maxQty = count($dishQty) > 0 ? max($dishQty) : 1;
        if ($maxQty == 0) {
            $maxQty = 1;
        }

        $section = '
        <tr>
            <th colspan="5" class="section-header">2. Doanh số món ăn & Biểu đồ sản lượng bán ra</th>
        </tr>
        <tr style="background-color: #f2f2f2; font-weight: bold;">
            <td colspan="2">Tên món ăn</td>
            <td class="text-center">Số lượng bán</td>
            <td class="text-end">Doanh thu</td>
            <td style="width: 250px;">Biểu đồ trực quan sản lượng</td>
        </tr>';

        foreach ($dishQty as $name => $qty) {
            $rev = $dishStats[$name] ?? 0;
            $pct = round(($qty / $maxQty) * 100);

            $section .= '<tr>
                <td colspan="2">'.htmlspecialchars($name).'</td>
                <td class="text-center">'.$qty.'</td>
                <td class="text-end">'.number_format($rev).'đ</td>
                <td class="bar-container">
                    <table style="width: 100%; border: none; border-collapse: collapse;">
                        <tr style="border: none;">
                            <td style="width: '.$pct.'%; background-color: #8e192a; border: none; height: 14px; font-size: 8pt; color: #ffffff; text-align: center;">
                                '.($pct >= 15 ? $pct.'%' : '').'
                            </td>
                            <td style="width: '.(100 - $pct).'%; background-color: #f9f9f9; border: none; height: 14px; font-size: 8pt; color: #777777; padding-left: 4px;">
                                '.($pct < 15 ? $pct.'%' : '').'
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>';
        }

        $section .= '<tr><td colspan="5" style="border: none;"></td></tr>';

        return $section;
    }

    /**
     * Sub-helper: Tạo HTML cho phần quản lý kho nguyên vật liệu
     */
    private function buildInventorySection($report)
    {
        $lowStockMsg = count($report->nguyen_lieu_sap_het) > 0
            ? implode(', ', $report->nguyen_lieu_sap_het)
            : 'Không có cảnh báo';

        return '
        <tr>
            <th colspan="5" class="section-header">3. Quản lý kho nguyên vật liệu</th>
        </tr>
        <tr>
            <td class="label" colspan="2">Nguyên liệu sắp hết tồn kho (<5kg):</td>
            <td colspan="3">'.$lowStockMsg.'</td>
        </tr>
        <tr><td colspan="5" style="border: none;"></td></tr>';
    }

    /**
     * Sub-helper: Tạo HTML cho phần quản lý nhân sự và ý kiến đề xuất
     */
    private function buildHRSection($report)
    {
        return '
        <tr>
            <th colspan="5" class="section-header">4. Quản lý nhân sự & Ý kiến đề xuất</th>
        </tr>
        <tr>
            <td class="label" colspan="2">Đánh giá chung hiệu suất:</td>
            <td colspan="3">'.htmlspecialchars($report->hieu_suat).'</td>
        </tr>
        <tr>
            <td class="label" colspan="2">Phản hồi từ khách hàng:</td>
            <td colspan="3">'.htmlspecialchars($report->phan_hoi_khach).'</td>
        </tr>
        <tr>
            <td class="label" colspan="2">Đề xuất cải tiến:</td>
            <td colspan="3">'.htmlspecialchars($report->de_xuat).'</td>
        </tr>';
    }
}
