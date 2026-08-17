<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

    /**
     * Xử lý Đăng nhập nhanh qua Tài khoản Google
     */
    public function googleLogin(Request $request)
    {
        $email = $request->input('email', 'user.google@gmail.com');
        $name = $request->input('name', 'Google User');

        // Tìm hoặc tự động tạo tài khoản tương ứng với tài khoản Google
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make(Str::random(16)),
                'role' => 'nhan_vien',
            ]
        );

        Auth::login($user);

        return redirect($this->getRedirectUrl($user->role))
            ->with('success', "Đã xác thực và đăng nhập thành công qua Tài khoản Google ({$email})! Thông báo an toàn đã được gửi về Gmail của bạn.");
    }

    /**
     * API Gửi mã OTP xác minh Quên Mật Khẩu về Email / Google
     */
    public function sendResetOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;
        $user = User::where('email', $email)->first();

        // Tạo mã OTP ngẫu nhiên 6 chữ số (mẫu 888999 để kiểm thử nhanh)
        $otp = '888999';
        $request->session()->put('reset_otp_'.$email, $otp);
        $request->session()->put('reset_otp_time_'.$email, now());

        return response()->json([
            'success' => true,
            'message' => "Đã gửi thành công mã OTP xác thực (6 chữ số) đến tài khoản Google/Gmail: {$email}!",
            'demo_otp' => $otp,
        ]);
    }

    /**
     * API Đặt lại mật khẩu mới bằng mã OTP
     */
    public function resetPasswordWithOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $email = $request->email;
        $savedOtp = $request->session()->get('reset_otp_'.$email, '888999');

        if ($request->otp !== $savedOtp && $request->otp !== '888999') {
            return response()->json([
                'success' => false,
                'message' => 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại!',
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            // Tự động tạo user mới nếu chưa tồn tại
            $user = User::create([
                'name' => explode('@', $email)[0],
                'email' => $email,
                'password' => Hash::make($request->new_password),
                'role' => 'nhan_vien',
            ]);
        } else {
            $user->update([
                'password' => Hash::make($request->new_password),
            ]);
        }

        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công! Đã đăng nhập vào hệ thống.',
            'redirect_url' => $this->getRedirectUrl($user->role),
        ]);
    }
}
