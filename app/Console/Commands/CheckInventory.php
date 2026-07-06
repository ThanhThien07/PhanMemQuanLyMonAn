<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NguyenLieu;
use App\Models\LoHangNhap;
use Illuminate\Support\Facades\Log;

class CheckInventory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kiểm tra tồn kho nguyên liệu sắp hết (< 5) và lô hàng sắp hết hạn sử dụng (< 7 ngày)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('--- BẮT ĐẦU KIỂM TRA TỒN KHO & HẠN SỬ DỤNG ---');

        // 1. Kiểm tra tồn kho nguyên liệu thấp hơn định mức (5 đơn vị)
        $lowStockIngredients = NguyenLieu::where('so_luong_ton', '<', 5)->get();
        if ($lowStockIngredients->count() > 0) {
            $this->warn("\n[CẢNH BÁO] Phát hiện nguyên liệu sắp hết tồn kho:");
            foreach ($lowStockIngredients as $nl) {
                $msg = "- Nguyên liệu '{$nl->ten}': Hiện tại chỉ còn {$nl->so_luong_ton} {$nl->don_vi} (Định mức cảnh báo: < 5).";
                $this->line($msg);
                Log::warning('InventoryCheck: Low Stock: ' . $msg);
            }
        } else {
            $this->info("\nTất cả nguyên liệu đều ở mức tồn kho an toàn.");
        }

        // 2. Kiểm tra lô hàng sắp hết hạn sử dụng (trong vòng 7 ngày tới hoặc đã quá hạn)
        $warningDate = now()->addDays(7);
        $expiringBatches = LoHangNhap::with('nguyenLieu')
            ->where('so_luong_ton', '>', 0)
            ->whereDate('ngay_het_han', '<=', $warningDate)
            ->get();

        if ($expiringBatches->count() > 0) {
            $this->warn("\n[CẢNH BÁO] Phát hiện lô hàng sắp hết hạn hoặc đã quá hạn sử dụng:");
            foreach ($expiringBatches as $batch) {
                $daysRemaining = now()->diffInDays($batch->ngay_het_han, false);
                $tenNguyenLieu = $batch->nguyenLieu->ten ?? 'Không xác định';

                if ($daysRemaining < 0) {
                    $msg = "- Lô '{$batch->ma_lo}' (Nguyên liệu: {$tenNguyenLieu}): ĐÃ QUÁ HẠN " . abs($daysRemaining) . " ngày! (Hạn dùng: " . $batch->ngay_het_han . ", Tồn lô: {$batch->so_luong_ton})";
                    Log::error('InventoryCheck: EXPIRED: ' . $msg);
                } else {
                    $msg = "- Lô '{$batch->ma_lo}' (Nguyên liệu: {$tenNguyenLieu}): Chỉ còn {$daysRemaining} ngày sử dụng! (Hạn dùng: " . $batch->ngay_het_han . ", Tồn lô: {$batch->so_luong_ton})";
                    Log::warning('InventoryCheck: Expiring soon: ' . $msg);
                }
                $this->line($msg);
            }
        } else {
            $this->info("\nKhông phát hiện lô hàng nào sắp hết hạn sử dụng trong 7 ngày tới.");
        }

        $this->info("\n--- HOÀN THÀNH KIỂM TRA ---");
        return 0;
    }
}
