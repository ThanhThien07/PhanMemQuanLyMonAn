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
    
    <style>
        :root {
            --primary-gold: #f59e0b;
            --primary-dark: #0f172a;
            --secondary-dark: #1e293b;
            --accent-emerald: #10b981;
            --accent-purple: #8b5cf6;
            --text-muted: #94a3b8;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0b0f19;
            color: #f8fafc;
            overflow-x: hidden;
        }

        h1, h2, h3, h4, h5, .font-heading {
            font-family: 'Outfit', sans-serif;
        }

        /* Ambient Glow Effects */
        .glow-bg-1 {
            position: absolute;
            top: -10%;
            left: 20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        .glow-bg-2 {
            position: absolute;
            top: 30%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        /* Glassmorphism Cards */
        .glass-card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
            transform: translateY(-6px);
            border-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 20px 40px -15px rgba(245, 158, 11, 0.2);
        }

        .navbar-custom {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-gold {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            padding: 12px 28px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        .btn-gold:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.45);
        }

        .btn-outline-glass {
            background: rgba(255, 255, 255, 0.05);
            color: #f8fafc;
            border: 1px solid rgba(255, 255, 255, 0.15);
            font-weight: 600;
            border-radius: 12px;
            padding: 12px 28px;
            transition: all 0.3s ease;
        }

        .btn-outline-glass:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
        }

        .badge-pill {
            background: rgba(245, 158, 11, 0.12);
            color: var(--primary-gold);
            border: 1px solid rgba(245, 158, 11, 0.3);
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
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>

    <div class="glow-bg-1"></div>
    <div class="glow-bg-2"></div>

    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top navbar-custom px-3 px-lg-5 py-3">
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" href="{{ url('/') }}">
                <div class="bg-warning text-dark rounded-3 px-2 py-1 d-flex align-items-center justify-content-center">
                    <i class="bi bi-shop fs-4"></i>
                </div>
                <span>Res<span class="text-warning">Manager</span></span>
            </a>

            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto gap-lg-3 my-2 my-lg-0">
                    <li class="nav-item"><a class="nav-link text-white fw-medium active" href="#hero">Trang Chủ</a></li>
                    <li class="nav-item"><a class="nav-link text-white-50 fw-medium" href="#features">Tính Năng</a></li>
                    <li class="nav-item"><a class="nav-link text-white-50 fw-medium" href="#qr-demo">Thử Mã QR</a></li>
                </ul>

                <div class="d-flex align-items-center gap-2 mt-3 mt-lg-0">
                    @auth
                        <a href="{{ route('ban.index') }}" class="btn btn-gold">
                            <i class="bi bi-speedometer2 me-1"></i> Vào Hệ Thống
                        </a>
                    @else
                        <a href="{{ route('login') }}" class="btn btn-outline-glass px-4">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Đăng Nhập
                        </a>
                        <a href="{{ route('register') }}" class="btn btn-gold px-4">
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

                    <h1 class="display-4 fw-extrabold text-white mb-3 lh-sm">
                        Quản Lý Nhà Hàng <br>
                        <span class="text-warning">& Gọi Món QR</span> Tự Động
                    </h1>

                    <p class="text-muted fs-5 mb-4">
                        Tối ưu 80% thời gian vận hành, tự động hóa toàn bộ quy trình từ Khách quét QR tại bàn, Màn hình Bếp thời gian thực đến Báo cáo doanh thu tự động.
                    </p>

                    <div class="d-flex flex-wrap gap-3 mb-4">
                        @auth
                            <a href="{{ route('ban.index') }}" class="btn btn-gold btn-lg fs-6">
                                <i class="bi bi-grid-fill me-2"></i> Mở Trang Quản Lý Bàn
                            </a>
                        @else
                            <a href="{{ route('login') }}" class="btn btn-gold btn-lg fs-6">
                                <i class="bi bi-rocket-takeoff me-2"></i> Trải Nghiệm Ngay
                            </a>
                            <a href="{{ route('dat_mon.qr_order', 1) }}" class="btn btn-outline-glass btn-lg fs-6">
                                <i class="bi bi-qr-code-scan me-2"></i> Thử Quét QR Bàn 1
                            </a>
                        @endauth
                    </div>

                    <div class="row g-3 pt-3 border-top border-secondary border-opacity-25">
                        <div class="col-4">
                            <div class="stat-number">100%</div>
                            <div class="text-muted small">Thời gian thực</div>
                        </div>
                        <div class="col-4">
                            <div class="stat-number">0s</div>
                            <div class="text-muted small">Trễ thông báo Bếp</div>
                        </div>
                        <div class="col-4">
                            <div class="stat-number">24/7</div>
                            <div class="text-muted small">Báo cáo tự động</div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 text-center position-relative">
                    <div class="glass-card p-3 p-lg-4 text-start">
                        <div class="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                            <div class="d-flex align-items-center gap-2">
                                <span class="bg-success rounded-circle p-1 d-inline-block"></span>
                                <strong class="text-white">Màn Hình Quản Lý Bàn Live</strong>
                            </div>
                            <span class="badge bg-warning bg-opacity-20 text-warning px-3 py-1">Sơ đồ Bàn</span>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-4">
                                <div class="bg-success bg-opacity-20 border border-success rounded-3 p-2 text-center">
                                    <small class="text-success d-block fw-bold">Bàn 01 (Đang ăn)</small>
                                    <span class="small text-white">450.000đ</span>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="bg-warning bg-opacity-20 border border-warning rounded-3 p-2 text-center">
                                    <small class="text-warning d-block fw-bold">Bàn 02 (Chờ món)</small>
                                    <span class="small text-white">3 món</span>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="bg-secondary bg-opacity-20 border border-secondary rounded-3 p-2 text-center">
                                    <small class="text-muted d-block">Bàn 03 (Trống)</small>
                                    <span class="small text-white-50">Sẵn sàng</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-dark rounded-3 p-3 text-white-50 small border border-secondary border-opacity-25">
                            <div class="d-flex justify-content-between mb-1">
                                <span><i class="bi bi-bell-fill text-warning me-1"></i> Bàn 05 vừa đặt thêm món</span>
                                <span class="badge bg-danger">Mới</span>
                            </div>
                            <div class="d-flex justify-content-between">
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
                <h2 class="display-6 fw-bold text-white">Mọi Thứ Bạn Cần Cho Nhà Hàng</h2>
                <p class="text-muted">Được thiết kế chuẩn hóa cho Quán Ăn, Nhà Hàng, Quán Cafe và Chuỗi F&B hiện đại.</p>
            </div>

            <div class="row g-4">
                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-warning bg-opacity-20 text-warning">
                            <i class="bi bi-qr-code-scan"></i>
                        </div>
                        <h4 class="text-white fs-5 fw-bold mb-2">Đặt Món Mã QR</h4>
                        <p class="text-muted small mb-0">Khách tự quét mã tại bàn bằng điện thoại, không cần cài app. Chọn món và gửi yêu cầu xuống bếp tức thì.</p>
                    </div>
                </div>

                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-success bg-opacity-20 text-success">
                            <i class="bi bi-display"></i>
                        </div>
                        <h4 class="text-white fs-5 fw-bold mb-2">Màn Hình Bếp (KDS)</h4>
                        <p class="text-muted small mb-0">Bếp nhận đơn theo thứ tự thời gian thực, có âm thanh thông báo và đổi trạng thái Chế biến / Hoàn thành nhanh chóng.</p>
                    </div>
                </div>

                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-info bg-opacity-20 text-info">
                            <i class="bi bi-box-seam"></i>
                        </div>
                        <h4 class="text-white fs-5 fw-bold mb-2">Quản Lý Kho Nguyên Liệu</h4>
                        <p class="text-muted small mb-0">Tự động trừ kho khi món ăn được chế biến, cảnh báo nguyên liệu sắp hết và tạo đơn nhập hàng chính xác.</p>
                    </div>
                </div>

                <div class="col-md-6 col-lg-3">
                    <div class="glass-card p-4 h-100">
                        <div class="feature-icon bg-purple bg-opacity-20 text-purple" style="color: #a855f7;">
                            <i class="bi bi-graph-up-arrow"></i>
                        </div>
                        <h4 class="text-white fs-5 fw-bold mb-2">Báo Cáo Doanh Thu</h4>
                        <p class="text-muted small mb-0">Thống kê doanh số theo ngày/tuần/tháng, vẽ biểu đồ top món bán chạy và xuất file Excel / PDF báo cáo tự động.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- QR Demo Section -->
    <section id="qr-demo" class="py-5 bg-dark bg-opacity-50 border-top border-bottom border-secondary border-opacity-25">
        <div class="container py-lg-4">
            <div class="row align-items-center gy-4">
                <div class="col-lg-6">
                    <span class="badge-pill mb-2"><i class="bi bi-phone"></i> Trải Nghiệm Khách Hàng</span>
                    <h2 class="display-6 fw-bold text-white mb-3">Thử Ngay Giao Diện Đặt Món QR</h2>
                    <p class="text-muted mb-4">
                        Khách hàng chỉ cần quét mã QR tại bàn để xem thực đơn thực tế, chọn món, ghi chú yêu cầu (ít cay, không hành) và theo dõi tiến độ món ăn ngay trên điện thoại.
                    </p>
                    <div class="d-flex gap-3">
                        <a href="{{ route('dat_mon.qr_order', 1) }}" target="_blank" class="btn btn-gold">
                            <i class="bi bi-box-arrow-up-right me-1"></i> Mở Đặt Món QR Bàn 1
                        </a>
                    </div>
                </div>

                <div class="col-lg-6 text-center">
                    <div class="glass-card p-4 d-inline-block">
                        <div class="bg-white p-3 rounded-4 d-inline-block mb-3">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={{ urlencode(url('/qr-order/1')) }}" 
                                 alt="QR Order Demo" 
                                 class="img-fluid rounded-3"
                                 onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' fill=\'%23000\' viewBox=\'0 0 16 16\'><path d=\'M2 2h4v4H2V2zm6 0h4v4H8V2zM2 8h4v4H2V8zm10 2h2v2h-2v-2z\'/></svg>';">
                        </div>
                        <h5 class="text-white mb-1">Mã QR Mẫu Bàn 1</h5>
                        <p class="text-muted small mb-0">Dùng camera điện thoại để quét thử giao diện</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-4 border-top border-secondary border-opacity-25">
        <div class="container text-center text-md-between d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold text-white">ResManager</span>
                <span class="text-muted">© 2026 Hệ thống Quản Lý Nhà Hàng & Đặt Món QR.</span>
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
