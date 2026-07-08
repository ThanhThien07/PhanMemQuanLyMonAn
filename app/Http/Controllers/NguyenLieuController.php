<?php

namespace App\Http\Controllers;

use App\Models\DonNhapHang;
use App\Models\NguyenLieu;
use App\Models\NhaCungCap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * NguyenLieuController - Bộ điều khiển quản lý Kho nguyên liệu nhập khẩu và Đặt hàng
 *
 * Bộ điều khiển này xử lý chức năng xem tồn kho, so sánh giá của các nhà cung cấp nhập khẩu
 * (giả lập Mock API sinh động), gửi đơn đặt mua nguyên liệu và thực hiện kiểm kê, tự động
 * tăng số lượng tồn khi nhập kho thành công.
 */
class NguyenLieuController extends Controller
{
    /**
     * Hiển thị trang quản lý kho nguyên liệu và lịch sử các đơn hàng nhập
     *
     * GET /nguyen-lieu
     */
    public function index()
    {
        // Lấy tất cả nguyên liệu hiện có trong kho
        $ingredients = NguyenLieu::all();

        // Lấy danh sách các đơn đặt mua nguyên liệu xếp theo ngày đặt mới nhất lên trước
        $importOrders = DonNhapHang::orderBy('created_at', 'desc')->get();

        return view('nguyen_lieu.index', compact('ingredients', 'importOrders'));
    }

    /**
     * API So sánh giá cả giữa các Nhà cung cấp nhập khẩu (Mock API giả lập sinh động)
     *
     * Hỗ trợ tìm kiếm báo giá nguyên vật liệu rẻ nhất từ danh sách các đối tác cung ứng.
     *
     * GET /nguyen-lieu/so-sanh
     */
    public function comparePrice(Request $request): JsonResponse
    {
        $search = $request->input('query');

        if (empty($search)) {
            return response()->json(['success' => false, 'message' => 'Vui lòng nhập tên nguyên liệu cần tìm kiếm báo giá.'], 400);
        }

        // CƠ CHẾ DỄ HIỂU: Thiết lập đơn giá gốc (base price) ngẫu nhiên dựa trên từ khóa tìm kiếm
        // Điều này giúp demo chức năng so sánh giá sinh động và thực tế hơn đối với học viên.
        $basePrice = rand(50000, 150000);
        if (stripos($search, 'bò') !== false) {
            $basePrice = 200000;
        } elseif (stripos($search, 'bơ') !== false) {
            $basePrice = 140000;
        } elseif (stripos($search, 'sữa') !== false) {
            $basePrice = 35000;
        }

        // Lấy danh sách đối tác cung ứng thực tế từ cơ sở dữ liệu (NhaCungCap)
        // Nếu DB đang trống chưa có đối tác nào, tự tạo ra mảng giả lập để tránh lỗi hiển thị.
        $dbSuppliers = NhaCungCap::all();
        if ($dbSuppliers->isEmpty()) {
            $dbSuppliers = collect([
                new NhaCungCap(['ten' => 'GlobalFood Import Ltd']),
                new NhaCungCap(['ten' => 'AsiaImport Co.']),
                new NhaCungCap(['ten' => 'EuroIngredient Group']),
            ]);
        }

        // Mảng các hệ số giá, đánh giá sao và thời gian giao hàng để tạo tính ngẫu nhiên, phong phú
        $multipliers = [1.05, 1.10, 0.95, 1.00, 1.15, 0.90];
        $ratings = [4.5, 4.2, 4.8, 4.0, 4.6, 4.9];
        $times = ['3 ngày', '2 ngày', '5 ngày', '4 ngày', '1 ngày', '6 ngày'];

        $suppliers = [];
        foreach ($dbSuppliers as $index => $sup) {
            $m = $multipliers[$index % count($multipliers)]; // Hệ số nhân giá
            $r = $ratings[$index % count($ratings)]; // Số sao đánh giá
            $t = $times[$index % count($times)]; // Thời gian giao

            $suppliers[] = [
                'name' => $sup->ten,
                'price' => round($basePrice * $m),
                'rating' => $r,
                'time' => $t,
            ];
        }

        // Sắp xếp các nhà cung cấp tăng dần theo giá bán (rẻ nhất đứng đầu)
        // Sử dụng toán tử tàu vũ trụ (<=>) trong PHP 7+ để so sánh số nguyên cực nhanh.
        usort($suppliers, function ($a, $b) {
            return $a['price'] <=> $b['price'];
        });

        // Xác định nhà cung cấp rẻ nhất (phần tử đầu tiên sau khi sắp xếp)
        $cheapestName = $suppliers[0]['name'] ?? 'Chưa rõ';

        // Đóng gói mảng dữ liệu có gắn thẻ is_cheapest để frontend làm nổi bật dòng rẻ nhất
        $responseSuppliers = [];
        foreach ($suppliers as $s) {
            $responseSuppliers[] = [
                'name' => $s['name'],
                'price' => $s['price'],
                'rating' => $s['rating'],
                'time' => $s['time'],
                'is_cheapest' => $s['name'] === $cheapestName,
            ];
        }

        return response()->json([
            'success' => true,
            'query' => $search,
            'suppliers' => $responseSuppliers,
        ]);
    }

