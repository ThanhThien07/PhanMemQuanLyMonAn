<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>M&S QR Order - Bàn {{ $ban->id }}</title>

    <!-- Google Fonts: Outfit -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 & Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

    <!-- Laravel Reverb & Echo Real-time Integration -->
    <script src="https://js.pusher.com/8.0.1/pusher.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.16.0/dist/echo.iife.js"></script>
    <script>
      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: 'reverb',
        key: '{{ config("broadcasting.connections.reverb.key") }}',
        wsHost: '{{ config("broadcasting.connections.reverb.options.host", "127.0.0.1") }}',
        wsPort: {{ config("broadcasting.connections.reverb.options.port", 8080) }},
        wssPort: {{ config("broadcasting.connections.reverb.options.port", 8080) }},
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
      });
    </script>

    <!-- Mobile-First Premium Custom Styling -->
    <style>
      :root {
        --ms-primary: #8e192a;
        --ms-secondary: #e6b15c;
        --ms-dark: #121212;
        --ms-light: #fdfaf6;
        --font-outfit: 'Outfit', sans-serif;
      }

      body {
        font-family: var(--font-outfit);
        background-color: #f7f4ec;
        color: #2b2b2b;
        padding-bottom: 90px; /* Space for sticky bottom cart */
      }

      .mobile-header {
        background: linear-gradient(135deg, var(--ms-primary), #5a0c18);
        border-bottom: 3px solid var(--ms-secondary);
        color: white;
        padding: 20px;
        text-align: center;
        border-bottom-left-radius: 24px;
        border-bottom-right-radius: 24px;
        box-shadow: 0 4px 15px rgba(142, 25, 42, 0.15);
      }

      /* Horizontal scrolling category bar */
      .scroll-category-bar {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 12px;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        scrollbar-width: none; /* Firefox */
      }

      .scroll-category-bar::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
      }

      .menu-category-btn {
        border-radius: 20px;
        font-weight: 600;
        padding: 8px 18px;
        font-size: 13.5px;
        transition: all 0.2s ease;
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.08);
        color: #555;
        white-space: nowrap;
        box-shadow: 0 2px 5px rgba(0,0,0,0.02);
      }

      .menu-category-btn:hover {
        border-color: var(--ms-primary);
        color: var(--ms-primary);
      }

      .menu-category-btn.active {
        background-color: var(--ms-primary);
        color: white !important;
        border-color: var(--ms-primary);
        box-shadow: 0 4px 10px rgba(142, 25, 42, 0.2);
      }

      /* Dish Cards */
      .dish-card {
        background: white;
        border: none;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        transition: all 0.2s ease;
        overflow: hidden;
        height: 100%;
      }

      .dish-card:active {
        transform: scale(0.98);
        background-color: #fafafa;
      }

      .dish-price {
        color: var(--ms-primary);
        font-weight: 700;
        font-size: 16px;
      }

      .dish-time-badge {
        background-color: rgba(230, 177, 92, 0.15);
        color: #ac7723;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 8px;
        font-weight: 600;
      }

      /* Ordered Progress list */
      .ordered-item-card {
        background: white;
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.01);
        border-left: 4px solid var(--ms-secondary);
      }

      .progress-bar-ms {
        height: 6px;
        border-radius: 3px;
        background-color: #e9ecef;
        overflow: hidden;
        margin-top: 10px;
      }

      .progress-bar-ms-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.4s ease;
      }

      /* Sticky bottom bar */
      .bottom-sticky-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        padding: 15px 20px;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
        z-index: 1000;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
      }

      .btn-payment {
        border-radius: 12px;
        padding: 12px;
        font-weight: 700;
        font-size: 15px;
        transition: all 0.2s ease;
      }

      .btn-payment-cash {
        background-color: #6c757d;
        color: white;
        border: none;
      }

      .btn-payment-qr {
        background-color: var(--ms-primary);
        color: white;
        border: none;
      }

      /* Success Screen Overlay */
      .success-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 2000;
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 30px;
        text-align: center;
      }

      .success-icon {
        font-size: 80px;
        color: #198754;
        animation: scale-up 0.5s ease;
      }

      @keyframes scale-up {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .cursor-pointer {
        cursor: pointer;
      }
      .hover-card:hover {
        border-color: var(--ms-primary) !important;
        background-color: rgba(142, 25, 42, 0.02);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
    </style>
  </head>
  <body>

    <!-- Success Screen Overlay -->
    <div class="success-overlay" id="successScreen">
      <i class="bi bi-patch-check-fill success-icon mb-4"></i>
      <h2 class="fw-bold text-dark mb-2">THANH TOÁN THÀNH CÔNG</h2>
      <p class="text-secondary mb-4">Cảm ơn bạn đã lựa chọn và thưởng thức ẩm thực tại <strong>M&S</strong>. Chúc bạn một ngày tốt lành và hẹn gặp lại!</p>
      <button class="btn btn-premium px-4" onclick="location.reload()">Quay lại Menu</button>
    </div>

    <!-- Mobile Header -->
    <header class="mobile-header">
      <h1 class="h3 fw-bold mb-1"><i class="bi bi-egg-fried me-2 text-warning"></i>ẨM THỰC M&S</h1>
      <div class="badge bg-white text-dark px-3 py-2 fw-bold mb-0 shadow-sm" style="border-radius:12px; font-size: 14px;">
        <i class="bi bi-geo-alt-fill text-danger me-1"></i>BÀN ĂN SỐ {{ $ban->id }} 
        <span class="ms-2 border-start ps-2 text-secondary" style="border-left: 2px solid #ddd !important;">
          <i class="bi bi-people-fill text-primary me-1"></i><span id="guestCountHeader">{{ $ban->so_luong_khach ?: 0 }}</span> khách
          <a href="#" onclick="openEditGuestCountModal()" class="text-warning ms-1" title="Sửa số khách"><i class="bi bi-pencil-square"></i></a>
        </span>
      </div>
    </header>

    <div class="container-fluid py-4 px-3">
      <!-- Main Navigation Tabs -->
      <ul class="nav nav-pills justify-content-center gap-2 mb-4">
        <li class="nav-item">
          <button class="nav-link menu-category-btn active px-4" id="menu-tab-btn" onclick="switchTab('menu')">
            <i class="bi bi-book-half me-1"></i>Thực Đơn Gọi Món
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link menu-category-btn position-relative px-4" id="ordered-tab-btn" onclick="switchTab('ordered')">
            <i class="bi bi-clock-history me-1"></i>Trạng Thái Bếp
            <span id="orderedCountBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger {{ $ban->activeDatMons->count() === 0 ? 'd-none' : '' }}" style="font-size: 10px;">
              {{ $ban->activeDatMons->count() }}
            </span>
          </button>
        </li>
      </ul>

      <!-- TAB 1: MENU GOI MON -->
      <div id="tab-menu-content">
        <!-- Horizontal scrolling Category Bar -->
        <div class="scroll-category-bar">
          <button class="menu-category-btn active" onclick="filterMenu('TatCa', this)">Tất cả</button>
          @foreach ($categories as $cat)
            <button class="menu-category-btn" onclick="filterMenu('{{ $cat->id }}', this)">{{ $cat->ten_loai }}</button>
          @endforeach
        </div>

        <h5 class="fw-bold text-dark mb-3"><i class="bi bi-heart-fill text-danger me-2"></i>Thực đơn M&S đặc sản</h5>
        <div class="row g-3">
          @foreach ($menuItems as $item)
            <div class="col-12 col-md-6 menu-item-card animate-fade-in" data-cat-id="{{ $item->loai_mon_id }}">
              <div class="dish-card d-flex p-3" onclick="openOrderModal('{{ $item->ten }}', {{ $item->gia }}, {{ $item->time }})">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <h6 class="fw-bold text-dark mb-0">{{ $item->ten }}</h6>
                    @if ($item->loaiMon)
                      <span class="badge bg-secondary text-white" style="font-size: 9px; padding: 2px 6px;">{{ $item->loaiMon->ten_loai }}</span>
                    @endif
                  </div>
                  <p class="text-secondary small mb-2" style="font-size: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{ $item->mota ?: 'Hương vị tuyệt hảo được chế biến bởi đầu bếp giàu kinh nghiệm.' }}
                  </p>
                  <div class="d-flex align-items-center gap-2">
                    <span class="dish-price">{{ number_format($item->gia) }}đ</span>
                    <span class="dish-time-badge"><i class="bi bi-clock me-1"></i>{{ $item->time }} phút</span>
                  </div>
                </div>
                <div class="ms-3 d-flex align-items-center justify-content-center bg-light rounded-circle text-primary" style="width: 40px; height: 40px; min-width: 40px;">
                  <i class="bi bi-plus-lg fs-5"></i>
                </div>
              </div>
            </div>
          @endforeach
        </div>
      </div>

      <!-- TAB 2: TRANG THAI BEP (ORDERED PROGRESS) -->
      <div id="tab-ordered-content" style="display: none;">
        <div id="orderedItemsContainer">
          @include('ban.ordered_items_grid')
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Cart & Payment Bar -->
    <div id="stickyBottomBar" class="bottom-sticky-bar d-flex justify-content-between align-items-center gap-3">
      @if ($ban->activeDatMons->count() > 0)
        <button class="btn btn-payment btn-payment-qr w-100 py-3 fw-bold fs-5 shadow-sm" onclick="openPaymentMethodModal()" style="background: linear-gradient(135deg, #8e192a, #dc3545);">
          <i class="bi bi-wallet2 me-2"></i>Yêu cầu Thanh toán (Tiền mặt / QR)
        </button>
      @else
        <div class="text-secondary small w-100 text-center py-2 fw-semibold">
          <i class="bi bi-emoji-smile me-1 text-warning"></i> Chào mừng bạn! Quét QR đặt món miễn phí.
        </div>
      @endif
    </div>

    <!-- Modal: Gọi món chi tiết -->
    <div class="modal fade" id="orderItemModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
          <div class="modal-header bg-premium text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
            <h5 class="modal-title fw-bold" id="orderModalTitle">TÊN MÓN ĂN</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <h4 class="fw-bold text-primary mb-3" id="orderModalPrice">0đ</h4>
            
            <div class="mb-3 d-flex align-items-center justify-content-between">
              <span class="fw-semibold text-dark">Số lượng phần gọi:</span>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-secondary rounded-circle py-0 px-2 fs-5" style="width:36px; height:36px;" onclick="changeQty(-1)">-</button>
                <input type="number" id="orderQtyInput" class="form-control text-center fw-bold py-1" value="1" min="1" readonly style="width: 60px;">
                <button class="btn btn-outline-secondary rounded-circle py-0 px-2 fs-5" style="width:36px; height:36px;" onclick="changeQty(1)">+</button>
              </div>
            </div>

            <!-- Priority Order Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark">Thứ tự ưu tiên chế biến</label>
              <select id="orderPriorityInput" class="form-select bg-light border-0">
                <option value="1" selected>Bình thường (Chế biến tuần tự)</option>
                <option value="2">Mức 2 - Ra trước các món chính</option>
                <option value="3">Mức 3 - Ra món đầu tiên (Ưu tiên đặc biệt)</option>
              </select>
              <div class="text-secondary small mt-1" style="font-size:11px;">Món ăn được xếp số thứ tự nhỏ sẽ được đầu bếp làm trước.</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-dark">Ghi chú ẩm thực (yêu cầu đặc biệt)</label>
              <textarea id="orderNoteInput" class="form-control" rows="2" placeholder="Ví dụ: không hành, ít đá, nhiều sữa, v.v."></textarea>
            </div>

            <div class="p-2 rounded bg-warning bg-opacity-10 text-warning text-center small fw-semibold">
              <i class="bi bi-clock me-1"></i>Thời gian chế biến dự kiến: <span id="orderModalTime">0</span> phút
            </div>
          </div>
          <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
            <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-premium py-2 px-4" id="submitOrderBtn" onclick="submitOrder()">Gửi xuống bếp</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Lựa chọn Phương thức Thanh toán -->
    <div class="modal fade" id="paymentMethodModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
          <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
            <h5 class="modal-title fw-bold text-warning"><i class="bi bi-wallet2 me-2"></i>PHƯƠNG THỨC THANH TOÁN</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4" id="paymentModalContent">
            <!-- Step 1: Selection screen -->
            <div id="paymentSelectionArea">
              <p class="text-secondary small text-center mb-4">Vui lòng chọn một trong hai phương thức thanh toán dưới đây:</p>
              
              <div class="row g-3">
                <!-- Option Cash -->
                <div class="col-12">
                  <div class="card border border-2 p-3 text-center cursor-pointer hover-card" onclick="selectCashPayment()" style="border-radius:16px; transition: all 0.2s;">
                    <i class="bi bi-cash-coin text-success fs-2 mb-2"></i>
                    <h6 class="fw-bold text-dark mb-1">Thanh toán Tiền mặt</h6>
                    <span class="small text-secondary">Nhân viên phục vụ sẽ mang hóa đơn và đến bàn thu tiền trực tiếp.</span>
                  </div>
                </div>
                
                <!-- Option QR -->
                <div class="col-12">
                  <div class="card border border-2 p-3 text-center cursor-pointer hover-card" onclick="selectQrPayment()" style="border-radius:16px; transition: all 0.2s;">
                    <i class="bi bi-qr-code-scan text-primary fs-2 mb-2"></i>
                    <h6 class="fw-bold text-dark mb-1">Chuyển khoản VietQR</h6>
                    <span class="small text-secondary">Tự thanh toán quét mã QR qua ngân hàng nhanh chóng và tiện lợi.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Screen: Cash Success Feedback -->
            <div id="cashSuccessArea" class="d-none text-center py-3">
              <i class="bi bi-check-circle-fill text-success mb-3 d-block animate-bounce" style="font-size: 60px;"></i>
              <h5 class="fw-bold text-dark mb-2">Đã báo nhân viên!</h5>
              <p class="text-secondary small mb-4">Hệ thống đã phát thông báo. Phục vụ ca trực sẽ tới bàn số <strong>{{ $ban->id }}</strong> của bạn ngay.</p>
              <button class="btn btn-success px-4 py-2 w-100" data-bs-dismiss="modal" style="border-radius:12px;">Đồng ý</button>
            </div>

            <!-- Screen: QR Payment Screen -->
            <div id="qrPaymentArea" class="d-none text-center">
              <h6 class="text-secondary small mb-3">Quét mã VietQR để thanh toán hóa đơn của bạn</h6>
              
              <a href="https://img.vietqr.io/image/momo-PSG2618416000000006-compact2.png?amount={{ $totalBill }}&addInfo=Thanh+Toan+MS+Ban+{{ $ban->id }}&accountName=NGUYEN+HOANG+HUNG" target="_blank" title="Bấm để xem ảnh lớn">
                <img src="https://img.vietqr.io/image/momo-PSG2618416000000006-compact2.png?amount={{ $totalBill }}&addInfo=Thanh+Toan+MS+Ban+{{ $ban->id }}&accountName=NGUYEN+HOANG+HUNG" 
                     onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={{ urlencode('VietQR Payment: ' . number_format($totalBill) . ' VND - Ban ' . $ban->id) }}';"
                     alt="VietQR M&S Payment" class="img-fluid rounded mb-3 border shadow-sm" style="max-height: 250px; cursor: pointer;">
              </a>
              
              <div class="p-2 mb-3 bg-light rounded text-dark font-weight-bold" style="font-size:13px;">
                Số tiền: <strong class="text-primary">{{ number_format($totalBill) }}đ</strong><br>
                Nội dung: <strong>Thanh Toan MS Ban {{ $ban->id }}</strong>
              </div>

              <!-- Simulation helper buttons -->
              <div class="card border-0 p-3 bg-warning bg-opacity-10 text-start" style="border-radius:12px;">
                <h6 class="fw-bold text-dark mb-1 small"><i class="bi bi-braces me-2"></i>Khu vực Mô phỏng (Simulator)</h6>
                <p class="small text-secondary mb-3">Mô phỏng hành động khách đã chuyển tiền thành công trên điện thoại:</p>
                <button class="btn btn-premium w-100 py-2" onclick="simulateQrPaid()">
                  <i class="bi bi-check-circle-fill me-2"></i>Đã Chuyển khoản thành công
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nhập Số lượng khách ban đầu (Không cho đóng) -->
    <div class="modal fade" id="guestCountInitModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
          <div class="modal-header bg-premium text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
            <h5 class="modal-title fw-bold text-white"><i class="bi bi-people-fill me-2"></i>SỐ KHÁCH DÙNG BỮA</h5>
          </div>
          <div class="modal-body p-4 text-center">
            <h6 class="text-secondary mb-3">Chào mừng quý khách đến với nhà hàng <strong>M&S</strong>!</h6>
            <p class="small text-muted mb-4">Vui lòng nhập số lượng khách dùng bữa tại bàn này để chúng tôi chuẩn bị dụng cụ tốt nhất:</p>
            
            <div class="d-flex align-items-center justify-content-center gap-3 mb-4">
              <button class="btn btn-outline-secondary rounded-circle" style="width:45px; height:45px; font-size:20px; font-weight:bold;" onclick="adjustInitGuest(-1)">-</button>
              <input type="number" id="initGuestInput" class="form-control text-center fw-bold text-primary" value="2" min="1" readonly style="width: 80px; font-size: 24px; border-radius:12px;">
              <button class="btn btn-outline-secondary rounded-circle" style="width:45px; height:45px; font-size:20px; font-weight:bold;" onclick="adjustInitGuest(1)">+</button>
            </div>

            <button class="btn btn-premium w-100 py-3 fw-bold shadow-sm" onclick="submitInitGuestCount()" style="border-radius:12px; font-size:16px;">
              Xác nhận & Bắt đầu gọi món
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Sửa Số lượng khách (Cho phép đóng) -->
    <div class="modal fade" id="guestCountEditModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
          <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
            <h5 class="modal-title fw-bold text-warning"><i class="bi bi-people-fill me-2"></i>CẬP NHẬT SỐ KHÁCH</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <p class="small text-muted mb-4">Nhập số lượng khách hiện tại đang dùng bữa tại bàn:</p>
            
            <div class="d-flex align-items-center justify-content-center gap-3 mb-4">
              <button class="btn btn-outline-secondary rounded-circle" style="width:45px; height:45px; font-size:20px; font-weight:bold;" onclick="adjustEditGuest(-1)">-</button>
              <input type="number" id="editGuestInput" class="form-control text-center fw-bold text-primary" value="{{ $ban->so_luong_khach ?: 2 }}" min="1" readonly style="width: 80px; font-size: 24px; border-radius:12px;">
              <button class="btn btn-outline-secondary rounded-circle" style="width:45px; height:45px; font-size:20px; font-weight:bold;" onclick="adjustEditGuest(1)">+</button>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-secondary flex-fill py-2" data-bs-dismiss="modal" style="border-radius:12px;">Hủy</button>
              <button class="btn btn-premium flex-fill py-2 fw-bold" onclick="submitEditGuestCount()" style="border-radius:12px;">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM THÔNG BÁO ƯU ĐÃI REALTIME PHỦ GIỮA MÀN HÌNH (Centered Modal) -->
    <div class="modal fade" id="realtimeOfferModal" tabindex="-1" aria-labelledby="realtimeOfferModalLabel" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden" style="background: #0f172a; color: #fff;">
          
          <!-- Top Glow Banner -->
          <div class="p-4 text-center position-relative" style="background: linear-gradient(135deg, #8e192a 0%, #3b0764 50%, #0f172a 100%);">
            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
            
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; font-size: 13px; font-weight: 700;">
              <span class="spinner-grow spinner-grow-sm text-warning" role="status"></span>
              <span>THÔNG BÁO ƯU ĐÃI REALTIME DÀNH CHO BẠN</span>
            </div>

            <h3 class="fw-bold mb-1 text-white">🎉 Chào Mừng {{ $customer->ten ?? 'Khách Hàng' }}!</h3>
            <p class="text-white-50 small mb-0">Hệ thống vừa cập nhật chương trình tri ân & voucher ưu đãi trực tiếp cho bạn</p>
          </div>

          <div class="modal-body p-4">
            <!-- Customer Membership Card & Level Progress -->
            <div class="p-3 mb-4 rounded-3" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.1);">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="fs-4">{{ $customer->voucher_uu_dai['badge'] ?? '🥉 Thành Viên' }}</span>
                  <div>
                    <strong class="d-block text-white fs-5">{{ $customer->ten ?? 'Khách Hàng' }}</strong>
                    <small class="text-white-50">SĐT: {{ $customer->sdt ?? 'Khách Quét QR' }}</small>
                  </div>
                </div>
                <div class="text-end">
                  <span class="badge bg-warning text-dark fs-6 px-3 py-1.5 fw-bold">{{ $customer->diem_tich_luy ?? 0 }} điểm</span>
                  <small class="d-block text-white-50 mt-1">Hạng: <strong>{{ $customer->hang_thanh_vien ?? 'Đồng' }}</strong></small>
                </div>
              </div>

              <!-- Progress Bar towards Next Tier -->
              @php $nextTier = $customer->next_tier_info; @endphp
              <div class="mt-3">
                <div class="d-flex justify-content-between small text-white-50 mb-1">
                  <span>Tiến trình nâng cấp Hạng tiếp theo</span>
                  <span class="text-warning fw-semibold">{{ $nextTier['next_tier'] }}</span>
                </div>
                <div class="progress bg-dark" style="height: 10px; border-radius: 6px;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style="width: {{ $nextTier['progress_percent'] }}%"></div>
                </div>
                @if($nextTier['needed_points'] > 0)
                  <small class="text-white-50 d-block mt-2" style="font-size:12px;">💡 Đặt thêm món tích lũy <strong>{{ $nextTier['needed_points'] }} điểm</strong> nữa để tự động nâng cấp Hạng và nhận Voucher xịn hơn!</small>
                @else
                  <small class="text-success d-block mt-2" style="font-size:12px;">👑 Bạn đã đạt Hạng VIP Kim Cương tối cao với ngập tràn ưu đãi đặc quyền!</small>
                @endif
              </div>
            </div>

            <!-- Exclusive Voucher Box -->
            @php $voucher = $customer->voucher_uu_dai; @endphp
            <div class="p-4 mb-4 rounded-3 text-center position-relative" style="background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(142,25,42,0.15) 100%); border: 2px dashed #f59e0b;">
              <span class="badge bg-danger position-absolute top-0 start-50 translate-middle px-3 py-1 rounded-pill fw-bold">MÃ ƯU ĐÃI ĐỘC QUYỀN</span>
              <h5 class="fw-bold text-warning mb-1 mt-1">{{ $voucher['title'] }}</h5>
              <p class="text-white-50 small mb-3">{{ $voucher['desc'] }}</p>

              <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                <div class="bg-dark text-warning font-monospace fw-bold fs-3 px-4 py-2 rounded-3 border border-warning border-opacity-50" id="voucherCodeText">
                  {{ $voucher['code'] }}
                </div>
                <button class="btn btn-outline-warning" onclick="copyVoucherCode('{{ $voucher['code'] }}')">
                  <i class="bi bi-copy me-1"></i> Sao chép
                </button>
              </div>

              <button type="button" class="btn btn-warning btn-lg fw-bold px-4 py-2.5 shadow text-dark w-100" onclick="applyVoucherDirect('{{ $voucher['code'] }}', {{ $voucher['discount_val'] }}, {{ $voucher['discount_percent'] }})">
                <i class="bi bi-lightning-charge-fill me-1"></i> ÁP DỤNG VOUCHER NGAY HÔM NAY ⚡
              </button>
            </div>

            <!-- Realtime Live Ticker Activity -->
            <div class="p-3 bg-dark bg-opacity-75 rounded-3 d-flex align-items-center gap-2 border border-secondary border-opacity-25 small text-white-50">
              <span class="spinner-grow spinner-grow-sm text-success flex-shrink-0" role="status"></span>
              <div class="text-truncate">
                <strong class="text-success">Realtime Alert:</strong> Vừa có khách hàng tại Bàn 03 áp dụng mã <span class="text-warning fw-bold">{{ $voucher['code'] }}</span> thành công!
              </div>
            </div>
          </div>

          <div class="modal-footer border-top border-secondary border-opacity-25 justify-content-between p-3">
            <div class="text-white-50 small">
              <i class="bi bi-info-circle text-warning me-1"></i> Tích điểm tự động khi gọi món thành công
            </div>
            <button type="button" class="btn btn-outline-light px-4" data-bs-dismiss="modal">Đóng & Xem Thực Đơn</button>
          </div>

        </div>
      </div>
    </div>

    <!-- Bootstrap 5 JavaScript & jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      // =========================================================================
      // CẤU HÌNH & XỬ LÝ KHÁCH HÀNG QUÉT QR TỰ ĐẶT MÓN TẠI BÀN
      // =========================================================================
      // Biến lưu thông tin ID bàn hiện tại và món ăn đang được thao tác trong Modal
      const banId = {{ $ban->id }};
      let activeItem = { ten: '', gia: 0, time: 0 };

      // Hàm chuyển đổi tab giữa "Thực Đơn Gọi Món" và "Trạng Thái Bếp"
      function switchTab(tab) {
        if (tab === 'menu') {
          $('#tab-menu-content').show();
          $('#tab-ordered-content').hide();
          $('#menu-tab-btn').addClass('active');
          $('#ordered-tab-btn').removeClass('active');
        } else {
          $('#tab-menu-content').hide();
          $('#tab-ordered-content').show();
          $('#menu-tab-btn').removeClass('active');
          $('#ordered-tab-btn').addClass('active');
        }
      }

      // Hàm lọc danh sách món ăn hiển thị theo danh mục (Loại món ăn) được nhấn
      function filterMenu(catId, btn) {
        $('.menu-category-btn').removeClass('active');
        $(btn).addClass('active');

        if (catId === 'TatCa') {
          $('.menu-item-card').show();
        } else {
          $('.menu-item-card').hide();
          $(`.menu-item-card[data-cat-id="${catId}"]`).show();
        }
      }

      // Hàm mở Modal cấu hình chi tiết món ăn (Số lượng, Ghi chú, Thứ tự ưu tiên) khi khách chọn món
      function openOrderModal(ten, gia, time) {
        activeItem = { ten, gia, time };
        $('#orderModalTitle').text(ten);
        $('#orderModalPrice').text(numberWithCommas(gia) + 'đ');
        $('#orderModalTime').text(time);
        $('#orderQtyInput').val(1);
        $('#orderNoteInput').val('');
        $('#orderPriorityInput').val('1'); // Mặc định thứ tự ưu tiên là 1 (Bình thường)
        
        const myModal = new bootstrap.Modal(document.getElementById('orderItemModal'));
        myModal.show();
      }

      // Tăng hoặc giảm số lượng phần ăn gọi trong Modal đặt món
      function changeQty(delta) {
        let val = parseInt($('#orderQtyInput').val()) + delta;
        if (val < 1) val = 1;
        $('#orderQtyInput').val(val);
      }

      // Gửi yêu cầu đặt món ăn qua API AJAX POST lên server
      function submitOrder() {
        $('#submitOrderBtn').prop('disabled', true).text('Đang gửi...');

        const qty = parseInt($('#orderQtyInput').val());
        const note = $('#orderNoteInput').val();
        const priority = $('#orderPriorityInput').val();

        $.ajax({
          url: `/qr-order/${banId}/order`,
          type: 'POST',
          data: {
            _token: '{{ csrf_token() }}',
            ten_mon: activeItem.ten,
            don_gia: activeItem.gia,
            thoi_gian_uoc_tinh: activeItem.time,
            so_luong: qty,
            ghi_chu: note,
            thu_tu_uu_tien: priority
          },
          success: function(res) {
            if (res.success) {
              // Ẩn modal chọn món và thông báo thành công
              bootstrap.Modal.getInstance(document.getElementById('orderItemModal')).hide();
              alert(res.message);
              $('#submitOrderBtn').prop('disabled', false).text('Gửi xuống bếp');
              
              // Cập nhật động lại bảng tiến trình nấu món và chuyển ngay sang tab "Trạng Thái Bếp"
              refreshOrderedItemsGrid(function() {
                switchTab('ordered');
              });
            }
          },
          error: function(err) {
            alert('Không thể gửi đơn món ăn. Vui lòng thử lại!');
            $('#submitOrderBtn').prop('disabled', false).text('Gửi xuống bếp');
          }
        });
      }

      // Tải lại ngầm HTML của bảng tiến độ món ăn đã đặt và cập nhật Badge số lượng
      function refreshOrderedItemsGrid(onSuccess = null) {
        $.ajax({
          url: `/api/qr-ordered-grid-html/${banId}`,
          type: 'GET',
          success: function(html) {
            $('#orderedItemsContainer').html(html);
            
            // Đếm số lượng món đang có trong grid để hiển thị lên huy hiệu thông báo
            const totalItemsCount = $('#orderedItemsContainer .ordered-item-card').length;
            if (totalItemsCount > 0) {
              $('#orderedCountBadge').text(totalItemsCount).removeClass('d-none');
              
              // Thay đổi hiển thị thanh thanh toán nổi ở cuối trang
              const newBottomHtml = `
                <button class="btn btn-payment btn-payment-qr w-100 py-3 fw-bold fs-5 shadow-sm" onclick="openPaymentMethodModal()" style="background: linear-gradient(135deg, #8e192a, #dc3545);">
                  <i class="bi bi-wallet2 me-2"></i>Yêu cầu Thanh toán (Tiền mặt / QR)
                </button>
              `;
              $('#stickyBottomBar').html(newBottomHtml);
            } else {
              $('#orderedCountBadge').addClass('d-none');
              const newBottomHtml = `
                <div class="text-secondary small w-100 text-center py-2 fw-semibold">
                  <i class="bi bi-emoji-smile me-1 text-warning"></i> Chào mừng bạn! Quét QR đặt món miễn phí.
                </div>
              `;
              $('#stickyBottomBar').html(newBottomHtml);
            }
            
            pollRealtimeWaitTimes();
            if (onSuccess) onSuccess();
          }
        });
      }

      // Kết nối Pusher/Laravel Echo cập nhật giao diện tự động khi Bếp thay đổi trạng thái món
      if (window.Echo) {
        window.Echo.channel('orders')
          .listen('OrderStatusUpdated', (e) => {
            console.log('Echo OrderStatusUpdated event:', e);
            if (e.ban_id == banId) {
              refreshOrderedItemsGrid();
            }
          });

        window.Echo.channel('tables')
          .listen('TableStateUpdated', (e) => {
            console.log('Echo TableStateUpdated event:', e);
            if (e.id == banId) {
              if (e.action === 'checkout') {
                // Hiển thị ngay màn hình thanh toán thành công nếu thu ngân đã đóng bàn
                $('#successScreen').css('display', 'flex');
              } else {
                refreshOrderedItemsGrid();
              }
            }
          });
      }

      // Mở Modal lựa chọn phương thức thanh toán
      function openPaymentMethodModal() {
        // Reset giao diện các bước thanh toán trong modal
        $('#paymentSelectionArea').removeClass('d-none');
        $('#cashSuccessArea').addClass('d-none');
        $('#qrPaymentArea').addClass('d-none');
        
        const myModal = new bootstrap.Modal(document.getElementById('paymentMethodModal'));
        myModal.show();
      }

      // Xử lý khi khách chọn thanh toán bằng "Tiền mặt tại quầy"
      function selectCashPayment() {
        requestPayment('tien_mat');
        
        $('#paymentSelectionArea').addClass('d-none');
        $('#cashSuccessArea').removeClass('d-none');
      }

      // Xử lý khi khách chọn chuyển khoản "VietQR" tự động
      function selectQrPayment() {
        requestPayment('qr');
        
        $('#paymentSelectionArea').addClass('d-none');
        $('#qrPaymentArea').removeClass('d-none');
      }

      // Gửi yêu cầu thanh toán loại tương ứng lên hệ thống để nhân viên ca trực tiếp nhận
      function requestPayment(type) {
        $.ajax({
          url: `/ban/yeu-cau-thanh-toan/${banId}`,
          type: 'POST',
          data: {
            _token: '{{ csrf_token() }}',
            type: type
          },
          success: function(res) {
            console.log('Payment request logged: ', res.message);
          }
        });
      }

      // Nút giả lập mô phỏng trường hợp khách hàng đã quét mã QR và ngân hàng báo có tiền thành công
      function simulateQrPaid() {
        $.ajax({
          url: `/ban/xac-nhan-chuyen-khoan/${banId}`,
          type: 'POST',
          data: {
            _token: '{{ csrf_token() }}'
          },
          success: function(res) {
            if (res.success) {
              bootstrap.Modal.getInstance(document.getElementById('paymentMethodModal')).hide();
              $('#successScreen').css('display', 'flex');
            }
          }
        });
      }

      // Hỏi thăm định kỳ (Polling) thời gian ước tính nấu xong còn lại của từng món dựa vào tải trọng bếp
      function pollRealtimeWaitTimes() {
        $.ajax({
          url: `/api/realtime-updates`,
          type: 'GET',
          success: function(res) {
            if (res.success) {
              res.orders.forEach(o => {
                if (o.ban_id == banId) {
                  $(`#wait-time-${o.id}`).text(o.real_wait_time + ' phút nữa');
                }
              });
            }
          }
        });
      }

      // Cài đặt chu kỳ tự động cập nhật thời gian chờ cứ mỗi 6 giây
      setInterval(pollRealtimeWaitTimes, 6000);

      // Thay đổi số lượng khách hàng khi nhập ban đầu
      function adjustInitGuest(delta) {
        let val = parseInt($('#initGuestInput').val()) + delta;
        if (val < 1) val = 1;
        $('#initGuestInput').val(val);
      }

      // Thay đổi số lượng khách hàng khi muốn sửa đổi
      function adjustEditGuest(delta) {
        let val = parseInt($('#editGuestInput').val()) + delta;
        if (val < 1) val = 1;
        $('#editGuestInput').val(val);
      }

      // Gửi số lượng khách ban đầu lên server để kích hoạt mở bàn ăn
      function submitInitGuestCount() {
        const count = $('#initGuestInput').val();
        $.ajax({
          url: `/qr-order/${banId}/cap-nhat-so-khach`,
          type: 'POST',
          data: {
            _token: '{{ csrf_token() }}',
            so_luong_khach: count
          },
          success: function(res) {
            if (res.success) {
              $('#guestCountHeader').text(res.so_luong_khach);
              $('#editGuestInput').val(res.so_luong_khach);
              bootstrap.Modal.getInstance(document.getElementById('guestCountInitModal')).hide();
            }
          },
          error: function() {
            alert('Có lỗi xảy ra khi cập nhật số khách.');
          }
        });
      }

      // Mở Modal thay đổi số lượng khách ăn tại bàn
      function openEditGuestCountModal() {
        const myModal = new bootstrap.Modal(document.getElementById('guestCountEditModal'));
        myModal.show();
      }

      // Gửi cập nhật số khách đã thay đổi lên hệ thống
      function submitEditGuestCount() {
        const count = $('#editGuestInput').val();
        $.ajax({
          url: `/qr-order/${banId}/cap-nhat-so-khach`,
          type: 'POST',
          data: {
            _token: '{{ csrf_token() }}',
            so_luong_khach: count
          },
          success: function(res) {
            if (res.success) {
              $('#guestCountHeader').text(res.so_luong_khach);
              bootstrap.Modal.getInstance(document.getElementById('guestCountEditModal')).hide();
            }
          },
          error: function() {
            alert('Có lỗi xảy ra khi cập nhật số khách.');
          }
        });
      }

    <!-- MODAL ĐÁNH GIÁ CHẤT LƯỢNG 5★ & LINH VẬT TƯƠNG TÁC -->
    <div class="modal fade" id="modalRatingFeedback" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-2xl" style="border-radius:24px;">
          <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:24px; border-top-right-radius:24px;">
            <h5 class="modal-title fw-bold text-warning d-flex align-items-center gap-2">
              <i class="bi bi-star-fill text-warning"></i>ĐÁNH GIÁ TRẢI NGHIỆM TẠI BÀN
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <!-- Animated Mascot Reaction Head -->
            <div id="ratingMascot" class="mb-3 transition-transform duration-300" style="width: 100px; height: 100px; margin: 0 auto;">
              <svg viewBox="0 0 200 200" class="w-100 h-100">
                <circle cx="100" cy="100" r="90" fill="#f59e0b"/>
                <path d="M 60 45 C 50 25, 80 10, 100 20 C 120 10, 150 25, 140 45 Z" fill="#ffffff"/>
                <ellipse cx="100" cy="115" rx="22" ry="16" fill="#fef3c7"/>
                <ellipse cx="100" cy="108" rx="8" ry="6" fill="#1e293b"/>
                <circle cx="78" cy="92" r="6" fill="#0f172a"/>
                <circle cx="122" cy="92" r="6" fill="#0f172a"/>
                <path id="mascotRatingMouth" d="M 92 118 Q 100 130 108 118" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>

            <h6 class="fw-bold text-dark mb-1" id="mascotRatingTitle">Vui lòng chấm điểm chất lượng món ăn!</h6>
            <p class="text-secondary small mb-3" id="mascotRatingSub">Ý kiến của bạn giúp M&S Cuisine phục vụ tốt hơn.</p>

            <!-- Star selector -->
            <div class="d-flex justify-content-center gap-2 mb-3 fs-2 text-warning cursor-pointer">
              <i class="bi bi-star-fill star-icon" onclick="setRating(1)"></i>
              <i class="bi bi-star-fill star-icon" onclick="setRating(2)"></i>
              <i class="bi bi-star-fill star-icon" onclick="setRating(3)"></i>
              <i class="bi bi-star-fill star-icon" onclick="setRating(4)"></i>
              <i class="bi bi-star-fill star-icon" onclick="setRating(5)"></i>
            </div>
            <input type="hidden" id="selectedStarRating" value="5">

            <div class="mb-3 text-start">
              <label class="form-label text-xs fw-bold text-muted">Nhận xét chi tiết (không bắt buộc):</label>
              <textarea id="ratingFeedbackText" class="form-control" rows="2" placeholder="Ví dụ: Món ăn đậm đà, phục vụ rất nhanh..."></textarea>
            </div>

            <button type="button" class="btn btn-premium w-100 py-3 font-bold" onclick="submitCustomerFeedback()">
              <i class="bi bi-send-fill me-2"></i>Gửi Đánh Giá Ngay
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bootstrap 5 JavaScript & jQuery -->
    <script>
      let currentStarVal = 5;

      function setRating(stars) {
        currentStarVal = stars;
        document.getElementById('selectedStarRating').value = stars;

        const starIcons = document.querySelectorAll('.star-icon');
        starIcons.forEach((icon, idx) => {
          if (idx < stars) {
            icon.classList.remove('text-secondary', 'opacity-25');
            icon.classList.add('text-warning');
          } else {
            icon.classList.add('text-secondary', 'opacity-25');
            icon.classList.remove('text-warning');
          }
        });

        const mouth = document.getElementById('mascotRatingMouth');
        const title = document.getElementById('mascotRatingTitle');
        const sub = document.getElementById('mascotRatingSub');

        if (stars <= 2) {
          mouth.setAttribute('d', 'M 92 128 Q 100 115 108 128'); // Sad mouth
          title.innerText = 'Rất tiếc vì trải nghiệm chưa hoàn hảo!';
          title.className = 'fw-bold text-danger mb-1';
          sub.innerText = '⚠️ Hệ thống sẽ báo Quản lý trực tiếp đến hỗ trợ bàn bạn ngay!';
        } else if (stars === 3 || stars === 4) {
          mouth.setAttribute('d', 'M 92 120 L 108 120'); // Neutral mouth
          title.innerText = 'Cảm ơn ý kiến đóng góp của bạn!';
          title.className = 'fw-bold text-dark mb-1';
          sub.innerText = 'Chúng tôi sẽ luôn nâng cao chất lượng dịch vụ.';
        } else {
          mouth.setAttribute('d', 'M 92 115 Q 100 132 108 115'); // Happy mouth
          title.innerText = 'Tuyệt vời! Cảm ơn bạn rất nhiều! 🎉';
          title.className = 'fw-bold text-success mb-1';
          sub.innerText = 'Chúc bạn một bữa ăn thật ngon miệng cùng người thân!';
        }
      }

      function submitCustomerFeedback() {
        const text = document.getElementById('ratingFeedbackText').value;

        $.ajax({
          url: '{{ route("api.danh_gia_mon") }}',
          type: 'POST',
          data: {
            _token: '{{ csrf_token() }}',
            ban_id: {{ $ban->id }},
            so_sao: currentStarVal,
            noi_dung_danh_gia: text
          },
          success: function(res) {
            if (res.canh_bao_do) {
              alert('🚨 Hệ thống đã phát CẢNH BÁO ĐỎ khẩn cấp đến Quản lý! Quản lý ca trực sẽ tới bàn số {{ $ban->id }} của bạn ngay lập tức.');
            } else {
              alert('🎉 Cảm ơn quý khách đã đánh giá ' + currentStarVal + ' sao cho M&S Cuisine!');
            }
            bootstrap.Modal.getInstance(document.getElementById('modalRatingFeedback')).hide();
          }
        });
      }

      // Hàm Sao Chép Mã Voucher
      function copyVoucherCode(code) {
        navigator.clipboard.writeText(code).then(() => {
          alert('🎉 Đã sao chép mã voucher: ' + code);
        });
      }

      // Hàm Áp Dụng Trực Tiếp Voucher Ưu Đãi
      function applyVoucherDirect(code, val, percent) {
        alert('⚡ Đã áp dụng mã ưu đãi ' + code + ' (Ưu đãi ' + percent + '%) thành công!');
        const modalEl = document.getElementById('realtimeOfferModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      // Khởi chạy khi tài liệu HTML tải xong hoàn toàn
      $(document).ready(function() {
        pollRealtimeWaitTimes();
        
        // Tự động bật Modal bắt buộc nhập số khách nếu bàn ăn này ghi nhận số khách bằng 0 (bàn trống mới)
        const currentGuests = {{ $ban->so_luong_khach ?: 0 }};
        if (currentGuests === 0) {
          const initModal = new bootstrap.Modal(document.getElementById('guestCountInitModal'));
          initModal.show();
        }

        // Tự động kích hoạt Modal Thông Báo Ưu Đãi Realtime Phủ Giữa Màn Hình
        const isCustomer = {{ auth()->check() || session('show_offer_modal') ? 'true' : 'false' }};
        if (isCustomer || currentGuests > 0) {
          setTimeout(function() {
            const offerModal = new bootstrap.Modal(document.getElementById('realtimeOfferModal'));
            offerModal.show();
          }, 500);
        }
      });

      // Hàm định dạng số hiển thị tiền tệ (ví dụ: 120000 -> 120,000)
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    </script>
  </body>
</html>
