<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng nhập - Hệ thống M&S</title>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  
  <style>
    :root {
      --primary-color: #8c1d40; /* Crimson Red */
      --secondary-color: #d4af37; /* Gold */
      --dark-color: #1a1a1a;
      --bg-cream: #faf7f2;
    }
    
    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at 10% 20%, rgba(140, 29, 64, 0.15) 0%, rgba(26, 26, 26, 0.95) 80%);
      background-size: cover;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      overflow-x: hidden;
    }

    .login-container {
      width: 100%;
      max-width: 480px;
      padding: 15px;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    }

    .logo-container {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: #white;
      font-size: 2rem;
      font-weight: 700;
      box-shadow: 0 8px 20px rgba(140, 29, 64, 0.4);
      margin-bottom: 15px;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .form-label {
      color: #ddd;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .form-control {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      color: #fff;
      padding: 12px 16px;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 0.25rem rgba(212, 175, 55, 0.25);
      color: #fff;
    }

    .btn-premium {
      background: linear-gradient(135deg, var(--primary-color) 0%, #63122b 100%);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(140, 29, 64, 0.3);
    }

    .btn-premium:hover {
      background: linear-gradient(135deg, #a0224a 0%, #7d1837 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(140, 29, 64, 0.5);
      color: #fff;
    }

    .quick-login-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #ccc;
      font-size: 0.8rem;
      padding: 6px 12px;
      transition: all 0.2s ease;
    }

    .quick-login-btn:hover {
      background: rgba(212, 175, 55, 0.15);
      border-color: var(--secondary-color);
      color: #fff;
    }

    .alert-custom {
      background: rgba(220, 53, 69, 0.15);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #f8d7da;
      border-radius: 12px;
    }
    
    .alert-success-custom {
      background: rgba(25, 135, 84, 0.15);
      border: 1px solid rgba(25, 135, 84, 0.3);
      color: #d1e7dd;
      border-radius: 12px;
    }
  </style>
</head>
<body>

  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <div class="logo-badge">M&S</div>
        <h3 class="fw-bold mb-1 text-white">ĐĂNG NHẬP</h3>
        <p class="text-secondary small">Hệ thống quản lý nhà hàng ẩm thực cao cấp M&S</p>
      </div>

      <!-- Hiển thị thông báo thành công hoặc lỗi -->
      @if (session('success'))
        <div class="alert alert-success-custom p-3 mb-4 d-flex align-items-center" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>{{ session('success') }}</div>
        </div>
      @endif

      @if ($errors->any())
        <div class="alert alert-custom p-3 mb-4" role="alert">
          <ul class="mb-0 ps-3">
            @foreach ($errors->all() as $error)
              <li>{{ $error }}</li>
            @endforeach
          </ul>
        </div>
      @endif

      <form action="{{ route('login') }}" method="POST">
        @csrf
        <div class="mb-3">
          <label for="email" class="form-label">Tài khoản Email</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0 text-secondary" style="border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px 0 0 12px;"><i class="bi bi-envelope"></i></span>
            <input type="email" name="email" id="email" class="form-control border-start-0" style="border-radius: 0 12px 12px 0;" placeholder="nhap@example.com" value="{{ old('email') }}" required>
          </div>
        </div>

        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label for="password" class="form-label mb-0">Mật khẩu</label>
          </div>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0 text-secondary" style="border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px 0 0 12px;"><i class="bi bi-lock"></i></span>
            <input type="password" name="password" id="password" class="form-control border-start-0" style="border-radius: 0 12px 12px 0;" placeholder="••••••••" required>
          </div>
        </div>

        <button type="submit" class="btn btn-premium w-100 mb-4 py-2.5">
          <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập hệ thống
        </button>
      </form>

      <!-- Quick Login Section for Testing -->
      <div class="pt-3 border-top border-secondary border-opacity-25">
        <h6 class="small text-secondary mb-2 text-center">Đăng nhập nhanh cho kiểm thử viên:</h6>
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <button class="quick-login-btn" onclick="quickLogin('admin@ms.com', 'admin123')">
            <i class="bi bi-shield-lock me-1"></i>Ban điều hành
          </button>
          <button class="quick-login-btn" onclick="quickLogin('nhanvien@ms.com', 'nhanvien123')">
            <i class="bi bi-person me-1"></i>Nhân viên
          </button>
          <button class="quick-login-btn" onclick="quickLogin('bep@ms.com', 'bep123')">
            <i class="bi bi-egg-fried me-1"></i>Nhà bếp
          </button>
        </div>
      </div>

      <div class="text-center mt-4">
        <span class="text-secondary small">Chưa có tài khoản nhân viên? </span>
        <a href="{{ route('register') }}" class="small fw-semibold" style="color: var(--secondary-color); text-decoration: none;">Đăng ký ngay</a>
      </div>
    </div>
  </div>

  <script>
    function quickLogin(email, password) {
      document.getElementById('email').value = email;
      document.getElementById('password').value = password;
    }
  </script>
</body>
</html>
