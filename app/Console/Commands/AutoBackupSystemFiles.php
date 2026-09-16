<?php

namespace App\Console\Commands;

use App\Models\Ban;
use App\Models\DatMon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class AutoBackupSystemFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sao lưu file hệ thống (hình ảnh món ăn, mã QR bàn ăn, báo cáo xuất ra, tài liệu hướng dẫn)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Bắt đầu sao lưu tệp tin hệ thống...');

        // Định nghĩa các thư mục lưu trữ tạm thời trong storage/app/public trước khi nén
        $publicPath = storage_path('app/public');
        $imgDir = $publicPath.'/mon_an';
        $qrDir = $publicPath.'/qrcodes';
        $reportDir = $publicPath.'/reports';
        $docDir = $publicPath.'/documents';

        // Tạo thư mục nếu chưa tồn tại
        File::ensureDirectoryExists($imgDir);
        File::ensureDirectoryExists($qrDir);
        File::ensureDirectoryExists($reportDir);
        File::ensureDirectoryExists($docDir);

        // Làm sạch thư mục tạm trước khi thực hiện để tránh tích tụ rác và làm phình kích thước file ZIP backup qua các ngày
        File::cleanDirectory($imgDir);
        File::cleanDirectory($qrDir);
        File::cleanDirectory($reportDir);
        File::cleanDirectory($docDir);

        // 1. Sao lưu hình ảnh món ăn: Sao chép các tệp từ public/assets/img sang storage/app/public/mon_an
        $this->info('1. Sao lưu hình ảnh món ăn...');
        $sourceImgDir = public_path('assets/img');
        if (File::exists($sourceImgDir)) {
            $files = File::files($sourceImgDir);
            foreach ($files as $file) {
                if (in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                    File::copy($file->getRealPath(), $imgDir.'/'.$file->getFilename());
                }
            }
        }

        // 2. Tạo và sao lưu mã QR bàn ăn: Tải mã QR từ API của tất cả các bàn ăn hiện tại
        $this->info('2. Sao lưu mã QR bàn ăn...');
        $tables = Ban::all();
        foreach ($tables as $ban) {
            $qrUrl = route('dat_mon.qr_order', $ban->id);
            $apiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data='.urlencode($qrUrl);

            try {
                // Tải ảnh QR code bằng Http facade với timeout 5 giây và bỏ qua kiểm tra chứng chỉ SSL (cho môi trường local/Laragon)
                $response = Http::withoutVerifying()->timeout(5)->get($apiUrl);
                if ($response->successful()) {
                    File::put($qrDir."/ban_{$ban->id}_{$ban->ten}.png", $response->body());
                } else {
                    $this->warn("Không thể tải QR cho {$ban->ten}: HTTP ".$response->status());
                }
            } catch (\Exception $e) {
                $this->warn("Không thể tải QR cho {$ban->ten}: ".$e->getMessage());
            }
        }

        // 3. Tạo và sao lưu tài liệu hướng dẫn chức năng (Word)
        $this->info('3. Sao lưu tài liệu hướng dẫn...');
        $docContent = $this->generateDocumentationHtml();
        File::put($docDir.'/tai_lieu_chuc_nang.doc', $docContent);

        // 4. Tạo và sao lưu báo cáo doanh thu CSV ngày hôm nay
        $this->info('4. Sao lưu báo cáo doanh thu xuất ra...');
        $csvContent = $this->generateRevenueCsv();
        File::put($reportDir.'/bao_cao_doanh_thu_'.now()->format('Ymd').'.csv', $csvContent);

        // 5. Nén toàn bộ tệp tin vào tệp ZIP lưu trữ trong storage/app/backups
        $this->info('5. Tiến hành nén dữ liệu hệ thống...');
        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir);

        $zipFilename = 'backup-files-'.now()->format('Y-m-d_H-i-s').'.zip';
        $zipPath = $backupDir.'/'.$zipFilename;

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $this->addFolderToZip($imgDir, 'mon_an', $zip);
            $this->addFolderToZip($qrDir, 'qrcodes', $zip);
            $this->addFolderToZip($docDir, 'documents', $zip);
            $this->addFolderToZip($reportDir, 'reports', $zip);
            $zip->close();

            // Xóa sạch các thư mục tạm sau khi nén thành công để không chiếm dụng bộ nhớ ổ đĩa vô ích
            File::cleanDirectory($imgDir);
            File::cleanDirectory($qrDir);
            File::cleanDirectory($reportDir);
            File::cleanDirectory($docDir);

            $this->info("Sao lưu file hệ thống thành công! Tệp được lưu tại: storage/app/backups/{$zipFilename}");
        } else {
            $this->error('Không thể tạo tệp nén ZIP sao lưu hệ thống.');

            return 1;
        }

        return 0;
    }

    /**
     * Thêm tất cả tệp trong một thư mục vào ZIP
     */
    private function addFolderToZip($folder, $zipSubDir, $zip)
    {
        if (File::exists($folder)) {
            $files = File::files($folder);
            foreach ($files as $file) {
                $zip->addFile($file->getRealPath(), $zipSubDir.'/'.$file->getFilename());
            }
        }
    }

    /**
     * Sinh HTML tài liệu hướng dẫn tương ứng với chức năng tải về của hệ thống
     */
    private function generateDocumentationHtml()
    {
        return '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <title>Tài liệu Hướng dẫn Chức năng Hệ thống M&S</title>
        </head>
        <body>
            <h1>HƯỚNG DẪN CHỨC NĂNG HỆ THỐNG QUẢN LÝ NHÀ HÀNG M&S</h1>
            <p><strong>Ngày lập:</strong> '.date('d/m/Y').'</p>
            <p><strong>Phiên bản:</strong> 2.0 (Bản Tiếng Việt chính thức)</p>
            
            <h2>1. MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ (Authentication)</h2>
            <p>Cho phép đăng nhập với 3 vai trò: admin, nhan_vien, bep.</p>
            
            <h2>2. SƠ ĐỒ BÀN ĂN & IN MÃ QR</h2>
            <p>Hiển thị danh sách bàn và in mã QR để khách gọi món trực tuyến.</p>
            
            <h2>3. HỆ THỐNG GỌI MÓN BẰNG QR</h2>
            <p>Khách quét mã QR tại bàn gọi món, chọn độ ưu tiên và theo dõi tiến độ bếp real-time.</p>
            
            <h2>4. MÀN HÌNH NHÀ BẾP KDS</h2>
            <p>Đồng bộ món ăn cần làm thời gian thực, tự động trừ kho nguyên liệu FEFO.</p>
        </body>
        </html>';
    }

    /**
     * Sinh nội dung CSV báo cáo doanh thu hôm nay
     */
    private function generateRevenueCsv()
    {
        $orders = DatMon::with('ban', 'khachHang')
            ->whereDate('created_at', now()->toDateString())
            ->whereIn('trang_thai', ['da_giao', 'da_thanh_toan'])
            ->get();

        $columns = ['ID Don Dat', 'Ban Phuc Vu', 'Ten Mon An', 'So Luong', 'Don Gia (VND)', 'Tong Tien (VND)', 'Khach Hang CRM', 'So Dien Thoai', 'Trang Thai', 'Thoi Gian Dat'];

        $output = "\xEF\xBB\xBF"; // UTF-8 BOM
        $output .= implode(',', $columns)."\n";

        foreach ($orders as $order) {
            $tongTien = $order->so_luong * $order->don_gia;
            $tenBan = $order->ban->ten ?? 'Không rõ';
            $tenKhach = $order->khachHang->ten ?? 'Khách vãng lai';
            $sdt = $order->khachHang->sdt ?? '';

            $row = [
                $order->id,
                $tenBan,
                $order->ten_mon,
                $order->so_luong,
                $order->don_gia,
                $tongTien,
                $tenKhach,
                $sdt,
                $order->trang_thai,
                $order->created_at->toDateTimeString(),
            ];

            // Clean csv value
            $escapedRow = array_map(function ($val) {
                return '"'.str_replace('"', '""', $val).'"';
            }, $row);

            $output .= implode(',', $escapedRow)."\n";
        }

        return $output;
    }
}
