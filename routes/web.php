<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BanController;
use App\Http\Controllers\DatMonController;
use App\Http\Controllers\NguyenLieuController;
use App\Http\Controllers\MonAnController;
use App\Http\Controllers\NhanVienController;
use App\Http\Controllers\KhachHangController;
use App\Http\Controllers\NhaCungCapController;

/**
 * File routes/web.php - Khai báo các đường dẫn URL (Routes) của ứng dụng
 * 
 * Đây là nơi tiếp nhận mọi yêu cầu HTTP từ trình duyệt gửi lên, khớp đường dẫn URL 
 * và chuyển tiếp quyền xử lý sang phương thức (Action) tương ứng trong Controller.
 * File này được chia làm các nhóm định tuyến công cộng và nhóm định tuyến bảo mật cần đăng nhập/phân quyền.
 */

// =========================================================================
// 1. CÁC ROUTE CÔNG CỘNG (Dành cho Khách hàng vãng lai & các API không cần đăng nhập)
// =========================================================================

// --- Hệ thống Đăng nhập / Đăng ký / Đăng xuất ---
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');      // Trang hiển thị form đăng nhập
Route::post('/login', [AuthController::class, 'login']);                         // Xử lý khi nhấn nút Đăng nhập (gửi POST)
Route::get('/register', [AuthController::class, 'showRegister'])->name('register'); // Trang hiển thị form đăng ký
Route::post('/register', [AuthController::class, 'register']);                   // Xử lý tạo tài khoản mới (gửi POST)
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');       // Đăng xuất tài khoản khỏi hệ thống

// --- Nghiệp vụ Khách hàng quét mã QR tại bàn để gọi món tự động ---
// {ban_id} là tham số động (URL Parameter), đại diện cho số thứ tự của bàn ăn quét mã QR
Route::get('/qr-order/{ban_id}', [DatMonController::class, 'qrOrder'])->name('dat_mon.qr_order');
Route::post('/qr-order/{ban_id}/order', [DatMonController::class, 'placeOrder'])->name('dat_mon.place_order');
Route::post('/qr-order/{ban_id}/cap-nhat-so-khach', [DatMonController::class, 'updateGuestCount'])->name('dat_mon.update_guest_count');

// --- Tiện ích gọi thanh toán từ bàn ăn ---
Route::post('/ban/yeu-cau-thanh-toan/{id}', [BanController::class, 'requestCheckout'])->name('ban.request_checkout');
Route::post('/ban/xac-nhan-chuyen-khoan/{id}', [BanController::class, 'confirmQrPaid'])->name('ban.confirm_qr_paid');

// --- Các API công cộng hỗ trợ cập nhật dữ liệu tự động cho trình duyệt của khách hàng ---
Route::get('/api/realtime-updates', [DatMonController::class, 'getRealtimeUpdates'])->name('api.realtime_updates');
Route::get('/api/qr-ordered-grid-html/{ban_id}', [DatMonController::class, 'qrOrderedGridHtml'])->name('api.qr_ordered_grid_html');


