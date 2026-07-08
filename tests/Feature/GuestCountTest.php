<?php

namespace Tests\Feature;

use App\Models\Ban;
use App\Models\BaoCaoQuanLy;
use App\Models\DatMon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_count_flow(): void
    {
        $this->withoutExceptionHandling();

        // 1. Tạo bàn test (Bàn 7)
        $ban = Ban::create([
            'id' => 7,
            'ten' => 'Bàn 7',
            'trang_thai' => 'Trong',
            'so_luong_khach' => 0,
        ]);

        // 2. Kiểm tra truy cập trang QR Order lần đầu
        $response = $this->get("/qr-order/{$ban->id}");
        $response->assertStatus(200);
        $response->assertSee('guestCountInitModal');
        $response->assertSee('SỐ KHÁCH DÙNG BỮA');

        // 3. Gọi API cập nhật số khách (ví dụ 4 khách)
        $response = $this->postJson("/qr-order/{$ban->id}/cap-nhat-so-khach", [
            'so_luong_khach' => 4,
        ]);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'so_luong_khach' => 4,
        ]);

        $ban->refresh();
        $this->assertEquals(4, $ban->so_luong_khach);

        // 4. Gọi món lần đầu (Order 1) - số lượng khách của đơn này phải bằng 4
        $response = $this->postJson("/qr-order/{$ban->id}/order", [
            'ten_mon' => 'Cơm chiên hải sản',
            'don_gia' => 95000,
            'thoi_gian_uoc_tinh' => 12,
            'so_luong' => 2,
            'ghi_chu' => 'Không cay',
            'thu_tu_uu_tien' => 1,
        ]);
        $response->assertStatus(200);

        $order1 = DatMon::where('ban_id', $ban->id)->orderBy('id', 'desc')->first();
        $this->assertNotNull($order1);
        $this->assertEquals(4, $order1->so_luong_khach);

        // 5. Gọi món lần hai (Order 2) - số lượng khách của đơn này phải bằng 0 (tránh tính trùng)
        $response = $this->postJson("/qr-order/{$ban->id}/order", [
            'ten_mon' => 'Coca Cola',
            'don_gia' => 15000,
            'thoi_gian_uoc_tinh' => 3,
            'so_luong' => 2,
            'ghi_chu' => 'Lạnh',
            'thu_tu_uu_tien' => 1,
        ]);
        $response->assertStatus(200);

        $order2 = DatMon::where('ban_id', $ban->id)->orderBy('id', 'desc')->first();
        $this->assertNotNull($order2);
        $this->assertEquals(0, $order2->so_luong_khach);

        // Đánh dấu các đơn này đã thanh toán để đưa vào báo cáo
        $order1->update(['trang_thai' => 'da_thanh_toan']);
        $order2->update(['trang_thai' => 'da_thanh_toan']);

        // 6. Test logic kết xuất báo cáo trong storeBaoCao
        // Đăng nhập một admin để gọi storeBaoCao
        $admin = new User;
        $admin->name = 'Admin Test';
        $admin->email = 'admin@test.com';
        $admin->password = bcrypt('password');
        $admin->role = 'admin';
        $admin->save();

        $response = $this->actingAs($admin)
            ->post('/quan-ly/bao-cao/luu', [
                'ngay_lap' => date('Y-m-d'),
                'ca_lam_viec' => 'Sáng',
                'so_nhan_vien' => 4,
                'so_gio_lam' => 8,
            ]);

        $response->assertStatus(302); // Redirect back with success message

        // Lấy báo cáo vừa lưu để kiểm tra lượng khách
        $report = BaoCaoQuanLy::orderBy('id', 'desc')->first();
        $this->assertNotNull($report);
        // Lượng khách phải tối thiểu là 4
        $this->assertTrue($report->tong_luong_khach >= 4);

        // 7. Test reset số lượng khách khi checkout bàn ăn
        $ban->update(['trang_thai' => 'Da_goi']); // Giả lập bàn đang có khách gọi tiếp

        $response = $this->actingAs($admin)
            ->post("/ban/thanh-toan/{$ban->id}", [
                'sdt' => '',
                'khach_hang_ten' => '',
            ]);

        $response->assertStatus(302);
        $ban->refresh();
        // Sau khi checkout, bàn ăn phải về trạng thái Trống và số lượng khách reset về 0
        $this->assertEquals('Trong', $ban->trang_thai);
        $this->assertEquals(0, $ban->so_luong_khach);
    }
}
