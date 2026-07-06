<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class NhanVienController extends Controller
{
    /**
     * Display a listing of the staff members.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $role = $request->input('role');

        $query = User::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($role) {
            $query->where('role', $role);
        }

        $employees = $query->orderBy('role')->orderBy('name')->get();

        return view('nhan_vien.index', compact('employees', 'search', 'role'));
    }

    /**
     * Store a newly created staff member in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,nhan_vien,bep',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
        ]);

        return redirect()->back()->with('success', 'Đã thêm tài khoản nhân viên "' . $request->name . '" thành công!');
    }

    /**
     * Update the specified staff member in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:admin,nhan_vien,bep',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->password) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'Đã cập nhật thông tin nhân viên "' . $request->name . '" thành công!');
    }

    /**
     * Remove the specified staff member from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Ngăn chặn xóa chính mình (nếu đăng nhập, ở đây chúng ta kiểm tra bằng admin@ms.com để an toàn)
        if ($user->email === 'admin@ms.com') {
            return redirect()->back()->with('warning', 'Không thể xóa tài khoản Quản trị viên hệ thống mặc định!');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->back()->with('success', 'Đã xóa tài khoản nhân viên "' . $name . '" thành công!');
    }
}
