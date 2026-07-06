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
              
              <img src="https://img.vietqr.io/image/970422-0901234567-compact2.png?amount={{ $totalBill }}&addInfo=Thanh+Toan+MS+Ban+{{ $ban->id }}&accountName=Nha+Hang+MS+Cuisine" alt="VietQR M&S Payment" class="img-fluid rounded mb-3 border shadow-sm" style="max-height: 250px;">
              
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

    <!-- Bootstrap 5 JavaScript & jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      // Active states variables
      const banId = {{ $ban->id }};
      let activeItem = { ten: '', gia: 0, time: 0 };

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

      function openOrderModal(ten, gia, time) {
        activeItem = { ten, gia, time };
        $('#orderModalTitle').text(ten);
        $('#orderModalPrice').text(numberWithCommas(gia) + 'đ');
        $('#orderModalTime').text(time);
        $('#orderQtyInput').val(1);
        $('#orderNoteInput').val('');
        $('#orderPriorityInput').val('1'); // Reset to default Normal priority
        
        const myModal = new bootstrap.Modal(document.getElementById('orderItemModal'));
        myModal.show();
      }

      function changeQty(delta) {
        let val = parseInt($('#orderQtyInput').val()) + delta;
        if (val < 1) val = 1;
        $('#orderQtyInput').val(val);
      }

      function submitOrder() {
        $('#submitOrderBtn').prop('disabled', true).text('Đang gửi...');

        const qty = parseInt($('#orderQtyInput').val());
        const note = $('#orderNoteInput').val();
        const priority = $('#orderPriorityInput').val();

        // AJAX POST to place order
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
              bootstrap.Modal.getInstance(document.getElementById('orderItemModal')).hide();
              alert(res.message);
              $('#submitOrderBtn').prop('disabled', false).text('Gửi xuống bếp');
              
              // Cập nhật động danh sách món ăn đã đặt
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

      function refreshOrderedItemsGrid(onSuccess = null) {
        $.ajax({
          url: `/api/qr-ordered-grid-html/${banId}`,
          type: 'GET',
          success: function(html) {
            $('#orderedItemsContainer').html(html);
            
            // Cập nhật số lượng món trên badge
            const totalItemsCount = $('#orderedItemsContainer .ordered-item-card').length;
            if (totalItemsCount > 0) {
              $('#orderedCountBadge').text(totalItemsCount).removeClass('d-none');
              
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

      // Connect to Echo channels for client side auto-refresh without F5
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
                // Show payment success overlay instantly
                $('#successScreen').css('display', 'flex');
              } else {
                refreshOrderedItemsGrid();
              }
            }
          });
      }

      function openPaymentMethodModal() {
        // Reset modal state
        $('#paymentSelectionArea').removeClass('d-none');
        $('#cashSuccessArea').addClass('d-none');
        $('#qrPaymentArea').addClass('d-none');
        
        const myModal = new bootstrap.Modal(document.getElementById('paymentMethodModal'));
        myModal.show();
      }

      function selectCashPayment() {
        requestPayment('tien_mat');
        
        $('#paymentSelectionArea').addClass('d-none');
        $('#cashSuccessArea').removeClass('d-none');
      }

      function selectQrPayment() {
        requestPayment('qr');
        
        $('#paymentSelectionArea').addClass('d-none');
        $('#qrPaymentArea').removeClass('d-none');
      }

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

      // Interval fallback for wait times
      setInterval(pollRealtimeWaitTimes, 6000);

      function adjustInitGuest(delta) {
        let val = parseInt($('#initGuestInput').val()) + delta;
        if (val < 1) val = 1;
        $('#initGuestInput').val(val);
      }

      function adjustEditGuest(delta) {
        let val = parseInt($('#editGuestInput').val()) + delta;
        if (val < 1) val = 1;
        $('#editGuestInput').val(val);
      }

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

      function openEditGuestCountModal() {
        const myModal = new bootstrap.Modal(document.getElementById('guestCountEditModal'));
        myModal.show();
      }

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

      $(document).ready(function() {
        pollRealtimeWaitTimes();
        
        // Show initial guest count modal if current guest count is 0
        const currentGuests = {{ $ban->so_luong_khach ?: 0 }};
        if (currentGuests === 0) {
          const initModal = new bootstrap.Modal(document.getElementById('guestCountInitModal'));
          initModal.show();
        }
      });

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    </script>
  </body>
</html>
