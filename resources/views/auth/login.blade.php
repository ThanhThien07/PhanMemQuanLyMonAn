<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng Nhập - ResManager | M&S Cuisine</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 CSS & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <style>
        :root {
            --primary-gold: #f59e0b;
            --primary-crimson: #8e192a;
            --secondary-crimson: #72121f;
            --dark-bg: #0b0f19;
            --card-bg: rgba(30, 41, 59, 0.75);
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--dark-bg);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow-x: hidden;
            padding: 20px 10px;
        }

        h1, h2, h3, h4, h5, .font-heading {
            font-family: 'Outfit', sans-serif;
        }

        /* Ambient Glow Background */
        .glow-1 {
            position: fixed;
            top: -15%;
            left: 20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(0,0,0,0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        .glow-2 {
            position: fixed;
            bottom: -15%;
            right: 20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(142, 25, 42, 0.25) 0%, rgba(0,0,0,0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        .login-card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            width: 100%;
            max-width: 480px;
            position: relative;
            z-index: 1;
            overflow: hidden;
        }

        .top-accent-line {
            height: 5px;
            background: linear-gradient(90deg, #f59e0b 0%, #8e192a 50%, #10b981 100%);
        }

        .form-control-dark {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            border-radius: 12px;
            padding: 12px 16px;
            transition: all 0.3s ease;
        }

        .form-control-dark:focus {
            background: rgba(15, 23, 42, 0.9);
            border-color: var(--primary-gold);
            color: #ffffff;
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
        }

        .input-group-text-dark {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--primary-gold);
            border-radius: 12px;
        }

        .btn-gold-action {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            padding: 13px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        .btn-gold-action:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.45);
        }
    </style>
</head>
<body>

    <div class="glow-1"></div>
    <div class="glow-2"></div>

    <div class="login-card">
        <div class="top-accent-line"></div>
        
        <div class="p-4 p-md-5">
            <!-- Header Brand -->
            <div class="text-center mb-4">
                <a href="{{ url('/') }}" class="text-decoration-none d-inline-flex align-items-center gap-2 mb-2">
                    <div class="bg-warning text-dark rounded-3 px-2.5 py-1.5 fs-4 fw-bold">
                        <i class="bi bi-shop"></i>
                    </div>
                    <span class="fs-3 fw-bold text-white font-heading">Res<span class="text-warning">Manager</span></span>
                </a>
                <h4 class="fw-bold text-white mb-1 font-heading">ĐĂNG NHẬP HỆ THỐNG</h4>
                <p class="text-secondary small mb-0">Quản Lý Nhà Hàng & Đặt Món QR Thông Minh M&S</p>
            </div>

            <!-- Flash Alert Messages -->
            @if (session('success'))
                <div class="alert alert-success bg-success bg-opacity-20 text-success border-success border-opacity-30 rounded-3 d-flex align-items-center mb-4" role="alert">
                    <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div class="small fw-semibold">{{ session('success') }}</div>
                </div>
            @endif

            @if ($errors->any())
                <div class="alert alert-danger bg-danger bg-opacity-20 text-danger border-danger border-opacity-30 rounded-3 mb-4" role="alert">
                    <ul class="mb-0 ps-3 small">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Main Login Form -->
            <form id="loginForm" action="{{ route('login') }}" method="POST" class="mb-3">
                @csrf
                
                <!-- Email Input -->
                <div class="mb-3">
                    <label for="email" class="form-label text-white-50 small fw-semibold">Tài Khoản Email</label>
                    <div class="input-group">
                        <span class="input-group-text input-group-text-dark border-end-0"><i class="bi bi-envelope"></i></span>
                        <input type="email" name="email" id="email" class="form-control form-control-dark border-start-0" placeholder="admin@ms.com" value="{{ old('email') }}" required autofocus>
                    </div>
                </div>

                <!-- Password Input with Eye Toggle -->
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <label for="password" class="form-label text-white-50 small fw-semibold mb-0">Mật Khẩu</label>
                        <a href="#" onclick="alert('Vui lòng liên hệ Quản lý hệ thống để được hỗ trợ cấp lại mật khẩu.'); return false;" class="text-warning text-decoration-none small">Quên mật khẩu?</a>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text input-group-text-dark border-end-0"><i class="bi bi-lock"></i></span>
                        <input type="password" name="password" id="password" class="form-control form-control-dark border-start-0 border-end-0" placeholder="••••••••" required>
                        <button class="btn input-group-text-dark border-start-0 px-3 text-secondary" type="button" id="togglePassword">
                            <i class="bi bi-eye" id="eyeIcon"></i>
                        </button>
                    </div>
                </div>

                <!-- Remember Me Checkbox -->
                <div class="form-check mb-4">
                    <input class="form-check-input bg-dark border-secondary" type="checkbox" name="remember" id="remember" checked>
                    <label class="form-check-label text-white-50 small" for="remember">
                        Ghi nhớ đăng nhập trên thiết bị này
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-gold-action w-100 d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-box-arrow-in-right fs-5"></i>
                    <span>ĐĂNG NHẬP NGAY</span>
                </button>
            </form>

            <!-- Footer links -->
            <div class="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                <span class="text-white-50 small">Chưa có tài khoản hệ thống? </span>
                <a href="{{ route('register') }}" class="text-warning text-decoration-none fw-semibold small">Đăng ký mới</a>
                <span class="text-white-50 mx-2">|</span>
                <a href="{{ url('/') }}" class="text-white-50 text-decoration-none small">Về Trang Chủ</a>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        // Password toggle visibility
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');

        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            eyeIcon.classList.toggle('bi-eye');
            eyeIcon.classList.toggle('bi-eye-slash');
        });
    </script>
</body>
</html>
