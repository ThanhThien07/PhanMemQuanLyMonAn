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
  
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ms: {
              primary: '#8e192a',
              secondary: '#e6b15c',
              dark: '#121212',
              light: '#fdfaf6',
            }
          },
          fontFamily: {
            sans: ['Outfit', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>
<body class="font-sans min-h-screen flex items-center justify-center text-[#2b2b2b] overflow-x-hidden p-4" style="background: radial-gradient(circle at 50% -20%, #fdfaf6 0%, #f6f3eb 50%, #eae5d8 100%);">

  <div class="w-full max-w-[480px]">
    <div class="bg-white rounded-[24px] px-8 py-10 shadow-[0_15px_45px_rgba(142,25,42,0.06)] relative overflow-hidden">
      <!-- Top Accent Line -->
      <div class="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-ms-primary to-ms-secondary"></div>

      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-[70px] h-[70px] rounded-full bg-gradient-to-br from-ms-primary to-ms-secondary text-white text-3xl font-bold shadow-[0_8px_20px_rgba(142,25,42,0.3)] mb-4 border-2 border-white/20">M&S</div>
        <h3 class="fw-bold mb-1 text-ms-primary text-2xl">ĐĂNG NHẬP</h3>
        <p class="text-secondary small">Hệ thống quản lý nhà hàng ẩm thực cao cấp M&S</p>
      </div>

      <!-- Hiển thị thông báo thành công hoặc lỗi -->
      @if (session('success'))
        <div class="bg-green-500/10 border border-green-500/20 text-green-800 rounded-xl p-3 mb-4 d-flex align-items-center" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>{{ session('success') }}</div>
        </div>
      @endif

      @if ($errors->any())
        <div class="bg-red-500/10 border border-red-500/20 text-red-800 rounded-xl p-3 mb-4" role="alert">
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
          <label for="email" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Tài khoản Email</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-envelope"></i></span>
            <input type="email" name="email" id="email" class="form-control border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" placeholder="nhap@example.com" value="{{ old('email') }}" required>
          </div>
        </div>

        <div class="mb-4">
          <label for="password" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-lock"></i></span>
            <input type="password" name="password" id="password" class="form-control border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" placeholder="••••••••" required>
          </div>
        </div>

        <button type="submit" class="w-full py-3 bg-gradient-to-r from-ms-primary to-[#72121f] text-white rounded-xl font-semibold tracking-wide shadow-[0_4px_15_rgba(142,25,42,0.25)] hover:from-[#a62033] hover:to-[#72121f] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(142,25,42,0.35)] transition-all duration-300 mb-4 flex items-center justify-center">
          <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập hệ thống
        </button>
      </form>

      <!-- Quick Login Section for Testing -->
      <div class="pt-3 border-t border-secondary/20">
        <h6 class="small text-secondary mb-2 text-center">Đăng nhập nhanh cho kiểm thử viên:</h6>
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <button class="bg-ms-primary/5 border border-ms-primary/10 rounded-lg text-[#555] text-xs px-3 py-1.5 hover:bg-ms-primary/10 hover:border-ms-primary hover:text-ms-primary transition-all duration-200" onclick="quickLogin('admin@ms.com', 'admin123')">
            <i class="bi bi-shield-lock me-1"></i>Ban điều hành
          </button>
          <button class="bg-ms-primary/5 border border-ms-primary/10 rounded-lg text-[#555] text-xs px-3 py-1.5 hover:bg-ms-primary/10 hover:border-ms-primary hover:text-ms-primary transition-all duration-200" onclick="quickLogin('nhanvien@ms.com', 'nhanvien123')">
            <i class="bi bi-person me-1"></i>Nhân viên
          </button>
          <button class="bg-ms-primary/5 border border-ms-primary/10 rounded-lg text-[#555] text-xs px-3 py-1.5 hover:bg-ms-primary/10 hover:border-ms-primary hover:text-ms-primary transition-all duration-200" onclick="quickLogin('bep@ms.com', 'bep123')">
            <i class="bi bi-egg-fried me-1"></i>Nhà bếp
          </button>
        </div>
      </div>

      <div class="text-center mt-4">
        <span class="text-secondary small">Chưa có tài khoản nhân viên? </span>
        <a href="{{ route('register') }}" class="small fw-semibold text-ms-primary hover:underline hover:text-[#72121f] transition-all">Đăng ký ngay</a>
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
