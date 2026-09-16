<?php

namespace App\Http\Controllers;

use App\Models\DonNhapHang;
use App\Models\NhaCungCap;
use Illuminate\Http\Request;

/**
 * Lớp NhaCungCapController - Quản lý Danh sách đối tác Nhà cung cấp
 *
 * Quản lý hoạt động Thêm, Sửa, Xóa thông tin nhà cung cấp và thống kê lịch sử giao dịch mua nguyên liệu.
 */
class NhaCungCapController extends Controller
{
    /**
     * Hiển thị danh sách các nhà cung cấp kèm bộ lọc tìm kiếm và tổng giá trị giao dịch nhập kho
     *
     * GET /quan-ly/nha-cung-cap
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = NhaCungCap::query();

        // Lọc nhà cung cấp theo tên hoặc địa chỉ (nếu có)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ten', 'like', '%'.$search.'%')
                    ->orWhere('dia_chi', 'like', '%'.$search.'%');
            });
        }

        $suppliers = $query->orderBy('ten')->get();

        // Lấy lịch sử giao dịch từ đơn nhập hàng kiểm kê để tính tổng giá trị hàng nhập
        $allOrders = DonNhapHang::all();

        // Duyệt qua từng nhà cung cấp để đối khớp đơn hàng nhập và cộng doanh số giao dịch
        foreach ($suppliers as $s) {
            $related = $allOrders->filter(function ($item) use ($s) {
                return stripos($item->nha_cung_cap, $s->ten) !== false;
            });
            $s->don_nhap_count = $related->count();
            $s->tong_nhap_gia_tri = $related->where('trang_thai', 'da_nhap_kho')->sum(function ($item) {
                return ($item->so_luong_nhan ?? 0) * $item->don_gia;
            });
        }

        return view('nha_cung_cap.index', compact('suppliers', 'search'));
    }

    /**
     * Lưu trữ nhà cung cấp mới
     *
     * POST /quan-ly/nha-cung-cap
     */
    public function store(Request $request)
    {
        // Xác thực: Tên nhà cung cấp phải duy nhất trong hệ thống
        $request->validate([
            'ten' => 'required|string|max:100|unique:nha_cung_cap,ten',
            'sdt' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string|max:255',
        ]);

        NhaCungCap::create($request->all());

        return redirect()->back()->with('success', 'Đã lưu trữ nhà cung cấp "'.$request->ten.'" thành công!');
    }

    /**
     * Cập nhật thông tin nhà cung cấp
     *
     * PUT/PATCH /quan-ly/nha-cung-cap/{id}
     */
    public function update(Request $request, $id)
    {
        $supplier = NhaCungCap::findOrFail($id);

        // Xác thực: Tên nhà cung cấp phải duy nhất trừ chính bản ghi đang cập nhật
        $request->validate([
            'ten' => 'required|string|max:100|unique:nha_cung_cap,ten,'.$id,
            'sdt' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string|max:255',
        ]);

        $supplier->update($request->all());

        return redirect()->back()->with('success', 'Đã cập nhật thông tin nhà cung cấp "'.$request->ten.'" thành công!');
    }

    /**
     * Xóa thông tin nhà cung cấp
     *
     * DELETE /quan-ly/nha-cung-cap/{id}
     */
    public function destroy($id)
    {
        $supplier = NhaCungCap::findOrFail($id);
        $name = $supplier->ten;
        $supplier->delete();

        return redirect()->back()->with('success', 'Đã xóa nhà cung cấp "'.$name.'"!');
    }
}
