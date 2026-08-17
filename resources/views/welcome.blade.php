<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResManager - Phần Mềm Quản Lý Nhà Hàng & Đặt Món QR Thông Minh</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 CSS & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Tailwind Play CDN for utility classes -->
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        :root {
            --primary-crimson: #8e192a;
            --primary-gold: #f59e0b;
            --secondary-gold: #d97706;
            --bg-light: #fcfaf5;
            --card-bg: #ffffff;
            --text-dark: #1e293b;
            --text-muted: #64748b;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-light);
            color: var(--text-dark);
            overflow-x: hidden;
        }

        h1, h2, h3, h4, h5, .font-heading {
            font-family: 'Outfit', sans-serif;
        }

        /* Ambient Glow Effects (Bright & Soft) */
        .glow-bg-1 {
            position: absolute;
            top: -10%;
            left: 20%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(253, 250, 245, 0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        .glow-bg-2 {
            position: absolute;
            top: 30%;
            right: -10%;
            width: 650px;
            height: 650px;
            background: radial-gradient(circle, rgba(142, 25, 42, 0.08) 0%, rgba(253, 250, 245, 0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        /* Bright Luxury Cards */
        .glass-card {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(142, 25, 42, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
            transform: translateY(-6px);
            border-color: rgba(142, 25, 42, 0.2);
            box-shadow: 0 20px 40px -10px rgba(142, 25, 42, 0.12);
        }

        .navbar-custom {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .btn-crimson {
            background: linear-gradient(135deg, #8e192a 0%, #72121f 100%);
            color: #ffffff !important;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            padding: 12px 28px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(142, 25, 42, 0.25);
            text-decoration: none !important;
        }

        .btn-crimson:hover {
            background: linear-gradient(135deg, #a62033 0%, #8e192a 100%);
            color: #ffffff !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(142, 25, 42, 0.38);
        }

        .btn-gold {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff !important;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            padding: 12px 28px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            text-decoration: none !important;
        }

        .btn-gold:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.45);
        }

        .btn-outline-light-custom {
            background: #ffffff;
            color: #1e293b !important;
            border: 1px solid #cbd5e1;
            font-weight: 600;
            border-radius: 12px;
            padding: 12px 28px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            text-decoration: none !important;
        }

        .btn-outline-light-custom:hover {
            background: #f8fafc;
            color: #8e192a !important;
            border-color: #8e192a;
            transform: translateY(-2px);
        }

        .badge-pill {
            background: #fef3c7;
            color: #b45309;
            border: 1px solid #fde68a;
            padding: 8px 18px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .feature-icon {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            margin-bottom: 20px;
        }

        .stat-number {
            font-size: 2.8rem;
            font-weight: 800;
            color: #8e192a;
        }
    </style>
</head>
<body>

    <div class="glow-bg-1"></div>
    <div class="glow-bg-2"></div>

    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-light fixed-top navbar-custom px-3 px-lg-5 py-3">
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-decoration-none" href="{{ url('/') }}">
                <div class="text-white rounded-3 px-2.5 py-1 d-flex align-items-center justify-content-center shadow-sm" style="background: #8e192a;">
                    <i class="bi bi-shop fs-4"></i>
                </div>
                <span class="text-slate-900 font-bold">Res<span style="color: #8e192a;">Manager</span></span>
            </a>

            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto gap-lg-3 my-2 my-lg-0">
                    <li class="nav-item"><a class="nav-link text-slate-800 fw-bold active" href="#hero">Trang Chủ</a></li>
                    <li class="nav-item"><a class="nav-link text-slate-600 fw-medium" href="#features">Tính Năng</a></li>
                    <li class="nav-item"><a class="nav-link text-slate-600 fw-medium" href="#qr-demo">Thử Mã QR</a></li>
                </ul>

                <div class="d-flex align-items-center gap-2 mt-3 mt-lg-0">
                    @auth
                        <a href="{{ route('ban.index') }}" class="btn btn-crimson">
                            <i class="bi bi-speedometer2 me-1"></i> Vào Hệ Thống
                        </a>
                    @else
                        <a href="{{ route('login') }}" class="btn btn-outline-light-custom px-4">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Đăng Nhập
                        </a>
                        <a href="{{ route('register') }}" class="btn btn-crimson px-4">
                            <i class="bi bi-person-plus me-1"></i> Đăng Ký
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="pt-5 mt-5 pb-5">
        <div class="container pt-lg-5">
            <div class="row align-items-center gy-5">
                <div class="col-lg-6">
                    <div class="mb-3">
                        <span class="badge-pill">
                            <i class="bi bi-stars"></i> Giải Pháp F&B Đột Phá 2026
                        </span>
                    </div>

                    <h1 class="display-4 fw-extrabold text-slate-900 mb-3 lh-sm">
                        Quản Lý Nhà Hàng <br>
                        <span style="color: #8e192a;">& Gọi Món QR</span> Tự Động
                    </h1>

                    <p class="text-slate-600 fs-5 mb-4">
                        Tối ưu 80% thời gian vận hành, tự động hóa toàn bộ quy trình từ Khách quét QR tại bàn, Màn hình Bếp thời gian thực đến Báo cáo doanh thu tự động.
                    </p>

                    <div class="d-flex flex-wrap gap-3 mb-4">
                        @auth
                            <a href="{{ route('ban.index') }}" class="btn btn-crimson btn-lg fs-6">
                                <i class="bi bi-grid-fill me-2"></i> Mở Trang Quản Lý Bàn
                            </a>
                        @else
                            <a href="{{ route('login') }}" class="btn btn-crimson btn-lg fs-6">
                                <i class="bi bi-rocket-takeoff me-2"></i> Trải Nghiệm Ngay
                            </a>
                            <a href="{{ route('dat_mon.qr_order', 1) }}" class="btn btn-gold btn-lg fs-6">
                                <i class="bi bi-qr-code-scan me-2"></i> Thử Quét QR Bàn 1
                            </a>
                        @endauth
                    </div>

                    <div class="row g-3 pt-3 border-top border-slate-200">
                        <div class="col-4">
                            <div class="stat-number">100%</div>
                            <div class="text-slate-600 small font-semibold">Thời gian thực</div>
                        </div>
                        <div class="col-4">
                            <div class="stat-number">0s</div>
                            <div class="text-slate-600 small font-semibold">Trễ thông báo Bếp</div>
                        </div>
                        <div class="col-4">
                            <div class="stat-number">24/7</div>
                            <div class="text-slate-600 small font-semibold">Báo cáo tự động</div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 text-center position-relative">
                    <div class="glass-card p-3 p-lg-4 text-start">
                        <div class="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-slate-100">
                            <div class="d-flex align-items-center gap-2">
                                <span class="bg-success rounded-circle p-1 d-inline-block"></span>
                                <strong class="text-slate-900">Màn Hình Quản Lý Bàn Live</strong>
                            </div>
                            <span class="badge bg-amber-100 text-amber-800 px-3 py-1 border border-amber-200">Sơ đồ Bàn</span>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-4">
                                <div class="bg-emerald-50 border border-emerald-300 rounded-3 p-2 text-center">
                                    <small class="text-emerald-700 d-block fw-bold">Bàn 01 (Đang ăn)</small>
                                    <span class="small text-emerald-900 font-bold">450.000đ</span>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="bg-amber-50 border border-amber-300 rounded-3 p-2 text-center">
                                    <small class="text-amber-700 d-block fw-bold">Bàn 02 (Chờ món)</small>
                                    <span class="small text-amber-900 font-bold">3 món</span>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="bg-slate-100 border border-slate-300 rounded-3 p-2 text-center">
                                    <small class="text-slate-600 d-block">Bàn 03 (Trống)</small>
                                    <span class="small text-slate-500">Sẵn sàng</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-slate-50 rounded-3 p-3 text-slate-600 small border border-slate-200">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="fw-semibold text-slate-700"><i class="bi bi-bell-fill text-amber-500 me-1"></i> Bàn 05 vừa đặt thêm món</span>
                                <span class="badge bg-danger">Mới</span>
                            </div>
                            <div class="d-flex justify-content-between text-slate-500">
                                <span><i class="bi bi-check-circle-fill text-success me-1"></i> Bếp xác nhận hoàn thành đơn #1042</span>
                                <span>1 phút trước</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-5">
        <div class="container py-lg-4">
            <div class="text-center max-w-2xl mx-auto mb-5">
                <span class="badge-pill mb-2"><i class="bi bi-grid-1x2"></i> Tính Năng Toàn Diện</span>
                <h2 class="display-6 fw-bold text-slate-900">Mọi Thứ Bạn Cần Cho Nhà Hàng</h2>
                <p class="text-slate-600">Được thiết kế chuẩn hóa cho Quán Ăn, Nhà Hàng, Quán Cafe và Chuỗi F&B hiện đại.</p>
            </div>

            <div class="row g-4">
                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-amber-100 text-amber-600">
                            <i class="bi bi-qr-code-scan"></i>
                        </div>
                        <h4 class="text-slate-900 fs-5 fw-bold mb-2">Đặt Món Mã QR</h4>
                        <p class="text-slate-600 small mb-0">Khách tự quét mã tại bàn bằng điện thoại, không cần cài app. Chọn món và gửi yêu cầu xuống bếp tức thì.</p>
                    </div>
                </div>

                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-emerald-100 text-emerald-600">
                            <i class="bi bi-display"></i>
                        </div>
                        <h4 class="text-slate-900 fs-5 fw-bold mb-2">Màn Hình Bếp (KDS)</h4>
                        <p class="text-slate-600 small mb-0">Bếp nhận đơn theo thứ tự thời gian thực, có âm thanh thông báo và đổi trạng thái Chế biến / Hoàn thành nhanh chóng.</p>
                    </div>
                </div>

                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-sky-100 text-sky-600">
                            <i class="bi bi-box-seam"></i>
                        </div>
                        <h4 class="text-slate-900 fs-5 fw-bold mb-2">Quản Lý Kho Nguyên Liệu</h4>
                        <p class="text-slate-600 small mb-0">Tự động trừ kho khi món ăn được chế biến, cảnh báo nguyên liệu sắp hết và tạo đơn nhập hàng chính xác.</p>
                    </div>
                </div>

                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-purple-100 text-purple-600">
                            <i class="bi bi-graph-up-arrow"></i>
                        </div>
                        <h4 class="text-slate-900 fs-5 fw-bold mb-2">Báo Cáo Doanh Thu</h4>
                        <p class="text-slate-600 small mb-0">Thống kê doanh số theo ngày/tuần/tháng, vẽ biểu đồ top món bán chạy và xuất file Excel / PDF báo cáo tự động.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- QR Demo Section -->
    <section id="qr-demo" class="py-5 bg-white border-top border-bottom border-slate-200">
        <div class="container py-lg-4">
            <div class="row align-items-center gy-4">
                <div class="col-lg-6">
                    <span class="badge-pill mb-2"><i class="bi bi-phone"></i> Trải Nghiệm Khách Hàng</span>
                    <h2 class="display-6 fw-bold text-slate-900 mb-3">Thử Ngay Giao Diện Đặt Món QR</h2>
                    <p class="text-slate-600 mb-4">
                        Khách hàng chỉ cần quét mã QR tại bàn để xem thực đơn thực tế, chọn món, ghi chú yêu cầu (ít cay, không hành) và theo dõi tiến độ món ăn ngay trên điện thoại.
                    </p>
                    <div class="d-flex gap-3">
                        <a href="{{ route('dat_mon.qr_order', 1) }}" target="_blank" class="btn btn-crimson">
                            <i class="bi bi-box-arrow-up-right me-1"></i> Mở Đặt Món QR Bàn 1
                        </a>
                    </div>
                </div>

                <div class="col-lg-6 text-center">
                    <div class="glass-card p-4 d-inline-block bg-slate-50 border border-slate-200">
                        <div class="bg-white p-3 rounded-4 d-inline-block mb-3 shadow-sm border border-slate-200">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={{ urlencode(url('/qr-order/1')) }}" 
                                 alt="QR Order Demo" 
                                 class="img-fluid rounded-3"
                                 onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' fill=\'%23000\' viewBox=\'0 0 16 16\'><path d=\'M2 2h4v4H2V2zm6 0h4v4H8V2zM2 8h4v4H2V8zm10 2h2v2h-2v-2z\'/></svg>';">
                        </div>
                        <h5 class="text-slate-900 mb-1 font-bold">Mã QR Mẫu Bàn 1</h5>
                        <p class="text-slate-500 small mb-0">Dùng camera điện thoại để quét thử giao diện</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-4 border-top border-slate-200 bg-slate-100">
        <div class="container text-center text-md-between d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold text-slate-900">ResManager</span>
                <span class="text-slate-500 small">© 2026 Hệ thống Quản Lý Nhà Hàng & Đặt Món QR.</span>
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
