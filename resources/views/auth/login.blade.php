<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng Nhập - M&S Cuisine | ResManager Pro</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 CSS & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Tailwind Play CDN for utility styles -->
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        :root {
            --primary-gold: #f59e0b;
            --primary-crimson: #8e192a;
            --secondary-crimson: #72121f;
            --dark-bg: #0b0f19;
            --card-bg: rgba(15, 23, 42, 0.85);
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
            padding: 30px 15px;
        }

        h1, h2, h3, h4, h5, .font-heading {
            font-family: 'Outfit', sans-serif;
        }

        /* Animated Particle Mesh Background */
        .ambient-glow-1 {
            position: fixed;
            top: -15%;
            left: 15%;
            width: 550px;
            height: 550px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(0,0,0,0) 70%);
            z-index: 0;
            pointer-events: none;
            animation: pulseGlow 8s ease-in-out infinite alternate;
        }

        .ambient-glow-2 {
            position: fixed;
            bottom: -15%;
            right: 15%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(142, 25, 42, 0.25) 0%, rgba(0,0,0,0) 70%);
            z-index: 0;
            pointer-events: none;
            animation: pulseGlow 10s ease-in-out infinite alternate-reverse;
        }

        @keyframes pulseGlow {
            0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
            100% { transform: scale(1.15) translate(20px, -20px); opacity: 1; }
        }

        .login-card {
            background: var(--card-bg);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 28px;
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7);
            width: 100%;
            max-width: 480px;
            position: relative;
            z-index: 2;
            overflow: hidden;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .top-accent-line {
            height: 6px;
            background: linear-gradient(90deg, #f59e0b 0%, #8e192a 50%, #10b981 100%);
        }

        /* MASCOT STYLES & INTERACTION */
        .mascot-container {
            width: 160px;
            height: 160px;
            margin: 0 auto -10px;
            position: relative;
            cursor: pointer;
        }

        .mascot-svg {
            width: 100%;
            height: 100%;
            overflow: visible;
        }

        /* Paw Animations */
        .paw-left, .paw-right {
            transition: transform 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform-origin: center bottom;
        }

        .pupil-left, .pupil-right {
            transition: transform 0.1s linear;
        }

        /* Form styling */
        .form-control-dark {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            border-radius: 14px;
            padding: 13px 16px;
            transition: all 0.3s ease;
        }

        .form-control-dark:focus {
            background: rgba(15, 23, 42, 0.95);
            border-color: var(--primary-gold);
            color: #ffffff;
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
        }

        .input-group-text-dark {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--primary-gold);
            border-radius: 14px;
        }

        .btn-gold-action {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff;
            font-weight: 700;
            border: none;
            border-radius: 14px;
            padding: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
        }

        .btn-gold-action:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(245, 158, 11, 0.5);
        }

        .btn-google-login {
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            font-weight: 600;
            border-radius: 14px;
            padding: 12px;
            transition: all 0.3s ease;
        }

        .btn-google-login:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            border-color: #4285F4;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(66, 133, 244, 0.25);
        }

        .role-badge {
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 11px;
            padding: 5px 12px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .role-badge:hover {
            background: var(--primary-gold);
            color: #000;
            border-color: var(--primary-gold);
            font-weight: 700;
        }

        /* Toast notification popup for Google Account alert */
        .google-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: #ffffff;
            color: #202124;
            border-radius: 16px;
            box-shadow: 0 12px 35px rgba(0,0,0,0.4);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 14px;
            max-width: 380px;
            transform: translateY(-100px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .google-toast.show {
            transform: translateY(0);
            opacity: 1;
        }
    </style>
</head>
<body>

    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <!-- Google Security Alert Toast (Simulated Notification sent to Gmail/Google) -->
    <div class="google-toast" id="googleToast">
        <svg width="28" height="28" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <div>
            <div class="fw-bold text-dark text-xs">CẢNH BÁO BẢO MẬT GOOGLE ACCOUNT</div>
            <div class="text-muted text-xs mt-0.5" id="toastMessage">Thông báo đăng nhập mới đã được gửi về Gmail của bạn!</div>
        </div>
    </div>

    <div class="login-card" id="loginCard">
        <div class="top-accent-line"></div>
        
        <div class="p-4 p-md-5">
            
            <!-- MASCOT CUTE CHEF BEAR (LIVELY INTERACTIVE SVG) -->
            <div class="mascot-container" id="mascot">
                <svg class="mascot-svg" viewBox="0 0 200 200">
                    <!-- Chef Hat -->
                    <g id="chefHat">
                        <path d="M 60 45 C 50 25, 80 10, 100 20 C 120 10, 150 25, 140 45 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
                        <rect x="65" y="42" width="70" height="15" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
                        <rect x="75" y="46" width="50" height="4" rx="2" fill="#8e192a"/>
                    </g>
                    
                    <!-- Bear Ears -->
                    <circle cx="55" cy="65" r="18" fill="#d97706" stroke="#92400e" stroke-width="3"/>
                    <circle cx="55" cy="65" r="10" fill="#fef3c7"/>
                    <circle cx="145" cy="65" r="18" fill="#d97706" stroke="#92400e" stroke-width="3"/>
                    <circle cx="145" cy="65" r="10" fill="#fef3c7"/>
                    
                    <!-- Head Group (Rotates towards cursor) -->
                    <g id="headGroup">
                        <!-- Head Base -->
                        <ellipse cx="100" cy="105" rx="48" ry="42" fill="#f59e0b" stroke="#92400e" stroke-width="3"/>
                        
                        <!-- Snout -->
                        <ellipse cx="100" cy="115" rx="22" ry="16" fill="#fef3c7"/>
                        <!-- Nose -->
                        <ellipse cx="100" cy="108" rx="8" ry="6" fill="#1e293b"/>
                        <!-- Mouth (Changes on happy/error) -->
                        <path id="mouth" d="M 92 118 Q 100 125 108 118" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                        
                        <!-- Cheeks (Blush) -->
                        <circle cx="70" cy="115" r="7" fill="#f43f5e" opacity="0.5"/>
                        <circle cx="130" cy="115" r="7" fill="#f43f5e" opacity="0.5"/>
                        
                        <!-- Eyes Base -->
                        <g id="eyes">
                            <circle cx="78" cy="92" r="11" fill="#ffffff" stroke="#92400e" stroke-width="2"/>
                            <circle class="pupil-left" id="pupilLeft" cx="78" cy="92" r="5" fill="#0f172a"/>
                            <circle cx="76" cy="90" r="2" fill="#ffffff"/> <!-- Shine -->
                            
                            <circle cx="122" cy="92" r="11" fill="#ffffff" stroke="#92400e" stroke-width="2"/>
                            <circle class="pupil-right" id="pupilRight" cx="122" cy="92" r="5" fill="#0f172a"/>
                            <circle cx="120" cy="90" r="2" fill="#ffffff"/> <!-- Shine -->
                        </g>
                    </g>
                    
                    <!-- Paws (Hands covering eyes during password input) -->
                    <!-- Left Paw -->
                    <g class="paw-left" id="pawLeft" transform="translate(0, 0)">
                        <ellipse cx="50" cy="160" rx="16" ry="12" fill="#d97706" stroke="#92400e" stroke-width="3"/>
                        <circle cx="50" cy="158" r="6" fill="#fef3c7"/>
                    </g>
                    
                    <!-- Right Paw -->
                    <g class="paw-right" id="pawRight" transform="translate(0, 0)">
                        <ellipse cx="150" cy="160" rx="16" ry="12" fill="#d97706" stroke="#92400e" stroke-width="3"/>
                        <circle cx="150" cy="158" r="6" fill="#fef3c7"/>
                    </g>
                </svg>
            </div>

            <!-- Header Brand -->
            <div class="text-center mb-4">
                <h3 class="fw-extrabold text-white mb-1 font-heading">ĐĂNG NHẬP <span class="text-warning">M&S CUISINE</span></h3>
                <p class="text-secondary small mb-0">Hệ Thống Quản Lý & Vận Hành Nhà Hàng Thông Minh</p>
            </div>

            <!-- Quick Demo Credentials Badges -->
            <div class="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                <span class="role-badge text-warning" onclick="fillLogin('admin@ms.com', 'admin123', 'Ban điều hành (Admin)')">
                    <i class="bi bi-shield-check me-1"></i>Admin: admin@ms.com
                </span>
                <span class="role-badge text-info" onclick="fillLogin('nhanvien@ms.com', 'nhanvien123', 'Nhân viên Phục vụ')">
                    <i class="bi bi-person-badge me-1"></i>Nhân viên: nhanvien@ms.com
                </span>
                <span class="role-badge text-emerald-400" onclick="fillLogin('bep@ms.com', 'bep123', 'Bếp trưởng KDS')">
                    <i class="bi bi-fire me-1"></i>Bếp: bep@ms.com
                </span>
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
                        <input type="email" name="email" id="email" class="form-control form-control-dark border-start-0" placeholder="admin@ms.com" value="{{ old('email') }}" required autofocus autocomplete="off">
                    </div>
                </div>

                <!-- Password Input with Eye Toggle & Mascot Hide-Eye Effect -->
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <label for="password" class="form-label text-white-50 small fw-semibold mb-0">Mật Khẩu</label>
                        <a href="#" class="text-warning text-decoration-none small font-semibold" data-bs-toggle="modal" data-bs-target="#modalForgotPassword">
                            <i class="bi bi-key me-1"></i>Quên mật khẩu?
                        </a>
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
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                        <input class="form-check-input bg-dark border-secondary" type="checkbox" name="remember" id="remember" checked>
                        <label class="form-check-label text-white-50 small" for="remember">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" id="btnSubmit" class="btn btn-gold-action w-100 d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-box-arrow-in-right fs-5"></i>
                    <span>ĐĂNG NHẬP HỆ THỐNG</span>
                </button>
            </form>

            <div class="relative flex py-2 items-center">
                <div class="flex-grow border-t border-gray-700"></div>
                <span class="flex-shrink mx-4 text-gray-400 text-xs font-semibold">HOẶC ĐĂNG NHẬP TRỰC TIẾP</span>
                <div class="flex-grow border-t border-gray-700"></div>
            </div>

            <!-- GOOGLE QUICK LOGIN BUTTON -->
            <form method="POST" action="{{ route('login.google') }}" id="googleForm" class="mt-2">
                @csrf
                <input type="hidden" name="email" id="googleEmail" value="user.google@gmail.com">
                <input type="hidden" name="name" id="googleName" value="Google Account User">
                <button type="button" onclick="triggerGoogleAuthModal()" class="btn btn-google-login w-100 d-flex align-items-center justify-content-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Đăng nhập trực tiếp bằng Google</span>
                </button>
            </form>

            <!-- Footer links -->
            <div class="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                <span class="text-white-50 small">Chưa có tài khoản? </span>
                <a href="{{ route('register') }}" class="text-warning text-decoration-none fw-semibold small">Đăng ký mới</a>
                <span class="text-white-50 mx-2">|</span>
                <a href="{{ url('/') }}" class="text-white-50 text-decoration-none small">Về Trang Chủ</a>
            </div>
        </div>
    </div>

    <!-- MODAL GOOGLE ACCOUNT CHOOSE -->
    <div class="modal fade" id="modalGoogleAuth" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl">
                <div class="modal-header border-slate-800 p-4">
                    <h6 class="modal-title font-bold text-amber-400 d-flex align-items-center gap-2">
                        <i class="bi bi-google"></i>Chọn Tài Khoản Google
                    </h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 text-center">
                    <div class="p-3 bg-slate-800 rounded-xl mb-3 cursor-pointer hover:bg-slate-700 transition" onclick="submitGoogleLogin('admin.google@gmail.com', 'M&S Manager')">
                        <div class="fw-bold text-white">M&S Manager Google</div>
                        <div class="text-xs text-amber-400">admin.google@gmail.com</div>
                    </div>
                    <div class="p-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition" onclick="submitGoogleLogin('staff.google@gmail.com', 'Staff Google User')">
                        <div class="fw-bold text-white">Staff Service Google</div>
                        <div class="text-xs text-blue-400">staff.google@gmail.com</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL QUÊN MẬT KHẨU QUA GMAIL / OTP -->
    <div class="modal fade" id="modalForgotPassword" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl">
                <div class="modal-header border-slate-800 bg-slate-800/50 p-4">
                    <h5 class="modal-title font-bold text-amber-400 d-flex align-items-center gap-2">
                        <i class="bi bi-shield-lock-fill"></i>Khôi Phục Mật Khẩu Qua Google / Gmail
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <!-- Step 1: Input Email -->
                    <div id="otpStep1">
                        <p class="text-slate-300 text-sm mb-3">Nhập tài khoản Email/Google của bạn để nhận mã xác thực OTP 6 chữ số:</p>
                        <div class="mb-3">
                            <label class="form-label text-xs font-semibold text-slate-400">Tài khoản Email</label>
                            <input type="email" id="forgotEmail" class="form-control form-control-dark" value="admin@ms.com" placeholder="VD: admin@ms.com">
                        </div>
                        <button type="button" onclick="sendOtpRequest()" class="btn btn-gold-action w-100 font-bold">
                            <i class="bi bi-send me-1"></i>GỬI MÃ OTP VỀ GMAIL
                        </button>
                    </div>

                    <!-- Step 2: Input OTP & New Password -->
                    <div id="otpStep2" style="display: none;">
                        <div class="alert alert-success bg-emerald-950/80 border-emerald-500/50 text-emerald-300 rounded-xl text-xs mb-3" id="otpSuccessAlert">
                            Đã gửi mã OTP đến Gmail! Nhập mã OTP bên dưới.
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-xs font-semibold text-slate-400">Mã OTP Xác Thực (6 chữ số)</label>
                            <div class="d-flex gap-2 justify-content-between">
                                <input type="text" id="inputOtp" class="form-control form-control-dark text-center font-mono text-xl tracking-widest font-bold" value="888999" placeholder="888999" maxlength="6">
                            </div>
                            <small class="text-amber-400 text-xs mt-1 d-block">💡 Mã OTP test nhanh: <strong>888999</strong></small>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-xs font-semibold text-slate-400">Mật Khẩu Mới</label>
                            <input type="password" id="forgotNewPassword" class="form-control form-control-dark" placeholder="Nhập mật khẩu mới từ 6 ký tự">
                        </div>
                        <button type="button" onclick="verifyOtpAndResetPassword()" class="btn btn-emerald-600 hover:btn-emerald-500 text-white font-bold w-100 py-3 rounded-xl shadow-lg transition">
                            <i class="bi bi-check-circle me-1"></i>XÁC NHẬN ĐỔI MẬT KHẨU & ĐĂNG NHẬP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- LIVELY MASCOT & INTERACTIVE JS -->
    <script>
        const mascot = document.getElementById('mascot');
        const headGroup = document.getElementById('headGroup');
        const pupilLeft = document.getElementById('pupilLeft');
        const pupilRight = document.getElementById('pupilRight');
        const pawLeft = document.getElementById('pawLeft');
        const pawRight = document.getElementById('pawRight');
        const mouth = document.getElementById('mouth');

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('togglePassword');
        const eyeIcon = document.getElementById('eyeIcon');
        const googleToast = document.getElementById('googleToast');
        const toastMessage = document.getElementById('toastMessage');

        // 1. EYE TRACKING CURSOR & EMAIL TYPING EFFECT
        document.addEventListener('mousemove', (e) => {
            if (document.activeElement === passwordInput) return; // Don't track eyes if password is focused

            const rect = mascot.getBoundingClientRect();
            const mascotX = rect.left + rect.width / 2;
            const mascotY = rect.top + rect.height / 2;

            const angleX = (e.clientX - mascotX) / window.innerWidth * 15;
            const angleY = (e.clientY - mascotY) / window.innerHeight * 15;

            // Rotate head slightly towards mouse
            headGroup.style.transform = `rotate(${angleX * 0.5}deg)`;

            // Move pupils
            pupilLeft.style.transform = `translate(${angleX * 0.6}px, ${angleY * 0.6}px)`;
            pupilRight.style.transform = `translate(${angleX * 0.6}px, ${angleY * 0.6}px)`;
        });

        // Email input typing eye tracking
        emailInput.addEventListener('input', (e) => {
            const charCount = e.target.value.length;
            const moveX = Math.min(Math.max((charCount - 15) * 0.8, -8), 8);
            pupilLeft.style.transform = `translate(${moveX}px, 3px)`;
            pupilRight.style.transform = `translate(${moveX}px, 3px)`;
        });

        // 2. PASSWORD INPUT HIDE EYES (COVER FACE WITH PAWS!)
        passwordInput.addEventListener('focus', () => {
            coverEyes();
        });

        passwordInput.addEventListener('blur', () => {
            if (passwordInput.getAttribute('type') === 'password') {
                uncoverEyes();
            }
        });

        function coverEyes() {
            pawLeft.style.transform = 'translate(28px, -58px) rotate(45deg)';
            pawRight.style.transform = 'translate(-28px, -58px) rotate(-45deg)';
        }

        function peekEyes() {
            pawLeft.style.transform = 'translate(20px, -40px) rotate(25deg)';
            pawRight.style.transform = 'translate(-20px, -40px) rotate(-25deg)';
        }

        function uncoverEyes() {
            pawLeft.style.transform = 'translate(0, 0) rotate(0deg)';
            pawRight.style.transform = 'translate(0, 0) rotate(0deg)';
        }

        // Toggle password visibility peek effect
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            eyeIcon.classList.toggle('bi-eye');
            eyeIcon.classList.toggle('bi-eye-slash');

            if (type === 'text') {
                peekEyes(); // Peek between paws when visible!
            } else {
                coverEyes(); // Cover completely when hidden!
            }
        });

        // Quick demo fill credentials
        function fillLogin(email, password, roleName) {
            emailInput.value = email;
            passwordInput.value = password;
            uncoverEyes();
            showNotification(`Đã tự động điền tài khoản mẫu ${roleName}! Bấm "ĐĂNG NHẬP HỆ THỐNG" để vào.`);
            
            // Mascot happy smile
            mouth.setAttribute('d', 'M 90 115 Q 100 130 110 115');
        }

        // 3. GOOGLE OAUTH FLOW & SIMULATED NOTIFICATION
        function triggerGoogleAuthModal() {
            const modal = new bootstrap.Modal(document.getElementById('modalGoogleAuth'));
            modal.show();
        }

        function submitGoogleLogin(email, name) {
            document.getElementById('googleEmail').value = email;
            document.getElementById('googleName').value = name;

            showNotification(`Đã phát thông báo xác thực 2-FA về Google Account: ${email}! Đang chuyển hướng...`);
            
            setTimeout(() => {
                document.getElementById('googleForm').submit();
            }, 1200);
        }

        function showNotification(msg) {
            toastMessage.innerText = msg;
            googleToast.classList.add('show');
            setTimeout(() => {
                googleToast.classList.remove('show');
            }, 5000);
        }

        // 4. FORGOT PASSWORD OTP WORKFLOW
        function sendOtpRequest() {
            const email = document.getElementById('forgotEmail').value;
            if (!email) {
                alert('Vui lòng nhập Email!');
                return;
            }

            fetch('{{ route("login.send_otp") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({ email: email })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('otpStep1').style.display = 'none';
                    document.getElementById('otpStep2').style.display = 'block';
                    document.getElementById('otpSuccessAlert').innerText = data.message;
                    showNotification(`Mã OTP 6 chữ số (${data.demo_otp}) đã được gửi về Gmail ${email}!`);
                }
            });
        }

        function verifyOtpAndResetPassword() {
            const email = document.getElementById('forgotEmail').value;
            const otp = document.getElementById('inputOtp').value;
            const newPassword = document.getElementById('forgotNewPassword').value;

            if (!newPassword || newPassword.length < 6) {
                alert('Mật khẩu mới phải từ 6 ký tự trở lên!');
                return;
            }

            fetch('{{ route("login.reset_password_otp") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({ email: email, otp: otp, new_password: newPassword })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    window.location.href = data.redirect_url;
                } else {
                    alert(data.message);
                }
            });
        }
    </script>
</body>
</html>
