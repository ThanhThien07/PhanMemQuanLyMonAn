<?php

namespace App\Http\Controllers;

use App\Models\NhaCungCap;
use App\Models\DonNhapHang;
use Illuminate\Http\Request;

class NhaCungCapController extends Controller
{
    /**
     * Display a listing of the suppliers.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = NhaCungCap::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('ten', 'like', '%' . $search . '%')
                  ->orWhere('dia_chi', 'like', '%' . $search . '%');
            });
        }

        $suppliers = $query->orderBy('ten')->get();

        // Lấy lịch sử giao dịch từ đơn nhập hàng kiểm kê để tính tổng giá trị hàng nhập
        $allOrders = DonNhapHang::all();

        foreach ($suppliers as $s) {
            $related = $allOrders->filter(function($item) use ($s) {
                return stripos($item->nha_cung_cap, $s->ten) !== false;
            });
            $s->don_nhap_count = $related->count();
            $s->tong_nhap_gia_tri = $related->where('trang_thai', 'da_nhap_kho')->sum(function($item) {
                return ($item->so_luong_nhan ?? 0) * $item->don_gia;
            });
        }

        return view('nha_cung_cap.index', compact('suppliers', 'search'));
    }

    /**
     * Store a newly created supplier in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'ten' => 'required|string|max:100|unique:nha_cung_cap,ten',
            'sdt' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string|max:255',
        ]);

        NhaCungCap::create($request->all());

        return redirect()->back()->with('success', 'Đã lưu trữ nhà cung cấp "' . $request->ten . '" thành công!');
    }

    /**
     * Update the specified supplier in storage.
     */
    public function update(Request $request, $id)
    {
        $supplier = NhaCungCap::findOrFail($id);

        $request->validate([
            'ten' => 'required|string|max:100|unique:nha_cung_cap,ten,' . $id,
            'sdt' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string|max:255',
        ]);

        $supplier->update($request->all());

        return redirect()->back()->with('success', 'Đã cập nhật thông tin nhà cung cấp "' . $request->ten . '" thành công!');
    }

    /**
     * Remove the specified supplier from storage.
     */
    public function destroy($id)
    {
        $supplier = NhaCungCap::findOrFail($id);
        $name = $supplier->ten;
        $supplier->delete();

        return redirect()->back()->with('success', 'Đã xóa nhà cung cấp "' . $name . '"!');
    }
}
