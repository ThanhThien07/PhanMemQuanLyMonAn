<?php

namespace App\Http\Controllers;

use App\Models\ChiTietDonDatHangNcc;
use App\Models\DonDatHangNcc;
use App\Models\NguyenLieu;
use App\Models\NhaCungCap;
use App\Models\NhaCungCapNguyenLieu;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProcurementController extends Controller
{
    /**
     * Màn hình So sánh Giá Đa Nhà Cung Cấp & Tự động Đấu thầu Mua hàng
     */
    public function soSanhGia(Request $request)
    {
        $nguyenLieus = NguyenLieu::all();
        $nhaCungCaps = NhaCungCap::all();
        $selectedNguyenLieuId = $request->get('nguyen_lieu_id', $nguyenLieus->first()?->id);

        $selectedNguyenLieu = null;
        $quotes = collect();
        $cheDoToiUu = $request->get('che_do', 'lowest_cost');

        if ($selectedNguyenLieuId) {
            $selectedNguyenLieu = NguyenLieu::find($selectedNguyenLieuId);
            $quotes = NhaCungCapNguyenLieu::with('nhaCungCap')
                ->where('nguyen_lieu_id', $selectedNguyenLieuId)
                ->orderBy('don_gia_chao', 'asc')
                ->get();
        }

        // Ma trận tất cả giá báo từ các nhà cung cấp
        $allQuotes = NhaCungCapNguyenLieu::with(['nhaCungCap', 'nguyenLieu'])->get();

        // Thuật toán gợi ý giỏ hàng mua hàng tối ưu cho tất cả nguyên liệu thấp tồn kho
        $lowStockIngredients = NguyenLieu::where('so_luong_ton', '<', 10)->get();
        $suggestedCart = [];
        $totalEstimatedCost = 0;

        foreach ($lowStockIngredients as $item) {
            // Tìm tất cả báo giá của nguyên liệu này
            $itemQuotes = NhaCungCapNguyenLieu::with('nhaCungCap')
                ->where('nguyen_lieu_id', $item->id)
                ->get();

            if ($itemQuotes->isNotEmpty()) {
                if ($cheDoToiUu === 'lowest_cost') {
                    // Chọn NCC có đơn giá rẻ nhất
                    $bestQuote = $itemQuotes->sortBy('don_gia_chao')->first();
                } else {
                    // Tối ưu uy tín & thời gian giao hàng (Lead time ngắn + Điểm đánh giá cao)
                    $bestQuote = $itemQuotes->sortByDesc(function ($q) {
                        return $q->danh_gia_star * 10 - $q->lead_time_days;
                    })->first();
                }

                $neededQty = max(10 - $item->so_luong_ton, $bestQuote->moq);
                $subtotal = $neededQty * $bestQuote->don_gia_chao;
                $totalEstimatedCost += $subtotal;

                $suggestedCart[] = [
                    'nguyen_lieu' => $item,
                    'best_quote' => $bestQuote,
                    'nha_cung_cap' => $bestQuote->nhaCungCap,
                    'so_luong_can_mua' => $neededQty,
                    'don_gia' => $bestQuote->don_gia_chao,
                    'thanh_tien' => $subtotal,
                ];
            }
        }

        return view('nguyen_lieu.procurement', compact(
            'nguyenLieus',
            'nhaCungCaps',
            'selectedNguyenLieu',
            'quotes',
            'allQuotes',
            'suggestedCart',
            'totalEstimatedCost',
            'cheDoToiUu'
        ));
    }

    /**
     * Lưu thông tin báo giá mới của Nhà Cung Cấp cho Nguyên liệu
     */
    public function saveQuote(Request $request)
    {
        $validated = $request->validate([
            'nha_cung_cap_id' => 'required|exists:nha_cung_cap,id',
            'nguyen_lieu_id' => 'required|exists:nguyen_lieu,id',
            'don_gia_chao' => 'required|numeric|min:0',
            'don_vi_tinh' => 'required|string',
            'moq' => 'required|numeric|min:0.1',
            'lead_time_days' => 'required|integer|min:0',
            'danh_gia_star' => 'nullable|numeric|min:1|max:5',
            'ghi_chu' => 'nullable|string',
        ]);

        NhaCungCapNguyenLieu::updateOrCreate(
            [
                'nha_cung_cap_id' => $validated['nha_cung_cap_id'],
                'nguyen_lieu_id' => $validated['nguyen_lieu_id'],
            ],
            [
                'don_gia_chao' => $validated['don_gia_chao'],
                'don_vi_tinh' => $validated['don_vi_tinh'],
                'moq' => $validated['moq'],
                'lead_time_days' => $validated['lead_time_days'],
                'danh_gia_star' => $validated['danh_gia_star'] ?? 5.0,
                'ghi_chu' => $validated['ghi_chu'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Đã lưu báo giá Nhà Cung Cấp thành công!');
    }

    /**
     * Tự động tạo Đơn Đặt Hàng (PO) từ Giỏ hàng gợi ý tối ưu
     */
    public function taoDonMuaHang(Request $request)
    {
        $validated = $request->validate([
            'nha_cung_cap_id' => 'required|exists:nha_cung_cap,id',
            'items' => 'required|array',
            'items.*.nguyen_lieu_id' => 'required|exists:nguyen_lieu,id',
            'items.*.so_luong' => 'required|numeric|min:0.1',
            'items.*.don_gia' => 'required|numeric|min:0',
            'che_do_toi_uu' => 'nullable|string',
        ]);

        $maPo = 'PO-' . strtoupper(Str::random(6)) . '-' . date('Ymd');
        $tongTien = 0;

        foreach ($validated['items'] as $item) {
            $tongTien += $item['so_luong'] * $item['don_gia'];
        }

        $po = DonDatHangNcc::create([
            'ma_don_po' => $maPo,
            'nha_cung_cap_id' => $validated['nha_cung_cap_id'],
            'ngay_dat' => now(),
            'du_kien_giao' => now()->addDays(2),
            'tong_tien' => $tongTien,
            'trang_thai' => 'cho_duyet',
            'che_do_toi_uu' => $validated['che_do_toi_uu'] ?? 'lowest_cost',
            'user_id' => Auth::id(),
            'ghi_chu' => 'Tạo tự động từ Hệ thống So sánh Giá & Tối ưu Mua hàng',
        ]);

        foreach ($validated['items'] as $item) {
            ChiTietDonDatHangNcc::create([
                'don_dat_hang_ncc_id' => $po->id,
                'nguyen_lieu_id' => $item['nguyen_lieu_id'],
                'so_luong_dat' => $item['so_luong'],
                'don_gia_dat' => $item['don_gia'],
                'thanh_tien' => $item['so_luong'] * $item['don_gia'],
            ]);
        }

        return redirect()->route('nguyen_lieu.danh_sach_po')->with('success', "Đã phát hành Đơn mua hàng PO mới: {$maPo}");
    }

    /**
     * Danh sách các đơn mua hàng (PO) đã tạo
     */
    public function danhSachPo()
    {
        $pos = DonDatHangNcc::with(['nhaCungCap', 'user', 'chiTiet.nguyenLieu'])
            ->orderBy('created_at', 'desc')
            ->get();

        return view('nguyen_lieu.po_index', compact('pos'));
    }
}
