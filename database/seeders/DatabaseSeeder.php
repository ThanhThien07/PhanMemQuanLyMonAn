<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\NguyenLieu;
use App\Models\DonNhapHang;
use App\Models\MonAn;
use App\Models\KhachHang;
use App\Models\NhaCungCap;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Tạo Tài khoản Người dùng phân quyền
        User::factory()->create([
            'name' => 'M&S Admin',
            'email' => 'admin@ms.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Nhân Viên Phục Vụ A',
            'email' => 'nhanvien@ms.com',
            'password' => bcrypt('nhanvien123'),
            'role' => 'nhan_vien',
        ]);

        User::factory()->create([
            'name' => 'Bếp Trưởng M&S',
            'email' => 'bep@ms.com',
            'password' => bcrypt('bep123'),
            'role' => 'bep',
        ]);

        // 2. Seed danh mục loại món ăn
        $categories = [
            ['ma_loai' => 'LM01', 'ten_loai' => 'Món khai vị'],
            ['ma_loai' => 'LM02', 'ten_loai' => 'Món chính'],
            ['ma_loai' => 'LM03', 'ten_loai' => 'Món phụ'],
            ['ma_loai' => 'LM04', 'ten_loai' => 'Món canh'],
            ['ma_loai' => 'LM05', 'ten_loai' => 'Món lẩu'],
            ['ma_loai' => 'LM06', 'ten_loai' => 'Món nướng'],
            ['ma_loai' => 'LM07', 'ten_loai' => 'Món tráng miệng'],
            ['ma_loai' => 'LM08', 'ten_loai' => 'Đồ uống'],
        ];

        $catIds = [];
        foreach ($categories as $cat) {
            $loaiMon = \App\Models\LoaiMon::create($cat);
            $catIds[$cat['ma_loai']] = $loaiMon->id;
        }

        // 3. Seed thực đơn món ăn động
        $menuItems = [
            ['ten' => 'Phở Bò M&S', 'gia' => 45000, 'time' => 10, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM02'], 'mota' => 'Bánh phở tươi ngon, nước dùng ninh từ xương bò ta thơm phức kèm thịt bò mềm.'],
            ['ten' => 'Bún Chả M&S', 'gia' => 40000, 'time' => 8, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM02'], 'mota' => 'Thịt ba chỉ nướng than hoa thơm lừng ăn kèm nước mắm chua ngọt đu đủ.'],
            ['ten' => 'Bánh Mì Kẹp Thịt M&S', 'gia' => 25000, 'time' => 5, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM03'], 'mota' => 'Bánh mì giòn rụm kẹp pate Hải Phòng, giò tai thơm phức và dưa chuột.'],
            ['ten' => 'Cà Phê Sữa Đá M&S', 'gia' => 20000, 'time' => 3, 'loai' => 'DoUong', 'loai_mon_id' => $catIds['LM08'], 'mota' => 'Cà phê Robusta đậm đặc pha phin truyền thống hòa quyện sữa đặc Ông Thọ.'],
            ['ten' => 'Trà Đào Cam Sả M&S', 'gia' => 30000, 'time' => 4, 'loai' => 'DoUong', 'loai_mon_id' => $catIds['LM08'], 'mota' => 'Trà túi lọc hương đào tự nhiên pha cam sả mát lạnh giải nhiệt mùa hè.'],
            ['ten' => 'Nước Cam Ép', 'gia' => 25000, 'time' => 4, 'loai' => 'DoUong', 'loai_mon_id' => $catIds['LM08'], 'mota' => 'Cam sành vắt nước cốt nguyên chất 100%, bổ sung vitamin C đề kháng tốt.'],
            ['ten' => 'Gỏi Ngó Sen Tai Heo', 'gia' => 35000, 'time' => 6, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM01'], 'mota' => 'Gỏi ngó sen giòn sần sật, tai heo luộc giòn rụm kết hợp nước mắm chua ngọt.'],
            ['ten' => 'Rau Xào Tỏi M&S', 'gia' => 30000, 'time' => 5, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM03'], 'mota' => 'Rau muống xanh giòn xào tỏi Lý Sơn thơm nức mũi.'],
            ['ten' => 'Canh Chua Cá Lóc', 'gia' => 50000, 'time' => 12, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM04'], 'mota' => 'Canh chua cá lóc đậm đà hương vị miền Tây với dọc mùng, giá đỗ, dứa.'],
            ['ten' => 'Lẩu Thái Hải Sản', 'gia' => 199000, 'time' => 15, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM05'], 'mota' => 'Nước lẩu chua cay chuẩn vị Thái kèm tôm, mực, ngao và rau nấm ăn kèm.'],
            ['ten' => 'Bò Nướng Ngói', 'gia' => 120000, 'time' => 10, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM06'], 'mota' => 'Thịt bò tẩm ướp gia vị nướng trên ngói giữ trọn vị ngọt tự nhiên.'],
            ['ten' => 'Kem Dừa Côn Đảo', 'gia' => 25000, 'time' => 3, 'loai' => 'MonAn', 'loai_mon_id' => $catIds['LM07'], 'mota' => 'Kem dừa mát lạnh đựng trong quả dừa xiêm, phủ dừa nạo và đậu phộng.'],
        ];

        foreach ($menuItems as $item) {
            MonAn::create($item);
        }

        // 3. Seed Khách hàng CRM
        $customers = [
            ['ten' => 'Nguyễn Hoàng Long', 'sdt' => '0987654321', 'diem_tich_luy' => 150],
            ['ten' => 'Trần Hoàng Hưng', 'sdt' => '0912345678', 'diem_tich_luy' => 80],
            ['ten' => 'Phạm Phú Sang', 'sdt' => '0909090909', 'diem_tich_luy' => 320],
        ];

        foreach ($customers as $c) {
            KhachHang::create($c);
        }

        // 4. Seed Nhà cung cấp
        $suppliers = [
            ['ten' => 'GlobalFood Import Ltd', 'sdt' => '0281234567', 'dia_chi' => '123 Nguyễn Huệ, Quận 1, TP. HCM'],
            ['ten' => 'EuroIngredient Group', 'sdt' => '0287654321', 'dia_chi' => '456 Lê Lợi, Quận 1, TP. HCM'],
            ['ten' => 'AsiaImport Co.', 'sdt' => '0289876543', 'dia_chi' => '789 Trần Hưng Đạo, Quận 5, TP. HCM'],
        ];

        foreach ($suppliers as $s) {
            NhaCungCap::create($s);
        }

        // 5. Gọi các Seeder của Bàn và Đặt món
        $this->call([
            BanSeeder::class,
            DatMonSeeder::class,
        ]);

        // 6. Seed dữ liệu nguyên liệu nhập khẩu
        $ingredientsData = [
            ['ten' => 'Thịt Bò Úc nhập khẩu', 'so_luong_ton' => 25.5, 'don_vi' => 'kg'],
            ['ten' => 'Bơ Lạt Pháp cao cấp', 'so_luong_ton' => 8.2, 'don_vi' => 'kg'],
            ['ten' => 'Sữa Tươi New Zealand', 'so_luong_ton' => 45.0, 'don_vi' => 'lít'],
            ['ten' => 'Bột Mì Ý thượng hạng', 'so_luong_ton' => 15.0, 'don_vi' => 'kg'],
            ['ten' => 'Cà Phê Robusta Buôn Ma Thuột', 'so_luong_ton' => 30.0, 'don_vi' => 'kg'],
        ];

        $ingredients = [];
        foreach ($ingredientsData as $ing) {
            $ingredients[$ing['ten']] = NguyenLieu::create($ing);
        }

        // 7. Seed dữ liệu đơn nhập hàng kiểm kê
        $importOrders = [
            [
                'ten_nguyen_lieu' => 'Thịt Bò Úc nhập khẩu',
                'nha_cung_cap' => 'GlobalFood Import Ltd',
                'don_gia' => 210000,
                'so_luong_dat' => 50,
                'so_luong_nhan' => null,
                'trang_thai' => 'cho_kiem_ke',
            ],
            [
                'ten_nguyen_lieu' => 'Bơ Lạt Pháp cao cấp',
                'nha_cung_cap' => 'EuroIngredient Group',
                'don_gia' => 150000,
                'so_luong_dat' => 20,
                'so_luong_nhan' => null,
                'trang_thai' => 'cho_kiem_ke',
            ],
            [
                'ten_nguyen_lieu' => 'Sữa Tươi New Zealand',
                'nha_cung_cap' => 'AsiaImport Co.',
                'don_gia' => 40000,
                'so_luong_dat' => 60,
                'so_luong_nhan' => 60,
                'trang_thai' => 'da_nhap_kho',
            ],
        ];

        foreach ($importOrders as $order) {
            DonNhapHang::create($order);
        }

        // 8. Seed Lô hàng nhập chi tiết (Lưu vết theo date để thực thi FEFO)
        $nccGlobal = NhaCungCap::where('ten', 'GlobalFood Import Ltd')->first();
        $nccEuro = NhaCungCap::where('ten', 'EuroIngredient Group')->first();
        $nccAsia = NhaCungCap::where('ten', 'AsiaImport Co.')->first();

        // Lô Thị Bò Úc ngày 06/04 (Hạn dùng cận hơn: 01/06/2026)
        \App\Models\LoHangNhap::create([
            'ma_lo' => 'LOT-BO-0604',
            'nguyen_lieu_id' => $ingredients['Thịt Bò Úc nhập khẩu']->id,
            'don_nhap_hang_id' => 1,
            'nha_cung_cap_id' => $nccGlobal->id,
            'ngay_nhap' => '2026-04-06',
            'ngay_het_han' => '2026-06-01',
            'so_luong_nhap' => 10.0,
            'so_luong_ton' => 10.0,
            'don_gia_nhap' => 210000,
            'vi_tri_kho' => 'Tủ đông A-01',
        ]);

        // Lô Thị Bò Úc ngày 08/04 (Hạn dùng xa hơn: 15/06/2026)
        \App\Models\LoHangNhap::create([
            'ma_lo' => 'LOT-BO-0804',
            'nguyen_lieu_id' => $ingredients['Thịt Bò Úc nhập khẩu']->id,
            'don_nhap_hang_id' => 1,
            'nha_cung_cap_id' => $nccGlobal->id,
            'ngay_nhap' => '2026-04-08',
            'ngay_het_han' => '2026-06-15',
            'so_luong_nhap' => 15.5,
            'so_luong_ton' => 15.5,
            'don_gia_nhap' => 210000,
            'vi_tri_kho' => 'Tủ đông A-02',
        ]);

        // Các lô hàng nhập cho nguyên liệu khác
        \App\Models\LoHangNhap::create([
            'ma_lo' => 'LOT-BO-FRANCE',
            'nguyen_lieu_id' => $ingredients['Bơ Lạt Pháp cao cấp']->id,
            'don_nhap_hang_id' => 2,
            'nha_cung_cap_id' => $nccEuro->id,
            'ngay_nhap' => '2026-05-10',
            'ngay_het_han' => '2026-07-01',
            'so_luong_nhap' => 8.2,
            'so_luong_ton' => 8.2,
            'don_gia_nhap' => 150000,
            'vi_tri_kho' => 'Tủ mát B-01',
        ]);

        \App\Models\LoHangNhap::create([
            'ma_lo' => 'LOT-SUA-NZ',
            'nguyen_lieu_id' => $ingredients['Sữa Tươi New Zealand']->id,
            'don_nhap_hang_id' => 3,
            'nha_cung_cap_id' => $nccAsia->id,
            'ngay_nhap' => '2026-05-15',
            'ngay_het_han' => '2026-05-30',
            'so_luong_nhap' => 45.0,
            'so_luong_ton' => 45.0,
            'don_gia_nhap' => 40000,
            'vi_tri_kho' => 'Tủ mát B-02',
        ]);

        \App\Models\LoHangNhap::create([
            'ma_lo' => 'LOT-CAFE-BMT',
            'nguyen_lieu_id' => $ingredients['Cà Phê Robusta Buôn Ma Thuột']->id,
            'don_nhap_hang_id' => null,
            'nha_cung_cap_id' => $nccAsia->id,
            'ngay_nhap' => '2026-05-01',
            'ngay_het_han' => '2027-01-01',
            'so_luong_nhap' => 30.0,
            'so_luong_ton' => 30.0,
            'don_gia_nhap' => 80000,
            'vi_tri_kho' => 'Kệ khô tầng 1',
        ]);

        \App\Models\LoHangNhap::create([
            'ma_lo' => 'LOT-BOT-ITALY',
            'nguyen_lieu_id' => $ingredients['Bột Mì Ý thượng hạng']->id,
            'don_nhap_hang_id' => null,
            'nha_cung_cap_id' => $nccEuro->id,
            'ngay_nhap' => '2026-05-01',
            'ngay_het_han' => '2026-08-01',
            'so_luong_nhap' => 15.0,
            'so_luong_ton' => 15.0,
            'don_gia_nhap' => 35000,
            'vi_tri_kho' => 'Kệ khô tầng 2',
        ]);

        // 9. Thiết lập công thức định lượng (Recipe BOM)
        $phoBo = MonAn::where('ten', 'Phở Bò M&S')->first();
        $banhMi = MonAn::where('ten', 'Bánh Mì Kẹp Thịt M&S')->first();
        $cafe = MonAn::where('ten', 'Cà Phê Sữa Đá M&S')->first();

        // Phở Bò cần 0.15 kg Thịt bò
        if ($phoBo) {
            $phoBo->nguyenLieu()->attach($ingredients['Thịt Bò Úc nhập khẩu']->id, [
                'so_luong_dinh_luong' => 0.15,
            ]);
        }

        // Bánh Mì cần 0.05 kg Bơ Lạt
        if ($banhMi) {
            $banhMi->nguyenLieu()->attach($ingredients['Bơ Lạt Pháp cao cấp']->id, [
                'so_luong_dinh_luong' => 0.05,
            ]);
        }

        // Cà phê cần 0.05 kg Cà phê và 0.1 lít Sữa tươi
        if ($cafe) {
            $cafe->nguyenLieu()->attach($ingredients['Cà Phê Robusta Buôn Ma Thuột']->id, [
                'so_luong_dinh_luong' => 0.05,
            ]);
            $cafe->nguyenLieu()->attach($ingredients['Sữa Tươi New Zealand']->id, [
                'so_luong_dinh_luong' => 0.10,
            ]);
        }

        // 10. Seed Dữ liệu báo cáo mẫu định kỳ (Báo cáo 7 phần quản lý)
        \App\Models\BaoCaoQuanLy::create([
            'ma_bao_cao' => 'BC-' . now()->subDay()->format('Ymd') . '-01',
            'ngay_lap' => now()->subDay()->toDateString(),
            'nguoi_lap' => 'M&S Admin',
            'ca_lam_viec' => 'Sáng',
            'tong_so_hoa_don' => 12,
            'tong_luong_khach' => 28,
            'tong_doanh_thu' => 450000,
            'doanh_thu_tien_mat' => 150000,
            'doanh_thu_chuyen_khoan' => 300000,
            'doanh_thu_theo_mon' => [
                'Phở Bò M&S' => 6,
                'Bún Chả M&S' => 4,
                'Nước Cam Ép' => 2
            ],
            'doanh_thu_theo_khu_vuc' => [
                'Tầng 1' => 300000,
                'Tầng 2' => 150000
            ],
            'tong_don_hang' => 12,
            'don_hoan_thanh' => 12,
            'don_huy' => 0,
            'don_dang_xu_ly' => 0,
            'mon_ban_chay' => 'Phở Bò M&S (6 đĩa)',
            'mon_ban_it' => 'Nước Cam Ép (2 ly)',
            'so_luong_mon_da_ban' => [
                'Phở Bò M&S' => 6,
                'Bún Chả M&S' => 4,
                'Nước Cam Ép' => 2
            ],
            'nguyen_lieu_nhap' => [
                'Thịt Bò Úc nhập khẩu' => '50 kg'
            ],
            'nguyen_lieu_dung' => [
                'Thịt Bò Úc' => '0.9 kg'
            ],
            'nguyen_lieu_ton_cuoi' => [
                'Thịt Bò Úc' => '24.6 kg'
            ],
            'nguyen_lieu_sap_het' => [
                'Bơ Lạt Pháp' => 'Tồn 8.2 kg'
            ],
            'so_nhan_vien' => 4,
            'so_gio_lam' => 8,
            'hieu_suat' => 'Xuất sắc',
            'phan_hoi_khach' => 'Khách khen Phở Bò ngon ngọt nước xương.',
            'su_co' => 'Không có',
            'de_xuat' => 'Duy trì chất lượng phục vụ hiện tại.',
        ]);

        \App\Models\BaoCaoQuanLy::create([
            'ma_bao_cao' => 'BC-' . now()->subDay()->format('Ymd') . '-02',
            'ngay_lap' => now()->subDay()->toDateString(),
            'nguoi_lap' => 'M&S Admin',
            'ca_lam_viec' => 'Chiều',
            'tong_so_hoa_don' => 18,
            'tong_luong_khach' => 42,
            'tong_doanh_thu' => 780000,
            'doanh_thu_tien_mat' => 280000,
            'doanh_thu_chuyen_khoan' => 500000,
            'doanh_thu_theo_mon' => [
                'Lẩu Thái Hải Sản' => 2,
                'Bò Nướng Ngói' => 4,
                'Cà Phê Sữa Đá M&S' => 6
            ],
            'doanh_thu_theo_khu_vuc' => [
                'Tầng 1' => 480000,
                'Tầng 2' => 300000
            ],
            'tong_don_hang' => 19,
            'don_hoan_thanh' => 18,
            'don_huy' => 1,
            'don_dang_xu_ly' => 0,
            'mon_ban_chay' => 'Cà Phê Sữa Đá M&S (6 ly)',
            'mon_ban_it' => 'Lẩu Thái Hải Sản (2 nồi)',
            'so_luong_mon_da_ban' => [
                'Lẩu Thái Hải Sản' => 2,
                'Bò Nướng Ngói' => 4,
                'Cà Phê Sữa Đá M&S' => 6
            ],
            'nguyen_lieu_nhap' => [],
            'nguyen_lieu_dung' => [
                'Sữa Tươi' => '0.6 lít',
                'Cà Phê' => '0.3 kg'
            ],
            'nguyen_lieu_ton_cuoi' => [
                'Sữa Tươi New Zealand' => '44.4 lít',
                'Cà Phê Buôn Ma Thuột' => '29.7 kg'
            ],
            'nguyen_lieu_sap_het' => [],
            'so_nhan_vien' => 5,
            'so_gio_lam' => 8,
            'hieu_suat' => 'Tốt',
            'phan_hoi_khach' => 'Khách góp ý quán hơi ồn vào giờ cao điểm.',
            'su_co' => 'Hủy 1 đơn nước cam ép do khách đổi ý.',
            'de_xuat' => 'Mở nhạc nhẹ hơn để giảm tiếng ồn.',
        ]);
    }
}
