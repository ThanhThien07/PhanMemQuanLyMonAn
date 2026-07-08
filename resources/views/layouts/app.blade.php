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

    <!-- Cấu hình và tích hợp Tailwind CSS Play CDN để biên dịch trực tiếp các Class tiện ích -->
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      // Thiết lập bảng màu và font chữ đặc trưng của hệ thống nhà hàng M&S
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              ms: {
                primary: '#8e192a', // Màu đỏ Crimson sang trọng chủ đạo
                secondary: '#e6b15c', // Màu vàng Gold ấm áp của thương hiệu
                dark: '#121212', // Tông tối đen sâu cho văn bản/giao diện tối
                light: '#fdfaf6', // Màu kem sáng nhẹ làm nền ambient
                sidebar: '#f3efe2', // Màu kem Linen thanh lịch cho thanh menu bên
              }
            },
            fontFamily: {
              sans: ['Outfit', 'sans-serif'], // Sử dụng font chữ hiện đại Outfit nhập từ Google Fonts
            }
          }
        }
      }
    </script>

    <!-- Hybrid Bootstrap & Tailwind Custom Styles -->
    <!-- Định nghĩa các class tiện ích dùng chung bằng cú pháp @apply của Tailwind -->
    <style type="text/tailwindcss">
      @layer utilities {
        /* Khung thẻ cao cấp (card-premium) có bóng đổ mịn, bo góc 16px và hiệu ứng nâng lên khi di chuột */
        .card-premium {
          @apply bg-white border-0 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(142,25,42,0.06)];
        }
        /* Nút nhấn đỏ Crimson (btn-premium) thương hiệu với bo góc 12px và hiệu ứng trượt nhẹ */
        .btn-premium {
          @apply bg-ms-primary text-white border-0 rounded-xl px-5 py-2.5 font-semibold transition-all duration-200 hover:bg-[#72121f] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(142,25,42,0.2)];
        }
        /* Nút nhấn phụ vàng Gold (btn-premium-gold) tạo điểm nhấn sang trọng */
        .btn-premium-gold {
          @apply bg-ms-secondary text-ms-dark border-0 rounded-xl px-5 py-2.5 font-semibold transition-all duration-200 hover:bg-[#d19f4d] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(230,177,92,0.3)];
        }
        /* Thiết lập đường dẫn liên kết menu bên của sidebar, chuyển đổi màu khi active/hover */
        .nav-menu-link {
          @apply flex items-center px-5 py-3 text-[#4a4a4a] font-medium border-l-4 border-transparent transition-all duration-200 hover:bg-gradient-to-r hover:from-ms-primary/5 hover:to-transparent hover:text-ms-primary hover:border-ms-primary;
        }
        /* Trạng thái menu đang được chọn: Nền đỏ mờ, chỉ viền bên trái đổi thành màu vàng Gold */
        .nav-menu-link.active {
          @apply bg-gradient-to-r from-ms-primary/8 to-transparent text-ms-primary border-ms-secondary font-semibold;
        }
        /* Thiết lập chuyển động mượt cho biểu tượng icon đi kèm menu link */
        .nav-menu-link i {
          @apply text-[18px] mr-[15px] transition-transform duration-200;
        }
        .nav-menu-link:hover i {
          @apply scale-110;
        }
        .nav-menu-link.active i {
          @apply text-ms-primary;
        }
      }
    </style>
    
    <style>
      body {
        font-family: 'Outfit', sans-serif;
        background-color: #f6f3eb;
        color: #2b2b2b;
        overflow-x: hidden;
      }
      .ms-header {
        background: rgba(142, 25, 42, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 2px solid #e6b15c;
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
        color: #e6b15c;
      }
      .ms-sidebar {
        background-color: #f3efe2;
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
      .ms-main {
        margin-left: 260px;
        margin-top: 70px;
        padding: 30px 40px;
        min-height: calc(100vh - 70px);
        transition: all 0.3s ease;
      }
      .ms-footer {
        background: #f3efe2;
        color: #666;
        text-align: center;
        padding: 20px 0;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        font-size: 13px;
        margin-left: 260px;
      }
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
      @media (max-width: 991.98px) {
        .ms-sidebar {
          margin-left: -260px;
        }
        .ms-sidebar.active {
          margin-left: 0;
        }
        .ms-main, .ms-footer {
          margin-left: 0 !important;
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
