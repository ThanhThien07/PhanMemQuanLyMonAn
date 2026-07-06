<?php

namespace App\Http\Controllers;

use App\Models\MonAn;
use App\Models\LoaiMon;
use Illuminate\Http\Request;

class MonAnController extends Controller
{
    /**
     * Hiển thị danh sách món ăn và danh mục loại món ăn
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $loai_mon_id = $request->input('loai_mon_id');

        $query = MonAn::with('loaiMon');

        if ($search) {
            $query->where('ten', 'like', '%' . $search . '%');
        }

        if ($loai_mon_id) {
            $query->where('loai_mon_id', $loai_mon_id);
        }

        $dishes = $query->orderBy('ten')->get();
        $categories = LoaiMon::withCount('monAns')->orderBy('ma_loai')->get();

        return view('mon_an.index', compact('dishes', 'categories', 'search', 'loai_mon_id'));
    }

    /**
     * Lưu món ăn mới vào thực đơn
     */
    public function store(Request $request)
    {
        $request->validate([
            'ten' => 'required|string|max:100|unique:mon_an,ten',
            'gia' => 'required|numeric|min:0',
            'time' => 'required|integer|min:1',
            'loai_mon_id' => 'required|exists:loai_mon,id',
            'mota' => 'nullable|string|max:255',
        ], [
            'ten.required' => 'Tên món ăn không được để trống.',
            'ten.unique' => 'Tên món ăn này đã tồn tại trong thực đơn.',
            'gia.required' => 'Đơn giá không được để trống.',
            'time.required' => 'Thời gian nấu không được để trống.',
            'loai_mon_id.required' => 'Vui lòng chọn loại món ăn.',
        ]);

        $loaiMon = LoaiMon::findOrFail($request->loai_mon_id);
        
        // Giữ cột loai cũ để tương thích ngược (LM08 là Đồ uống)
        $loai = ($loaiMon->ma_loai === 'LM08') ? 'DoUong' : 'MonAn';

        MonAn::create([
            'ten' => $request->ten,
            'gia' => $request->gia,
            'time' => $request->time,
            'loai' => $loai,
            'loai_mon_id' => $request->loai_mon_id,
            'mota' => $request->mota,
        ]);

        return redirect()->back()->with('success', 'Đã thêm món ăn "' . $request->ten . '" vào thực đơn thành công!');
    }

    /**
     * Cập nhật thông tin món ăn
     */
    public function update(Request $request, $id)
    {
        $dish = MonAn::findOrFail($id);

        $request->validate([
            'ten' => 'required|string|max:100|unique:mon_an,ten,' . $id,
            'gia' => 'required|numeric|min:0',
            'time' => 'required|integer|min:1',
            'loai_mon_id' => 'required|exists:loai_mon,id',
            'mota' => 'nullable|string|max:255',
        ]);

        $loaiMon = LoaiMon::findOrFail($request->loai_mon_id);
        $loai = ($loaiMon->ma_loai === 'LM08') ? 'DoUong' : 'MonAn';

        $dish->update([
            'ten' => $request->ten,
            'gia' => $request->gia,
            'time' => $request->time,
            'loai' => $loai,
            'loai_mon_id' => $request->loai_mon_id,
            'mota' => $request->mota,
        ]);

        return redirect()->back()->with('success', 'Đã cập nhật món ăn "' . $request->ten . '" thành công!');
    }

    /**
     * Xóa món ăn khỏi thực đơn
     */
    public function destroy($id)
    {
        $dish = MonAn::findOrFail($id);
        $name = $dish->ten;
        $dish->delete();

        return redirect()->back()->with('success', 'Đã xóa món ăn "' . $name . '" khỏi thực đơn!');
    }

    /**
     * Thêm danh mục loại món ăn mới
     */
    public function storeCategory(Request $request)
    {
        $request->validate([
            'ma_loai' => 'required|string|max:20|unique:loai_mon,ma_loai',
            'ten_loai' => 'required|string|max:100',
        ], [
            'ma_loai.required' => 'Mã loại không được để trống.',
            'ma_loai.unique' => 'Mã loại này đã tồn tại.',
            'ten_loai.required' => 'Tên loại không được để trống.',
        ]);

        LoaiMon::create($request->all());

        return redirect()->back()->with('success', 'Đã tạo danh mục loại món "' . $request->ten_loai . '" thành công!');
    }

    /**
     * Cập nhật danh mục loại món ăn
     */
    public function updateCategory(Request $request, $id)
    {
        $category = LoaiMon::findOrFail($id);

        $request->validate([
            'ma_loai' => 'required|string|max:20|unique:loai_mon,ma_loai,' . $id,
            'ten_loai' => 'required|string|max:100',
        ]);

        $category->update($request->all());

        return redirect()->back()->with('success', 'Đã cập nhật danh mục "' . $request->ten_loai . '" thành công!');
    }

    /**
     * Xóa danh mục loại món ăn
     */
    public function destroyCategory($id)
    {
        $category = LoaiMon::findOrFail($id);
        $name = $category->ten_loai;
        $category->delete();

        return redirect()->back()->with('success', 'Đã xóa danh mục "' . $name . '" thành công!');
    }
}
