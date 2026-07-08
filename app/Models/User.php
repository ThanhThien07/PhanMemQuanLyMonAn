<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Lớp Model User - Tài khoản Người dùng / Nhân sự trong hệ thống
 * 
 * Đại diện cho các thành viên nhân viên phục vụ, nhà bếp hoặc ban điều hành (admin).
 * Kế thừa Authenticatable để thực hiện chức năng đăng nhập, đăng xuất bảo mật.
 */
#[Fillable(['name', 'email', 'password', 'role'])] // Thêm 'role' vào Fillable để hỗ trợ phân quyền
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Khai báo kiểu dữ liệu ép kiểu tự động (Casts) cho các thuộc tính đặc biệt.
     * 
     * Mật khẩu tự động băm (hashed) khi gán giá trị mới.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // Băm mật khẩu tự động bằng bcrypt
        ];
    }
}
