<?php

namespace App\Http\Controllers;

use App\Models\KhachHang;
use Illuminate\Http\Request;

class KhachHangController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = KhachHang::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('ten', 'like', '%' . $search . '%')
                  ->orWhere('sdt', 'like', '%' . $search . '%');
            });
        }

        // Lấy danh sách khách hàng kèm lịch sử món ăn (tự động tính doanh thu tích lũy)
        $customers = $query->with('datMons')
            ->orderBy('diem_tich_luy', 'desc')
            ->get()
            ->map(function($c) {
                // Doanh thu tích lũy = Tổng tiền các món ăn đã thanh toán
                $c->doanh_thu_tich_luy = $c->datMons->sum(function($item) {
                    return $item->so_luong * $item->don_gia;
                });
                return $c;
            });

        return view('khach_hang.index', compact('customers', 'search'));
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'ten' => 'required|string|max:100',
            'sdt' => 'required|string|max:20|unique:khach_hang,sdt',
            'diem_tich_luy' => 'nullable|integer|min:0',
        ]);

        KhachHang::create([
            'ten' => $request->ten,
            'sdt' => $request->sdt,
            'diem_tich_luy' => $request->diem_tich_luy ?? 0,
        ]);

        return redirect()->back()->with('success', 'Đã lưu trữ thông tin khách hàng "' . $request->ten . '" thành công!');
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, $id)
    {
        $customer = KhachHang::findOrFail($id);

        $request->validate([
            'ten' => 'required|string|max:100',
            'sdt' => 'required|string|max:20|unique:khach_hang,sdt,' . $id,
            'diem_tich_luy' => 'required|integer|min:0',
        ]);

        $customer->update($request->all());

        return redirect()->back()->with('success', 'Đã cập nhật thông tin khách hàng "' . $request->ten . '" thành công!');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy($id)
    {
        $customer = KhachHang::findOrFail($id);
        $name = $customer->ten;
        $customer->delete();

        return redirect()->back()->with('success', 'Đã xóa hồ sơ khách hàng "' . $name . '"!');
    }
}
