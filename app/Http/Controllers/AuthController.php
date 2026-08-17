<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * AuthController - Bộ điều khiển xử lý Xác thực (Đăng nhập, Đăng ký, Đăng xuất)
 *
 * Bộ điều khiển này quản lý toàn bộ luồng đăng nhập, đăng ký tài khoản mới và
 * đăng xuất của hệ thống. Nó giải thích cách sử dụng thư viện Auth có sẵn của Laravel,
 * cách xác thực dữ liệu đầu vào (Validation) và cách làm việc với Session.
 */
class AuthController extends Controller
{
    /**
     * Hiển thị giao diện đăng nhập
     *
     * GET /login
     */
    public function showLogin()
    {
        // Kiểm tra xem người dùng đã đăng nhập trước đó chưa bằng helper Auth::check()
        // Nếu đã đăng nhập, tự động chuyển hướng họ về trang mặc định theo vai trò (role)
        if (Auth::check()) {
            return redirect($this->getRedirectUrl(Auth::user()->role));
        }

        // Nếu chưa đăng nhập, trả về view giao diện đăng nhập nằm ở: resources/views/auth/login.blade.php
        return view('auth.login');
    }

    /**
     * Xử lý đăng nhập khi người dùng bấm nút gửi form
     *
     * POST /login
     */
    public function login(Request $request)
    {
        // 1. Xác thực dữ liệu đầu vào (Validation)
        $credentials = $request->validate([
            'email' => 'required|email|max:100',
            'password' => 'required|string|min:6',
        ], [
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.',
        ]);

        // 2. Tiến hành kiểm tra thông tin đăng nhập trong Cơ sở dữ liệu
        if (Auth::attempt($credentials, $request->has('remember'))) {

            // Nếu đăng nhập thành công, tạo lại mã định danh Session
            $request->session()->regenerate();

            $user = Auth::user(); // Lấy thông tin của người dùng hiện tại vừa đăng nhập
            $roleName = $this->getRoleNameVi($user->role); // Lấy tên tiếng Việt của vai trò để chào mừng

            if ($user->role === 'khach_hang') {
                return redirect($this->getRedirectUrl($user->role))
                    ->with('success', 'Chào mừng quay trở lại, '.$user->name.'!')
                    ->with('show_offer_modal', true);
            }

            return redirect()->intended($this->getRedirectUrl($user->role))
                ->with('success', 'Chào mừng quay trở lại, '.$user->name.' ('.$roleName.')!');
        }

        // 3. Nếu đăng nhập thất bại
        return back()->withErrors([
            'email' => 'Thông tin đăng nhập không chính xác hoặc tài khoản không tồn tại.',
        ])->onlyInput('email');
    }

    /**
     * Hiển thị giao diện đăng ký tài khoản mới
     *
     * GET /register
     */
    public function showRegister()
    {
        return view('auth.register');
    }

    /**
     * Xử lý đăng ký tài khoản mới khi người dùng gửi form
     *
     * POST /register
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:admin,nhan_vien,bep,khach_hang',
        ], [
            'name.required' => 'Họ tên không được để trống.',
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.min' => 'Mật khẩu phải từ 6 ký tự.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'role.required' => 'Vui lòng chọn vai trò.',
            'role.in' => 'Vai trò không hợp lệ.',
        ]);

        // 2. Tạo bản ghi User mới trong cơ sở dữ liệu
        // Mật khẩu bắt buộc phải được mã hóa bảo mật bằng Hash::make() trước khi lưu xuống.
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // 3. Tự động đăng nhập cho User vừa đăng ký thành công
        Auth::login($user);

        $roleName = $this->getRoleNameVi($user->role);

        // Chuyển hướng người dùng về trang giao diện tương ứng với vai trò của họ
        return redirect($this->getRedirectUrl($user->role))
            ->with('success', 'Đăng ký tài khoản thành công! Bạn đã đăng nhập với vai trò '.$roleName.'.');
    }

    /**
     * Xử lý đăng xuất tài khoản
     *
     * POST /logout
     */
    public function logout(Request $request)
    {
        // 1. Thực hiện đăng xuất tài khoản khỏi hệ thống
        Auth::logout();

        // 2. Xóa bỏ tất cả thông tin trong Session hiện tại
        $request->session()->invalidate();

        // 3. Tạo lại mã bảo mật CSRF token mới cho Session tiếp theo để phòng chống tấn công chéo
        $request->session()->regenerateToken();

        // Quay lại trang đăng nhập kèm thông báo
        return redirect()->route('login')->with('success', 'Đã đăng xuất khỏi hệ thống thành công.');
    }

    /**
     * Hàm hỗ trợ lấy tên hiển thị tiếng Việt cho từng vai trò người dùng
     */
    private function getRoleNameVi($role)
    {
        $names = [
            'admin' => 'Ban điều hành (Admin)',
            'nhan_vien' => 'Nhân viên phục vụ',
            'bep' => 'Nhà bếp (KDS)',
            'khach_hang' => 'Khách hàng',
        ];

        return $names[$role] ?? $role;
    }

    /**
     * Xác định URL chuyển hướng mặc định theo từng vai trò sau khi đăng nhập/đăng ký
     */
    private function getRedirectUrl($role)
    {
        if ($role === 'bep') {
            return route('dat_mon.bep');
        }
        if ($role === 'khach_hang') {
            return route('dat_mon.qr_order', 1);
        }
        return route('ban.index');
    }
}
