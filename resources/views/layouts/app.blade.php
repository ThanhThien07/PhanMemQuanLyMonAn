<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="M&S Cuisine - Hệ thống quản lý nhà hàng thông minh: sơ đồ bàn, gọi món QR, bếp KDS, báo cáo doanh thu và quản lý kho nguyên liệu theo thời gian thực.">
    <title>@yield('title', 'M&S - Quản lý ẩm thực thông minh')</title>

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 & Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <!-- Vite Asset Manager -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

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
              sans: ['Inter', 'sans-serif'], // Sử dụng font chữ chuẩn Inter từ Google Fonts
            }
          }
        }
      }
    </script>

    <!-- Hybrid Bootstrap & Custom Premium CSS Styles -->
    <style>
      /* Khung thẻ cao cấp (card-premium) có bóng đổ mịn, bo góc 16px và hiệu ứng nâng lên khi di chuột */
      .card-premium {
        background-color: #ffffff;
        border: 0;
        border-radius: 1rem; /* 16px */
        box-shadow: 0 8px 30px rgba(0,0,0,0.03);
        transition: all 0.3s ease;
        overflow: hidden;
      }
      .card-premium:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 35px rgba(142, 25, 42, 0.06);
      }

      /* Tiêu đề thẻ cao cấp (card-premium-header) với bo góc và đệm lề chuẩn */
      .card-premium-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .card-premium-title {
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        color: #121212 !important;
        margin: 0 !important;
        display: inline-flex;
        align-items: center;
      }
      .card-premium-title i {
        margin-right: 0.75rem;
        font-size: 1.25rem;
      }

      /* Bo tròn các góc của table-responsive để không bị răng cưa/chờm ra ngoài card-premium */
      .card-premium .table-responsive {
        border-radius: 1rem;
        overflow: hidden;
      }
      .card-premium .table-responsive:last-child {
        border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
      .card-premium .table-responsive:first-child {
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      .card-premium .table-responsive:only-child {
        border-radius: 1rem;
      }

      /* Đồng bộ bo góc hoàn hảo cho các phần tử bên trong .input-group khi kết hợp với nút premium hoặc viền màu */
      .input-group {
        display: flex !important;
        flex-wrap: nowrap !important;
      }
      .input-group > .form-control {
        border-radius: 0.75rem;
      }
      .input-group-sm > .form-control {
        border-radius: 0.5rem;
      }
      .input-group > :not(:last-child):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating) {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }
      .input-group > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(.valid-feedback):not(.invalid-tooltip):not(.invalid-feedback) {
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        margin-left: -1px !important;
      }


      /* Nút nhấn đỏ Crimson (btn-premium) thương hiệu với bo góc 12px và hiệu ứng trượt nhẹ */
      .btn-premium {
        background-color: #8e192a;
        color: #ffffff !important;
        border: 0;
        border-radius: 0.75rem; /* 12px */
        padding: 0.625rem 1.25rem;
        font-weight: 600;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none !important;
      }
      .btn-premium:hover {
        background-color: #72121f;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(142, 25, 42, 0.2);
        color: #ffffff !important;
      }

      /* Nút nhấn phụ vàng Gold (btn-premium-gold) tạo điểm nhấn sang trọng */
      .btn-premium-gold {
        background-color: #e6b15c;
        color: #121212 !important;
        border: 0;
        border-radius: 0.75rem; /* 12px */
        padding: 0.625rem 1.25rem;
        font-weight: 600;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none !important;
      }
      .btn-premium-gold:hover {
        background-color: #d19f4d;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(230, 177, 92, 0.3);
        color: #121212 !important;
      }

      /* Cấu hình danh sách menu sidebar để loại bỏ dấu bullet mặc định */
      .nav-menu {
        list-style: none !important;
        padding-left: 0 !important;
        margin: 0 !important;
      }
      
      .nav-menu-item {
        list-style: none !important;
        padding: 0 !important;
        margin: 0 0 4px 0 !important;
      }

      /* Thiết lập đường dẫn liên kết menu bên của sidebar, chuyển đổi màu khi active/hover */
      .nav-menu-link {
        display: flex;
        align-items: center;
        padding: 10px 24px;
        color: #4a4a4a !important;
        font-weight: 500;
        text-decoration: none !important;
        border-left: 4px solid transparent;
        transition: all 0.2s ease;
      }
      
      /* Khi hover: nền chuyển gradient đỏ nhạt sang trong suốt */
      .nav-menu-link:hover {
        background: linear-gradient(to right, rgba(142, 25, 42, 0.05), transparent);
        color: #8e192a !important;
        border-left-color: #8e192a;
        text-decoration: none !important;
      }

      /* Trạng thái menu đang được chọn: Nền đỏ mờ, chỉ viền bên trái đổi thành màu vàng Gold */
      .nav-menu-link.active {
        background: linear-gradient(to right, rgba(142, 25, 42, 0.08), transparent);
        color: #8e192a !important;
        border-left-color: #e6b15c;
        font-weight: 600;
        text-decoration: none !important;
      }

      /* Thiết lập chuyển động mượt cho biểu tượng icon đi kèm menu link */
      .nav-menu-link i {
        font-size: 18px;
        margin-right: 15px;
        transition: transform 0.2s ease;
        color: inherit;
        display: inline-block;
      }

      .nav-menu-link:hover i {
        transform: scale(1.1);
      }

      .nav-menu-link.active i {
        color: #8e192a !important;
      }
    </style>
    
    <style>
      body, h1, h2, h3, h4, h5, h6, input, button, select, textarea {
        font-family: 'Inter', sans-serif !important;
      }
      body {
        background-color: #f6f3eb;
        color: #2b2b2b;
        overflow-x: hidden;
      }
      .ms-header {
        background: linear-gradient(135deg, #8e192a 0%, #6e101f 100%) !important;
        border-bottom: 2px solid #e6b15c;
        height: 70px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1030;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .ms-header-link {
        color: rgba(255, 255, 255, 0.85) !important;
        font-weight: 600;
        font-size: 13px;
        padding: 6px 14px;
        border-radius: 20px;
        text-decoration: none !important;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
      }
      .ms-header-link:hover {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.18);
        transform: translateY(-1px);
      }
      .ms-header-link.active {
        color: #121212 !important;
        background: #e6b15c;
        font-weight: 700;
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
    <header class="ms-header d-flex align-items-center px-3 px-lg-4">
      <div class="d-flex align-items-center w-100 justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-light d-lg-none me-2" id="sidebarToggle">
            <i class="bi bi-list"></i>
          </button>
          <a href="{{ url('/') }}" class="brand-title d-flex align-items-center text-decoration-none">
            <i class="bi bi-egg-fried me-2 text-warning"></i>M&S <span>CUISINE</span>
          </a>
          <span class="badge bg-emerald-500/20 text-amber-300 border border-amber-400/30 rounded-pill px-3 py-1.5 text-xs font-bold ms-2 d-none d-xl-inline-flex align-items-center gap-2">
            <span class="bg-emerald-400 rounded-circle d-inline-block animate-ping" style="width:8px; height:8px;"></span>
            <span>Hệ Thống Live 2026</span>
          </span>
        </div>

        <!-- Center Quick Navigation Shortcuts -->
        <div class="d-none d-lg-flex align-items-center gap-2 mx-auto">
          @auth
            @if(Auth::user()->role === 'admin')
              <a href="{{ route('quan_ly.index') }}" class="ms-header-link {{ Route::is('quan_ly.index') ? 'active' : '' }}">
                <i class="bi bi-speedometer2 me-1.5 text-warning"></i>Báo Cáo
              </a>
            @endif
            @if(Auth::user()->role === 'admin' || Auth::user()->role === 'nhan_vien')
              <a href="{{ route('ban.index') }}" class="ms-header-link {{ Route::is('ban.index') ? 'active' : '' }}">
                <i class="bi bi-grid-3x3-gap me-1.5 text-amber-300"></i>Sơ Đồ Bàn
              </a>
            @endif
            @if(Auth::user()->role === 'admin' || Auth::user()->role === 'bep')
              <a href="{{ route('nguyen_lieu.so_sanh_gia') }}" class="ms-header-link {{ Route::is('nguyen_lieu.so_sanh_gia') ? 'active' : '' }}">
                <i class="bi bi-diagram-3-fill me-1.5 text-amber-300"></i>So Sánh Giá
              </a>
              <a href="{{ route('dat_mon.bep') }}" class="ms-header-link {{ Route::is('dat_mon.bep') ? 'active' : '' }}">
                <i class="bi bi-fire me-1.5 text-danger"></i>Bếp KDS
              </a>
            @endif
          @endauth
        </div>

        <!-- Right User & Notifications Menu -->
        <div class="d-flex align-items-center gap-2 gap-md-3">
          @auth
            <!-- Notification Bell Dropdown -->
            <div class="dropdown">
              <button class="btn btn-outline-light border-0 position-relative p-2" type="button" data-bs-toggle="dropdown" title="Thông báo hệ thống">
                <i class="bi bi-bell-fill text-warning fs-5"></i>
                <span class="position-absolute top-1 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span class="visually-hidden">Thông báo mới</span>
                </span>
              </button>
              <div class="dropdown-menu dropdown-menu-end shadow-xl border-0 mt-2 p-3" style="width: 320px;">
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <strong class="text-slate-900 text-sm"><i class="bi bi-bell me-1 text-ms-primary"></i>Thông Báo Realtime</strong>
                  <span class="badge bg-danger">Mới</span>
                </div>
                <div class="small text-slate-600 mb-2">
                  <div class="p-2 bg-slate-50 rounded-xl mb-1 border">
                    <span class="fw-bold text-slate-900"><i class="bi bi-app-indicator text-warning me-1"></i>Bàn 05 vừa gọi món</span>
                    <div class="text-xs text-slate-500">1 phút trước</div>
                  </div>
                  <div class="p-2 bg-slate-50 rounded-xl border">
                    <span class="fw-bold text-slate-900"><i class="bi bi-check-circle-fill text-success me-1"></i>Bếp xác nhận đơn #1042</span>
                    <div class="text-xs text-slate-500">3 phút trước</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Menu Dropdown -->
            <div class="dropdown">
              <a href="#" class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 border-0" id="userMenu" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle fs-5 text-warning"></i>
                <span class="d-none d-md-inline">
                  {{ Auth::user()->name }} 
                  <span class="badge bg-amber-400 text-slate-900 ms-1 font-bold" style="font-size:10px;">
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
              <li class="nav-menu-item">
                <a href="{{ route('nguyen_lieu.so_sanh_gia') }}" class="nav-menu-link {{ Route::is('nguyen_lieu.so_sanh_gia') ? 'active' : '' }}">
                  <i class="bi bi-diagram-3-fill text-amber-600"></i>
                  <span class="font-bold">So Sánh Giá & PO</span>
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
                <a href="{{ route('dat_ban_truoc.index') }}" class="nav-menu-link {{ Route::is('dat_ban_truoc.index') ? 'active' : '' }}">
                  <i class="bi bi-calendar-check-fill text-ms-primary"></i>
                  <span>Đặt Bàn Trước</span>
                </a>
              </li>
              <li class="nav-menu-item">
                <a href="{{ route('quan_ly.danh_gia_khach_hang') }}" class="nav-menu-link {{ Route::is('quan_ly.danh_gia_khach_hang') ? 'active' : '' }}">
                  <i class="bi bi-star-half text-amber-500"></i>
                  <span>Đánh Giá Khách Hàng</span>
                </a>
              </li>
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
    <footer class="ms-footer p-0">
      <div class="px-4 py-3 bg-white border-top">
        <div class="d-flex align-items-center justify-content-center text-center gap-2">
          <i class="bi bi-egg-fried text-warning fs-5"></i>
          <span class="text-slate-800 text-sm font-bold">M&S CUISINE &copy; 2026</span>
          <span class="text-slate-500 font-normal text-xs ms-1">Hệ Thống Quản Lý Nhà Hàng Smart F&B. All rights reserved.</span>
        </div>
      </div>
    </footer>

    <!-- Canvas Confetti CDN -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>

    <!-- Bootstrap 5 JavaScript & jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- FLOATING INTERACTIVE AI CHEF MASCOT ASSISTANT WIDGET -->
    <div id="chefMascotWidget" class="position-fixed bottom-4 inset-e-4 z-50 d-flex align-items-end gap-2" style="bottom: 24px; right: 24px;">
      <!-- Speech Bubble -->
      <div id="mascotSpeech" class="bg-white text-dark p-3 rounded-2xl shadow-xl border border-warning text-xs font-semibold max-w-xs mb-2 transition-all duration-300 transform scale-100" style="max-width: 240px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="text-ms-primary font-bold"><i class="bi bi-robot me-1"></i>Trợ Lý Bếp M&S</span>
          <span class="badge bg-warning text-dark text-xxs">AI Helper</span>
        </div>
        <div id="speechText" class="text-secondary">
          @if(Route::is('quan_ly.index'))
            "Hôm nay doanh thu đang phát triển tốt! Đã sẵn sàng xuất báo cáo tài chính."
          @elseif(Route::is('ban.index'))
            "Nhấp vào bàn ăn để xem hóa đơn hoặc bấm Thanh Toán để bắn pháo hoa mừng doanh thu!"
          @elseif(Route::is('nguyen_lieu.so_sanh_gia'))
            "Tôi đã tính toán NCC có giá rẻ nhất cho Thịt bò Úc. Bấm tạo PO ngay!"
          @elseif(Route::is('dat_mon.bep'))
            "Bếp đang sẵn sàng! Đĩa món mới gọi qua QR sẽ báo âm thanh Đing-đoong."
          @else
            "M&S Cuisine chúc bạn một ngày làm việc hiệu quả và bội thu!"
          @endif
        </div>
      </div>

      <!-- Mascot Avatar Circle -->
      <div id="mascotAvatar" onclick="triggerMascotCelebrate()" class="bg-ms-primary rounded-circle p-2 shadow-2xl border-4 border-amber-400 cursor-pointer hover:scale-110 transition-all duration-300" style="width: 70px; height: 70px; box-shadow: 0 8px 25px rgba(142,25,42,0.4);">
        <svg viewBox="0 0 200 200" class="w-100 h-100">
          <circle cx="100" cy="100" r="90" fill="#f59e0b"/>
          <path d="M 60 45 C 50 25, 80 10, 100 20 C 120 10, 150 25, 140 45 Z" fill="#ffffff"/>
          <ellipse cx="100" cy="115" rx="22" ry="16" fill="#fef3c7"/>
          <ellipse cx="100" cy="108" rx="8" ry="6" fill="#1e293b"/>
          <circle cx="78" cy="92" r="6" fill="#0f172a"/>
          <circle cx="122" cy="92" r="6" fill="#0f172a"/>
          <path d="M 92 118 Q 100 128 108 118" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

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
        wsPort: Number('{{ config("broadcasting.connections.reverb.options.port", 8080) }}'),
        wssPort: Number('{{ config("broadcasting.connections.reverb.options.port", 8080) }}'),
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
      });

      // Interactive Mascot Audio & Confetti Celebration
      function triggerMascotCelebrate() {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.85, x: 0.9 }
          });
        }

        // Web Audio Synthesizer Tone
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch(e){}

        const speech = document.getElementById('speechText');
        const tips = [
          "Tuyệt vời! Doanh thu hôm nay thật bùng nổ! 🎉",
          "Tôi đang kiểm soát kho nguyên liệu và FEFO cho bạn 24/7! 🤖",
          "Bếp KDS đang nấu ăn rất chuẩn tiến độ! 🍳",
          "Tất cả mã QR bàn ăn đều sẵn sàng cho khách gọi món! 📱"
        ];
        speech.innerText = tips[Math.floor(Math.random() * tips.length)];
      }
    </script>

    <script>
      // Toggle sidebar on mobile
      $('#sidebarToggle').on('click', function() {
        $('.ms-sidebar').toggleClass('active');
      });
    </script>
    @stack('scripts')
    @yield('scripts')
  </body>
</html>
