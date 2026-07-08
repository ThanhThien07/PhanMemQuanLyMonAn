<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng ký nhân sự - Hệ thống M&S</title>
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

  <div class="w-full max-w-[500px]">
    <div class="bg-white rounded-[24px] px-8 py-10 shadow-[0_15px_45px_rgba(142,25,42,0.06)] relative overflow-hidden">
      <!-- Top Accent Line -->
      <div class="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-ms-primary to-ms-secondary"></div>

      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-[70px] h-[70px] rounded-full bg-gradient-to-br from-ms-primary to-ms-secondary text-white text-3xl font-bold shadow-[0_8px_20px_rgba(142,25,42,0.3)] mb-4 border-2 border-white/20">M&S</div>
        <h3 class="fw-bold mb-1 text-ms-primary text-2xl">ĐĂNG KÝ NHÂN SỰ</h3>
        <p class="text-secondary small">Tạo tài khoản phục vụ, nhà bếp hoặc ban điều hành</p>
      </div>

      <!-- Hiển thị lỗi validation -->
      @if ($errors->any())
        <div class="bg-red-500/10 border border-red-500/20 text-red-800 rounded-xl p-3 mb-4" role="alert">
          <ul class="mb-0 ps-3">
            @foreach ($errors->all() as $error)
              <li>{{ $error }}</li>
            @endforeach
          </ul>
        </div>
      @endif

      <form action="{{ route('register') }}" method="POST">
        @csrf
        
        <div class="mb-3">
          <label for="name" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Họ và tên nhân sự</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-person"></i></span>
            <input type="text" name="name" id="name" class="form-control border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" placeholder="Nguyễn Văn A" value="{{ old('name') }}" required>
          </div>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Địa chỉ Email</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-envelope"></i></span>
            <input type="email" name="email" id="email" class="form-control border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" placeholder="a@ms.com" value="{{ old('email') }}" required>
          </div>
        </div>

        <div class="mb-3">
          <label for="role" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Chức vụ nhân sự</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-briefcase"></i></span>
            <select name="role" id="role" class="form-select border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" required>
              <option value="" disabled selected>-- Chọn chức vụ --</option>
              <option value="nhan_vien" {{ old('role') == 'nhan_vien' ? 'selected' : '' }}>Nhân viên phục vụ</option>
              <option value="bep" {{ old('role') == 'bep' ? 'selected' : '' }}>Nhà bếp (Đầu bếp)</option>
              <option value="admin" {{ old('role') == 'admin' ? 'selected' : '' }}>Ban điều hành (Admin)</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-lock"></i></span>
            <input type="password" name="password" id="password" class="form-control border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" placeholder="Tối thiểu 6 ký tự" required>
          </div>
        </div>

        <div class="mb-4">
          <label for="password_confirmation" class="form-label text-[#4a4a4a] text-sm font-medium mb-1.5 d-block">Xác nhận mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-r-0 border-ms-primary/15 text-ms-primary rounded-l-xl px-3.5"><i class="bi bi-lock-fill"></i></span>
            <input type="password" name="password_confirmation" id="password_confirmation" class="form-control border-l-0 border-ms-primary/15 rounded-r-xl px-4 py-3 text-[#2b2b2b] transition-all duration-300 focus:border-ms-secondary focus:ring-4 focus:ring-ms-secondary/20 focus:outline-none" placeholder="Nhập lại mật khẩu" required>
          </div>
        </div>

        <button type="submit" class="w-full py-3 bg-gradient-to-r from-ms-primary to-[#72121f] text-white rounded-xl font-semibold tracking-wide shadow-[0_4px_15_rgba(142,25,42,0.25)] hover:from-[#a62033] hover:to-[#72121f] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(142,25,42,0.35)] transition-all duration-300 mb-3 flex items-center justify-center">
          <i class="bi bi-person-plus me-2"></i>Đăng ký tài khoản
        </button>
      </form>

      <div class="text-center mt-3">
        <span class="text-secondary small">Đã có tài khoản? </span>
        <a href="{{ route('login') }}" class="small fw-semibold text-ms-primary hover:underline hover:text-[#72121f] transition-all">Đăng nhập ngay</a>
      </div>
    </div>
  </div>

</body>
</html>
