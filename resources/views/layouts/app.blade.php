<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>M&S - Quản lý ẩm thực thông minh</title>

    <!-- Google Fonts: Outfit -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 & Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <!-- Premium Custom Styles -->
    <style>
      :root {
        --ms-primary: #8e192a; /* Premium Crimson Red */
        --ms-secondary: #e6b15c; /* Warm Gold */
        --ms-dark: #121212;
        --ms-light: #fdfaf6; /* Soft cream */
        --ms-sidebar: #f3efe2; /* Linen Cream */
        --font-outfit: 'Outfit', sans-serif;
      }

      body {
        font-family: var(--font-outfit);
        background-color: #f6f3eb;
        color: #2b2b2b;
        overflow-x: hidden;
      }

      /* Premium Glassmorphic Top Navbar */
      .ms-header {
        background: rgba(142, 25, 42, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 2px solid var(--ms-secondary);
        color: white;
        height: 70px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1030;
      }

      .brand-title {
        font-weight: 800;
        font-size: 24px;
        letter-spacing: 2px;
        color: white;
      }

      .brand-title span {
        color: var(--ms-secondary);
      }

      /* Premium Sidebar */
      .ms-sidebar {
        background-color: var(--ms-sidebar);
        width: 260px;
        position: fixed;
        top: 70px;
        bottom: 0;
        left: 0;
        z-index: 1020;
        border-right: 1px solid rgba(0, 0, 0, 0.06);
        padding-top: 20px;
        transition: all 0.3s ease;
      }

      .ms-sidebar .text-uppercase {
        color: rgba(142, 25, 42, 0.7) !important;
        font-weight: 700 !important;
        font-size: 10px !important;
        letter-spacing: 0.8px !important;
      }

      .nav-menu {
        padding: 0;
        list-style: none;
      }

      .nav-menu-item {
        margin-bottom: 5px;
      }

      .nav-menu-link {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: #4a4a4a;
        text-decoration: none;
        font-weight: 500;
        border-left: 4px solid transparent;
        transition: all 0.2s ease;
      }

      .nav-menu-link i {
        font-size: 18px;
        margin-right: 15px;
        transition: transform 0.2s ease;
      }

      .nav-menu-link:hover {
        background: linear-gradient(90deg, rgba(142, 25, 42, 0.05) 0%, rgba(142, 25, 42, 0) 100%);
        color: var(--ms-primary);
        border-left-color: var(--ms-primary);
      }

      .nav-menu-link:hover i {
        transform: scale(1.15);
      }

      .nav-menu-link.active {
        background: linear-gradient(90deg, rgba(142, 25, 42, 0.08) 0%, rgba(142, 25, 42, 0.01) 100%);
        color: var(--ms-primary);
        border-left-color: var(--ms-secondary);
        font-weight: 600;
      }

      .nav-menu-link.active i {
        color: var(--ms-primary);
      }

      /* Main Content Area */
      .ms-main {
        margin-left: 260px;
        margin-top: 70px;
        padding: 30px 40px;
        min-height: calc(100vh - 70px);
        transition: all 0.3s ease;
      }

      /* Cards & Elevate Components */
      .card-premium {
        background: white;
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
      }

      .card-premium:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 35px rgba(142, 25, 42, 0.06);
      }

      .card-premium-header {
        background: transparent;
        border-bottom: 1px solid #f0edf4;
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-premium-title {
        font-weight: 700;
        font-size: 18px;
        color: var(--ms-primary);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      /* Buttons Premium */
      .btn-premium {
        background-color: var(--ms-primary);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 10px 20px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .btn-premium:hover {
        background-color: #72121f;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(142, 25, 42, 0.2);
      }

      .btn-premium-gold {
        background-color: var(--ms-secondary);
        color: var(--ms-dark);
        border: none;
        border-radius: 10px;
        padding: 10px 20px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .btn-premium-gold:hover {
        background-color: #d19f4d;
        color: var(--ms-dark);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(230, 177, 92, 0.3);
      }

      /* Kitchen Late Warn Animation */
      @keyframes pulse-red-border {
        0% {
          box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          border-color: rgba(220, 53, 69, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          border-color: rgba(220, 53, 69, 1);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          border-color: rgba(220, 53, 69, 0.7);
        }
      }

      .kitchen-late-warning {
        border: 2px solid #dc3545 !important;
        animation: pulse-red-border 1.5s infinite;
        background-color: #fff8f8 !important;
      }

      /* Custom Badges */
      .badge-premium {
        border-radius: 8px;
        padding: 6px 12px;
        font-weight: 600;
        font-size: 12px;
      }

      /* Footer */
      .ms-footer {
        background: var(--ms-sidebar);
        color: #666;
        text-align: center;
        padding: 20px 0;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        font-size: 13px;
        margin-left: 260px;
      }

      /* Mobile responsiveness */
      @media (max-width: 991.98px) {
        .ms-sidebar {
          margin-left: -260px;
        }
        .ms-sidebar.active {
          margin-left: 0;
        }
        .ms-main, .ms-footer {
          margin-left: 0;
        }
      }
    </style>
  </head>
  <body>
    <!-- Top Header -->
    <header class="ms-header d-flex align-items-center px-4">
      <div class="d-flex align-items-center w-100 justify-content-between">
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-light d-lg-none me-3" id="sidebarToggle">
            <i class="bi bi-list"></i>
          </button>
          <div class="brand-title">
            <i class="bi bi-egg-fried me-2 text-warning"></i>M&S <span>CUISINE</span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          @auth
            <div class="dropdown">
              <a href="#" class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 border-0" id="userMenu" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle fs-5 text-warning"></i>
                <span class="d-none d-md-inline">
                  {{ Auth::user()->name }} 
                  <span class="badge bg-secondary ms-1" style="font-size:10px;">
                    @if(Auth::user()->role === 'admin') Ban điều hành
                    @elseif(Auth::user()->role === 'nhan_vien') Nhân viên
                    @elseif(Auth::user()->role === 'bep') Nhà bếp
                    @else {{ Auth::user()->role }}
                    @endif
                  </span>
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                <li><a class="dropdown-item py-2" href="#"><i class="bi bi-person me-2"></i>Hồ sơ cá nhân</a></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item py-2 text-danger" href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                    <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </a>
                  <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                    @csrf
                  </form>
                </li>
              </ul>
            </div>
          @else
            <a href="{{ route('login') }}" class="btn btn-outline-light border-0 d-flex align-items-center gap-2">
              <i class="bi bi-box-arrow-in-right fs-5"></i>
              <span>Đăng nhập</span>
            </a>
          @endauth
        </div>
      </div>
    </header>

    <!-- Navigation Sidebar -->
    <aside class="ms-sidebar" style="overflow-y: auto;">
      @auth
        <!-- Quản Lý Chung Group -->
        @if(Auth::user()->role === 'admin' || Auth::user()->role === 'nhan_vien' || Auth::user()->role === 'bep')
          <div class="px-3 pt-2 pb-1 text-uppercase text-secondary small fw-bold" style="font-size: 11px; letter-spacing: 1px;">
            <i class="bi bi-sliders me-1 text-warning"></i>Khu Vực Quản Lý
          </div>
          <ul class="nav-menu mb-3">
            @if(Auth::user()->role === 'admin')
              <li class="nav-menu-item">
                <a href="{{ route('quan_ly.index') }}" class="nav-menu-link {{ Route::is('quan_ly.index') ? 'active' : '' }}">
                  <i class="bi bi-speedometer2"></i>
                  <span>Báo cáo Quản lý</span>
                </a>
              </li>
            @endif
            @if(Auth::user()->role === 'admin' || Auth::user()->role === 'nhan_vien')
              <li class="nav-menu-item">
                <a href="{{ route('ban.index') }}" class="nav-menu-link {{ Route::is('ban.index') ? 'active' : '' }}">
                  <i class="bi bi-grid-3x3-gap"></i>
                  <span>Sơ đồ bàn & Thu ngân</span>
                </a>
              </li>
            @endif
            @if(Auth::user()->role === 'admin' || Auth::user()->role === 'bep')
              <li class="nav-menu-item">
                <a href="{{ route('nguyen_lieu.index') }}" class="nav-menu-link {{ Route::is('nguyen_lieu.index') ? 'active' : '' }}">
                  <i class="bi bi-box-seam"></i>
                  <span>Kho Nguyên liệu</span>
                </a>
              </li>
            @endif
          </ul>
        @endif

        <!-- Danh Mục Nghiệp Vụ Group -->
        @if(Auth::user()->role === 'admin' || Auth::user()->role === 'nhan_vien')
          <div class="px-3 pt-2 pb-1 text-uppercase text-secondary small fw-bold" style="font-size: 11px; letter-spacing: 1px;">
            <i class="bi bi-folder2-open me-1 text-warning"></i>Danh Mục Hệ Thống
          </div>
          <ul class="nav-menu mb-3">
            @if(Auth::user()->role === 'admin')
              <li class="nav-menu-item">
                <a href="{{ route('mon_an.index') }}" class="nav-menu-link {{ Route::is('mon_an.index') ? 'active' : '' }}">
                  <i class="bi bi-journal-album"></i>
                  <span>Thực đơn Món ăn</span>
                </a>
              </li>
              <li class="nav-menu-item">
                <a href="{{ route('nhan_vien_quan_ly.index') }}" class="nav-menu-link {{ Route::is('nhan_vien_quan_ly.index') ? 'active' : '' }}">
                  <i class="bi bi-shield-lock-fill"></i>
                  <span>Nhân sự Phân quyền</span>
                </a>
              </li>
            @endif
            <li class="nav-menu-item">
              <a href="{{ route('khach_hang.index') }}" class="nav-menu-link {{ Route::is('khach_hang.index') ? 'active' : '' }}">
                <i class="bi bi-person-heart"></i>
                <span>CRM Khách Hàng</span>
              </a>
            </li>
            @if(Auth::user()->role === 'admin')
              <li class="nav-menu-item">
                <a href="{{ route('nha_cung_cap.index') }}" class="nav-menu-link {{ Route::is('nha_cung_cap.index') ? 'active' : '' }}">
                  <i class="bi bi-truck"></i>
                  <span>Nhà Cung Cấp</span>
                </a>
              </li>
            @endif
          </ul>
        @endif

        <!-- Nhân Viên Group -->
        @if(Auth::user()->role === 'admin' || Auth::user()->role === 'nhan_vien')
          <div class="px-3 pt-2 pb-1 text-uppercase text-secondary small fw-bold" style="font-size: 11px; letter-spacing: 1px;">
            <i class="bi bi-people me-1 text-warning"></i>Kíp Phục Vụ
          </div>
          <ul class="nav-menu mb-3">
            <li class="nav-menu-item">
              <a href="{{ route('nhan_vien.index') }}" class="nav-menu-link {{ Route::is('nhan_vien.index') ? 'active' : '' }}">
                <i class="bi bi-bell-fill text-warning"></i>
                <span class="fw-bold">Màn Hình Nhân Viên</span>
              </a>
            </li>
            <li class="nav-menu-item">
              <a href="{{ route('dat_mon.index') }}" class="nav-menu-link {{ Route::is('dat_mon.index') ? 'active' : '' }}">
                <i class="bi bi-receipt"></i>
                <span>Đơn món chi tiết</span>
              </a>
            </li>
          </ul>
        @endif

        <!-- Bếp KDS Group -->
        @if(Auth::user()->role === 'admin' || Auth::user()->role === 'bep')
          <div class="px-3 pt-2 pb-1 text-uppercase text-secondary small fw-bold" style="font-size: 11px; letter-spacing: 1px;">
            <i class="bi bi-fire me-1 text-danger"></i>Khu Chế Biến
          </div>
          <ul class="nav-menu mb-2">
            <li class="nav-menu-item">
              <a href="{{ route('dat_mon.bep') }}" class="nav-menu-link {{ Route::is('dat_mon.bep') ? 'active' : '' }}">
                <i class="bi bi-fire text-danger"></i>
                <span class="fw-bold text-danger">MÀN HÌNH BẾP (KDS)</span>
              </a>
            </li>
          </ul>
        @endif


      @endauth
      
      <!-- Quick QR link card -->
      <div class="mx-3 mt-5 p-3 rounded bg-dark border border-secondary text-white text-center opacity-75">
        <h6 class="text-warning font-weight-bold"><i class="bi bi-qr-code-scan me-2"></i>Bàn Khách đặt món</h6>
        <p class="small mb-2">Giả lập khách quét mã QR tại bàn gọi món:</p>
        <div class="d-flex flex-wrap justify-content-center gap-1">
          @for ($i = 1; $i <= 5; $i++)
            <a href="{{ route('dat_mon.qr_order', $i) }}" target="_blank" class="btn btn-sm btn-outline-warning py-0 px-2 small">Bàn {{ $i }}</a>
          @endfor
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="ms-main">
      <!-- Alert messages -->
      @if (session('success'))
        <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm mb-4" role="alert" style="border-radius:12px;">
          <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      @endif

      @if (session('warning'))
        <div class="alert alert-warning alert-dismissible fade show border-0 shadow-sm mb-4" role="alert" style="border-radius:12px;">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ session('warning') }}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      @endif

      @yield('content')
    </main>

    <!-- Footer -->
    <footer class="ms-footer">
      <div><strong>M&S Cuisine &copy; 2026</strong>. Tất cả quyền lợi được bảo lưu. Thiết kế hệ thống thông minh nâng cao hiệu suất.</div>
    </footer>

    <!-- Bootstrap 5 JavaScript & jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Laravel Echo & Pusher CDN -->
    <script src="https://js.pusher.com/8.0.1/pusher.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.16.0/dist/echo.iife.js"></script>
    <script>
      // Cấu hình Laravel Echo kết nối với Reverb
      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: 'reverb',
        key: '{{ config("broadcasting.connections.reverb.key") }}',
        wsHost: '{{ config("broadcasting.connections.reverb.options.host", "localhost") }}',
        wsPort: {{ config("broadcasting.connections.reverb.options.port", 8080) }},
        wssPort: {{ config("broadcasting.connections.reverb.options.port", 8080) }},
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
      });
    </script>

    <script>
      // Toggle sidebar on mobile
      $('#sidebarToggle').on('click', function() {
        $('.ms-sidebar').toggleClass('active');
      });
    </script>
    @yield('scripts')
  </body>
</html>