    /**
     * Xử lý gửi đơn đặt mua nguyên liệu (Chờ hàng về kiểm kê)
     *
     * POST /nguyen-lieu/order
     */
    public function orderIngredient(Request $request)
    {
        $request->validate([
            'ten_nguyen_lieu' => 'required|string',
            'nha_cung_cap' => 'required|string',
            'don_gia' => 'required|numeric',
            'so_luong_dat' => 'required|numeric|min:1',
        ]);

        // Tạo bản ghi đơn nhập hàng mới ở trạng thái "cho_kiem_ke" (chờ kiểm kê thực tế)
        DonNhapHang::create([
            'ten_nguyen_lieu' => $request->ten_nguyen_lieu,
            'nha_cung_cap' => $request->nha_cung_cap,
            'don_gia' => $request->don_gia,
            'so_luong_dat' => $request->so_luong_dat,
            'so_luong_nhan' => null, // Số lượng thực nhận sẽ được điền khi kiểm kê thực tế
            'trang_thai' => 'cho_kiem_ke',
        ]);

        return redirect()->back()->with('success', 'Đã tạo đơn đặt mua nguyên liệu "'.$request->ten_nguyen_lieu.'" từ đối tác "'.$request->nha_cung_cap.'" thành công! Trạng thái đơn: Chờ hàng về kiểm kho.');
    }

    /**
     * Kiểm kê hàng thực tế khi về tới nhà hàng và tự động cập nhật số lượng tồn kho
     *
     * POST /nguyen-lieu/verify/{id}
     */
    public function verifyImport(Request $request, $id)
    {
        $request->validate(['so_luong_nhan' => 'required|numeric|min:0']);

        $order = DonNhapHang::findOrFail($id);
        $soLuongNhan = (float) $request->so_luong_nhan;

        // Bọc toàn bộ trong DB transaction — đảm bảo atomic:
        // Nếu một bước thất bại (ví dụ lỗi kết nối), toàn bộ rollback không lệch kho.
        DB::transaction(function () use ($order, $soLuongNhan) {
            // Cập nhật trạng thái đơn nhập sang "đã nhập kho"
            $order->update([
                'so_luong_nhan' => $soLuongNhan,
                'trang_thai' => 'da_nhap_kho',
            ]);

            // Tìm nguyên liệu theo tên; nếu chưa tồn tại thì tự khởi tạo mới
            $ingredient = NguyenLieu::firstOrCreate(
                ['ten' => $order->ten_nguyen_lieu],
                ['so_luong_ton' => 0, 'don_vi' => 'kg']
            );

            // Tăng tồn kho tổng tương ứng với số lượng thực nhận
            $ingredient->increment('so_luong_ton', $soLuongNhan);
        });

        // Trả về thông báo phù hợp dựa trên độ lệch thực nhận so với đơn đặt
        $difference = $soLuongNhan - $order->so_luong_dat;

        if ($difference == 0) {
            return redirect()->back()->with('success', "Kiểm kê xong: Nhận ĐỦ {$order->ten_nguyen_lieu} ({$soLuongNhan} kg). Kho đã tự động tăng tồn!");
        } elseif ($difference < 0) {
            return redirect()->back()->with('warning', 'Kiểm kê xong: Nhận THIẾU '.abs($difference)." kg so với đơn đặt ({$order->so_luong_dat} kg). Ghi nhận thực tế ({$soLuongNhan} kg).");
        }

        return redirect()->back()->with('success', "Kiểm kê xong: Nhận DƯ {$difference} kg so với đơn đặt ({$order->so_luong_dat} kg). Tăng toàn bộ {$soLuongNhan} kg vào kho.");
    }
}
