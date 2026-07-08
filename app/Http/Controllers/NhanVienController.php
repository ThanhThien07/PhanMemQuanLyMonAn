<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * Lớp NhanVienController - Quản lý Danh sách nhân sự và phân quyền tài khoản
 *
 * Cho phép ban điều hành thực hiện các chức năng Xem danh sách, Thêm mới, Sửa quyền hạn,
 * Cập nhật mật khẩu mới và Xóa tài khoản nhân viên phục vụ, bếp, admin.
 */
class NhanVienController extends Controller
{
    /**
     * Hiển thị danh sách nhân sự của nhà hàng, lọc theo tên/email hoặc vai trò
     *
     * GET /quan-ly/nhan-vien-quan-ly
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $role = $request->input('role');

        $query = User::query();

        // Tìm kiếm theo tên hoặc email
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        // Lọc theo vai trò (admin, nhan_vien, bep)
        if ($role) {
            $query->where('role', $role);
        }

        $employees = $query->orderBy('role')->orderBy('name')->get();

        return view('nhan_vien.index', compact('employees', 'search', 'role'));
    }

    /**
     * Tạo tài khoản nhân viên mới và mã hóa mật khẩu
     *
     * POST /quan-ly/nhan-vien-quan-ly
     */
    public function store(Request $request)
    {
        // Xác thực dữ liệu: Email phải là duy nhất để tránh trùng đăng nhập
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,nhan_vien,bep',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password), // Mã hóa mật khẩu lưu kho
            'role' => $request->role,
        ]);

        return redirect()->back()->with('success', 'Đã thêm tài khoản nhân viên "'.$request->name.'" thành công!');
    }

    /**
     * Cập nhật hồ sơ tài khoản nhân sự (Tên, Email, Quyền hạn, Mật khẩu tùy chọn)
     *
     * PUT/PATCH /quan-ly/nhan-vien-quan-ly/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Xác thực: Loại trừ email của chính tài khoản đang sửa
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6', // Cho phép để trống nếu không đổi mật khẩu
            'role' => 'required|string|in:admin,nhan_vien,bep',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        // Nếu quản trị viên có nhập mật khẩu mới, băm mật khẩu và gán vào dữ liệu cập nhật
        if ($request->password) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'Đã cập nhật thông tin nhân viên "'.$request->name.'" thành công!');
    }

    /**
     * Xóa tài khoản nhân viên khỏi hệ thống (Có ràng buộc an toàn)
     *
     * DELETE /quan-ly/nhan-vien-quan-ly/{id}
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Ngăn chặn xóa tài khoản quản trị tối cao mặc định để bảo vệ hệ thống không bị khóa quyền
        if ($user->email === 'admin@ms.com') {
            return redirect()->back()->with('warning', 'Không thể xóa tài khoản Quản trị viên hệ thống mặc định!');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->back()->with('success', 'Đã xóa tài khoản nhân viên "'.$name.'" thành công!');
    }
}