// =========================================================================
// 2. CÁC ROUTE YÊU CẦU ĐĂNG NHẬP (Sử dụng Middleware 'auth')
// =========================================================================
Route::middleware(['auth'])->group(function () {

    // Route mặc định chuyển hướng người dùng khi vào trang chủ ứng dụng (/)
    Route::get('/', [BanController::class, 'index'])->name('home');

    // Các API trả về mã HTML động để làm mới danh sách (Grid) trên màn hình Nhân viên và Bếp mà không cần tải lại toàn bộ trang
    Route::get('/api/bep-grid-html', [DatMonController::class, 'bepGridHtml'])->name('api.bep_grid_html');
    Route::get('/api/nhan-vien-grid-html', [DatMonController::class, 'nhanVienGridHtml'])->name('api.nhan_vien_grid_html');

    // Tải tài liệu hướng dẫn Word (.doc) dành cho mọi thành viên đã đăng nhập hệ thống
    Route::get('/tai-lieu/tai-ve', [BanController::class, 'downloadDocx'])->name('quan_ly.download_docx');

    // ---------------------------------------------------------------------
    // --- VAI TRÒ 1: BAN ĐIỀU HÀNH (ADMIN) ---
    // ---------------------------------------------------------------------
    Route::middleware(['role:admin'])->group(function () {
        
        // Dashboard tổng hợp doanh thu, biểu đồ TOP món ăn và cảnh báo kho nguyên vật liệu
        Route::get('/quan-ly', [BanController::class, 'quanLy'])->name('quan_ly.index');
        
        // Xuất file Excel báo cáo doanh số tương thích UTF-8
        Route::get('/quan-ly/bao-cao/export', [BanController::class, 'exportReport'])->name('quan_ly.export_report');
        
        // Lưu trữ báo cáo ca trực và Xem lịch sử báo cáo ngày
        Route::post('/quan-ly/bao-cao/luu', [BanController::class, 'storeBaoCao'])->name('quan_ly.store_bao_cao');
        Route::get('/quan-ly/bao-cao/danh-sach', [BanController::class, 'listBaoCao'])->name('quan_ly.list_bao_cao');
        
        // Lệnh kích hoạt sinh báo cáo tự động (Tuần/Tháng) bằng Artisan console
        Route::post('/quan-ly/bao-cao/trigger-auto', [BanController::class, 'triggerAutoReport'])->name('quan_ly.report_trigger_auto');

        // Công cụ quản lý Sao lưu (Backup Management) hệ thống: Tải xuống hoặc Xóa file zip/sql
        Route::post('/quan-ly/backup/trigger-db', [BanController::class, 'triggerDbBackup'])->name('quan_ly.backup_trigger_db');
        Route::post('/quan-ly/backup/trigger-system', [BanController::class, 'triggerSystemBackup'])->name('quan_ly.backup_trigger_system');
        Route::get('/quan-ly/backup/download/{filename}', [BanController::class, 'downloadBackup'])->name('quan_ly.backup_download');
        Route::delete('/quan-ly/backup/delete/{filename}', [BanController::class, 'deleteBackup'])->name('quan_ly.backup_delete');

        // Quản lý Thực đơn Món ăn (Sử dụng Resource Route tự động định nghĩa 7 hàm CRUD chuẩn)
        Route::resource('/quan-ly/mon-an', MonAnController::class)->names([
            'index' => 'mon_an.index',
            'store' => 'mon_an.store',
            'update' => 'mon_an.update',
            'destroy' => 'mon_an.destroy',
        ]);

        // Thêm / Sửa / Xóa Danh mục loại món ăn (Loại món ăn)
        Route::post('/quan-ly/loai-mon/them', [MonAnController::class, 'storeCategory'])->name('loai_mon.store');
        Route::put('/quan-ly/loai-mon/sua/{id}', [MonAnController::class, 'updateCategory'])->name('loai_mon.update');
        Route::delete('/quan-ly/loai-mon/xoa/{id}', [MonAnController::class, 'destroyCategory'])->name('loai_mon.destroy');

        // Quản lý Nhân sự & phân quyền vai trò tài khoản trong nhà hàng
        Route::resource('/quan-ly/nhan-vien-quan-ly', NhanVienController::class)->names([
            'index' => 'nhan_vien_quan_ly.index',
            'store' => 'nhan_vien_quan_ly.store',
            'update' => 'nhan_vien_quan_ly.update',
            'destroy' => 'nhan_vien_quan_ly.destroy',
        ]);

        // Danh sách các Nhà cung cấp nguyên vật liệu nhập khẩu
        Route::resource('/quan-ly/nha-cung-cap', NhaCungCapController::class)->names([
            'index' => 'nha_cung_cap.index',
            'store' => 'nha_cung_cap.store',
            'update' => 'nha_cung_cap.update',
            'destroy' => 'nha_cung_cap.destroy',
        ]);
    });


    // ---------------------------------------------------------------------
    // --- VAI TRÒ 2: ADMIN & NHÂN VIÊN PHỤC VỤ (ADMIN, NHAN_VIEN) ---
    // ---------------------------------------------------------------------
    Route::middleware(['role:admin,nhan_vien'])->group(function () {
        
        // Trang sơ đồ bàn ăn và giao diện thu ngân chính
        Route::get('/ban', [BanController::class, 'index'])->name('ban.index');
        Route::post('/ban/them', [BanController::class, 'store'])->name('ban.store');
        
        // Thanh toán toàn bộ và thanh toán tách hóa đơn (Split Bill)
        Route::post('/ban/thanh-toan/{id}', [BanController::class, 'checkout'])->name('ban.checkout');
        Route::post('/ban/tach-thanh-toan/{id}', [BanController::class, 'splitCheckout'])->name('ban.split_checkout');
        
        // Tra cứu đơn gọi món chi tiết và giao diện phục vụ nhanh của nhân viên
        Route::get('/dat-mon', [DatMonController::class, 'index'])->name('dat_mon.index');
        Route::get('/nhan-vien', [DatMonController::class, 'nhanVien'])->name('nhan_vien.index');
        
        // Hủy đĩa gọi món ăn của khách (Hệ thống tự động chạy quy trình hoàn trả nguyên vật liệu)
        Route::post('/dat-mon/huy/{id}', [DatMonController::class, 'destroy'])->name('dat_mon.destroy');

        // Quản lý thông tin khách hàng thân thiết (CRM) - Phục vụ tích lũy điểm khi checkout
        Route::resource('/quan-ly/khach-hang', KhachHangController::class)->names([
            'index' => 'khach_hang.index',
            'store' => 'khach_hang.store',
            'update' => 'khach_hang.update',
            'destroy' => 'khach_hang.destroy',
        ]);
    });


    // ---------------------------------------------------------------------
    // --- VAI TRÒ 3: ADMIN & NHÀ BẾP (ADMIN, BEP) ---
    // ---------------------------------------------------------------------
    Route::middleware(['role:admin,bep'])->group(function () {
        
        // Giao diện chế biến bếp KDS Pro (Kitchen Display System)
        Route::get('/dat-mon/bep', [DatMonController::class, 'bep'])->name('dat_mon.bep');
        
        // Giao diện quản lý kho hàng nhập khẩu
        Route::get('/nguyen-lieu', [NguyenLieuController::class, 'index'])->name('nguyen_lieu.index');
        
        // So sánh giá giữa các nhà cung ứng, đặt hàng nguyên liệu và kiểm kê nhập kho
        Route::get('/nguyen-lieu/so-sanh', [NguyenLieuController::class, 'comparePrice'])->name('nguyen_lieu.compare_price');
        Route::post('/nguyen-lieu/order', [NguyenLieuController::class, 'orderIngredient'])->name('nguyen_lieu.order');
        Route::post('/nguyen-lieu/verify/{id}', [NguyenLieuController::class, 'verifyImport'])->name('nguyen_lieu.verify');
    });


    // ---------------------------------------------------------------------
    // --- CHUNG CHO CẢ 3 VAI TRÒ (Cập nhật trạng thái món ăn bếp/nhân viên phục vụ) ---
    // ---------------------------------------------------------------------
    Route::post('/dat-mon/doi-trang-thai/{id}', [DatMonController::class, 'updateStatus'])
        ->middleware('role:admin,nhan_vien,bep')
        ->name('dat_mon.update_status');

});