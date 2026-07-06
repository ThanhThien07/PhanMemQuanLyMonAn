@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-people me-2 text-primary"></i>Hệ Thống Phục Vụ & Nhân Viên</h1>
      <p class="text-secondary small mb-0">Tiếp nhận thông báo gọi món, phục vụ đồ ăn và thu ngân nhanh.</p>
    </div>
    <div class="d-flex align-items-center gap-2">
      <!-- Enable Audio Button for Browser Restrictions -->
      <button id="enableAudioBtn" class="btn btn-warning fw-bold text-dark" onclick="initAudio()">
        <i class="bi bi-volume-up-fill me-2 animate-bounce"></i>Kích hoạt Âm Thanh Chuông Báo
      </button>
      <span class="badge bg-success bg-opacity-10 text-success p-2 small"><i class="bi bi-arrow-repeat me-1 animate-spin"></i>Đang theo dõi realtime</span>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column: Notification Feeds (Sound triggers) -->
    <div class="col-12 col-lg-4">
      <div class="card-premium bg-white h-100 d-flex flex-column" style="min-height: 450px;">
        <div class="card-premium-header bg-dark text-white">
          <h5 class="card-premium-title text-white"><i class="bi bi-bell-fill text-warning"></i>Nhật Ký Gọi Món & Yêu Cầu</h5>
          <span class="badge bg-warning text-dark" id="notificationCount">0 tin</span>
        </div>
        <div class="p-3 grow overflow-y-auto" style="max-height: 550px;" id="notificationLog">
          <div class="text-center py-5 text-muted" id="noNotificationsPlaceholder">
            <i class="bi bi-bell fs-1 d-block mb-2 text-secondary opacity-50"></i>
            Chưa có thông báo mới nào được ghi nhận.
          </div>
          <!-- Notifications will slide-in here -->
        </div>
      </div>
    </div>

    <!-- Right Column: Interactive Tables & Order Input -->
    <div class="col-12 col-lg-8">
      <!-- Grid of Tables -->
      <div class="card-premium bg-white p-4 mb-4">
        <h5 class="fw-bold text-dark mb-3"><i class="bi bi-grid-3x3-gap text-primary me-2"></i>Thao Tác Nhanh Theo Bàn</h5>
        <div class="row g-3" id="tablesGrid">
          @include('dat_mon.nhan_vien_grid')
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Nhân Viên Đặt Món Hộ Khách -->
<div class="modal fade" id="staffOrderModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:16px;">
      <div class="modal-header bg-primary text-white border-0 py-3" style="border-top-left-radius:16px; border-top-right-radius:16px;">
        <h5 class="modal-title fw-bold"><i class="bi bi-plus-circle me-2"></i>Nhân Viên Đặt Món: <span id="modalTableLabel"></span></h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-4">
        <form id="staffOrderForm">
          <input type="hidden" id="staffOrderTableId" value="">
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark">Chọn Món Ăn / Đồ Uống</label>
            <select class="form-select py-2" id="staffOrderDishSelect" onchange="updateStaffOrderPrice()">
              @foreach ($menuItems as $item)
                <option value="{{ $item['ten'] }}" data-price="{{ $item['gia'] }}" data-time="{{ $item['time'] }}">
                  {{ $item['ten'] }} ({{ number_format($item['gia']) }}đ)
                </option>
              @endforeach
            </select>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label fw-semibold text-dark">Số lượng</label>
              <input type="number" id="staffOrderQty" class="form-control py-2 text-center" value="1" min="1" required>
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold text-dark">Đơn giá</label>
              <input type="text" id="staffOrderPriceDisplay" class="form-control py-2 text-center bg-light text-dark fw-bold" readonly value="0đ">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark">Ghi chú yêu cầu món</label>
            <input type="text" id="staffOrderNotes" class="form-control py-2" placeholder="Ví dụ: Ít cay, không hành tây...">
          </div>
        </form>
      </div>
      <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:16px; border-bottom-right-radius:16px;">
        <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Hủy</button>
        <button type="button" class="btn btn-premium py-2" onclick="submitStaffOrder()">Xác nhận Gọi Món</button>
      </div>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script>
  let audioContext = null;
  let audioEnabled = false;

  // Initialize Web Audio API
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    audioEnabled = true;
    $('#enableAudioBtn').removeClass('btn-warning').addClass('btn-outline-success').html('<i class="bi bi-volume-up-fill me-2"></i>Âm Thanh Đã Bật');
    
    // Play a quick test sound to confirm initialization
    playSynthBeep(523.25, 0.1, 'sine'); // C5
  }

  // Synthesize sound beep using Web Audio API Oscillators
  function playSynthBeep(frequency, duration, type = 'sine') {
    if (!audioEnabled || !audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch(e) {
      console.error("Audio error", e);
    }
  }

  // Chime sounds
  function playNewOrderChime() {
    // Elegant rapid double high chimes
    playSynthBeep(659.25, 0.15, 'sine'); // E5
    setTimeout(() => {
      playSynthBeep(880.00, 0.25, 'sine'); // A5
    }, 120);
  }

  function playPaymentAlertChime() {
    // Alarming repeating lower buzzer chime
    playSynthBeep(261.63, 0.2, 'sawtooth'); // C4
    setTimeout(() => {
      playSynthBeep(261.63, 0.3, 'sawtooth'); // C4
    }, 250);
  }

  function playDishFinishedChime() {
    // Sweet notification tone
    playSynthBeep(587.33, 0.15, 'triangle'); // D5
    setTimeout(() => {
      playSynthBeep(698.46, 0.2, 'sine'); // F5
    }, 100);
  }

  // Keep track of processed IDs to avoid repeating alarms
  let processedOrderIds = new Set();
  let processedPaymentTables = {};
  let processedFinishedDishIds = new Set();

  // Dynamic refresh of Tables Grid
  function refreshTablesGrid(onSuccess = null) {
    $.ajax({
      url: '/api/nhan-vien-grid-html',
      type: 'GET',
      success: function(html) {
        $('#tablesGrid').html(html);
        if (onSuccess) onSuccess();
      }
    });
  }

  // Polling updates fallback
  function fetchUpdates() {
    $.ajax({
      url: "{{ route('api.realtime_updates') }}",
      type: 'GET',
      dataType: 'json',
      success: function(res) {
        if (!res.success) return;
        
        // 1. Process Order Requests
        res.orders.forEach(order => {
          if (order.trang_thai === 'dang_cho') {
            if (!processedOrderIds.has(order.id)) {
              processedOrderIds.add(order.id);
              playNewOrderChime();
              addNotificationLog('order', `<strong>${order.ban_ten}</strong> vừa đặt món <strong>${order.ten_mon} (x${order.so_luong})</strong>`);
            }
          }
        });

        // 2. Process Finished Dishes (Need Serving!)
        res.orders.forEach(order => {
          if (order.trang_thai === 'dang_giao') {
            if (!processedFinishedDishIds.has(order.id)) {
              processedFinishedDishIds.add(order.id);
              playDishFinishedChime();
              addNotificationLog('dish-ready', `<strong>BẾP TRẢ MÓN:</strong> ${order.ten_mon} (x${order.so_luong}) cho <strong>${order.ban_ten}</strong> đã nấu xong. Giao gấp!`);
            }
          }
        });

        // 3. Process Checkout Payment Alerts
        res.payment_requests.forEach(req => {
          const tableId = req.id;
          const currentType = req.yeu_cau_thanh_toan;
          
          if (processedPaymentTables[tableId] !== currentType) {
            processedPaymentTables[tableId] = currentType;
            playPaymentAlertChime();
            
            let payMsg = '';
            if (currentType === 'tien_mat') {
              payMsg = `<strong>${req.ten}</strong> yêu cầu thanh toán bằng <strong>tiền mặt</strong> (${numberWithCommas(req.tong_tien)}đ)!`;
            } else if (currentType === 'qr') {
              payMsg = `<strong>${req.ten}</strong> đang quét mã chuyển khoản QR (${numberWithCommas(req.tong_tien)}đ).`;
            } else if (currentType === 'qr_paid') {
              payMsg = `<strong>${req.ten}</strong> ĐÃ CHUYỂN KHOẢN THÀNH CÔNG (${numberWithCommas(req.tong_tien)}đ). Hãy xác nhận!`;
            }
            addNotificationLog('payment', payMsg);
          }
        });

        // Sync table cards HTML if anything changed
        refreshTablesGrid();
      },
      error: function(err) {
        console.error("Realtime updates polling error", err);
      }
    });
  }

  // Connect to Echo channels for instant websocket events
  if (window.Echo) {
    window.Echo.channel('orders')
      .listen('OrderStatusUpdated', (e) => {
        console.log('Echo OrderStatusUpdated event:', e);
        
        if (e.trang_thai === 'dang_cho') {
          if (!processedOrderIds.has(e.id)) {
            processedOrderIds.add(e.id);
            playNewOrderChime();
            addNotificationLog('order', `<strong>${e.ban_ten}</strong> vừa đặt món <strong>${e.ten_mon} (x${e.so_luong})</strong>`);
          }
        } else if (e.trang_thai === 'dang_giao') {
          if (!processedFinishedDishIds.has(e.id)) {
            processedFinishedDishIds.add(e.id);
            playDishFinishedChime();
            addNotificationLog('dish-ready', `<strong>BẾP TRẢ MÓN:</strong> ${e.ten_mon} (x${e.so_luong}) cho <strong>${e.ban_ten}</strong> đã nấu xong. Giao gấp!`);
          }
        }
        
        refreshTablesGrid();
      });

    window.Echo.channel('tables')
      .listen('TableStateUpdated', (e) => {
        console.log('Echo TableStateUpdated event:', e);
        
        if (['request_checkout', 'confirm_qr_paid'].includes(e.action) || e.yeu_cau_thanh_toan) {
          const tableId = e.id;
          const currentType = e.yeu_cau_thanh_toan;
          
          if (processedPaymentTables[tableId] !== currentType && currentType) {
            processedPaymentTables[tableId] = currentType;
            playPaymentAlertChime();
            
            let payMsg = '';
            if (currentType === 'tien_mat') {
              payMsg = `<strong>${e.ten}</strong> yêu cầu thanh toán bằng <strong>tiền mặt</strong> (${numberWithCommas(e.tong_tien)}đ)!`;
            } else if (currentType === 'qr') {
              payMsg = `<strong>${e.ten}</strong> đang quét mã chuyển khoản QR (${numberWithCommas(e.tong_tien)}đ).`;
            } else if (currentType === 'qr_paid') {
              payMsg = `<strong>${e.ten}</strong> ĐÃ CHUYỂN KHOẢN THÀNH CÔNG (${numberWithCommas(e.tong_tien)}đ). Hãy xác nhận!`;
            }
            addNotificationLog('payment', payMsg);
          }
        }
        
        refreshTablesGrid();
      });
  }

  // Add a nice card in notification logs
  function addNotificationLog(type, htmlContent) {
    $('#noNotificationsPlaceholder').remove();

    let icon = 'bi-bell-fill';
    let bgClass = 'bg-light border-start border-4 border-secondary';
    
    if (type === 'order') {
      icon = 'bi-cart-plus-fill text-warning';
      bgClass = 'bg-warning bg-opacity-10 border-start border-4 border-warning';
    } else if (type === 'payment') {
      icon = 'bi-cash-coin text-danger';
      bgClass = 'bg-danger bg-opacity-10 border-start border-4 border-danger';
    } else if (type === 'dish-ready') {
      icon = 'bi-fire text-info animate-pulse';
      bgClass = 'bg-info bg-opacity-10 border-start border-4 border-info';
    }

    const timeString = new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', second:'2-digit'});

    const alertHtml = `
      <div class="card border-0 mb-3 shadow-sm ${bgClass} animate-slide-in" style="border-radius: 8px;">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small text-muted"><i class="bi ${icon} me-1"></i>${timeString}</span>
            <button type="button" class="btn-close" style="font-size: 8px;" onclick="$(this).closest('.card').fadeOut(300, function(){ $(this).remove(); updateNotifCount(); })"></button>
          </div>
          <p class="mb-0 text-dark small">${htmlContent}</p>
        </div>
      </div>
    `;

    $('#notificationLog').prepend(alertHtml);
    updateNotifCount();
  }

  function updateNotifCount() {
    const count = $('#notificationLog .card').length;
    $('#notificationCount').text(count + ' tin');
  }

  // Automatically check updates every 6 seconds as fallback
  setInterval(fetchUpdates, 6000);

  // Staff Place Order Modal handlers
  function openStaffOrderModal(tableId, tableName) {
    $('#staffOrderTableId').val(tableId);
    $('#modalTableLabel').text(tableName);
    updateStaffOrderPrice();
    const myModal = new bootstrap.Modal(document.getElementById('staffOrderModal'));
    myModal.show();
  }

  function updateStaffOrderPrice() {
    const select = document.getElementById('staffOrderDishSelect');
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    $('#staffOrderPriceDisplay').val(numberWithCommas(price) + 'đ');
  }

  function submitStaffOrder() {
    const tableId = $('#staffOrderTableId').val();
    const select = document.getElementById('staffOrderDishSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    const tenMon = selectedOption.value;
    const donGia = selectedOption.getAttribute('data-price');
    const timeEst = selectedOption.getAttribute('data-time');
    const qty = $('#staffOrderQty').val();
    const notes = $('#staffOrderNotes').val();

    $.ajax({
      url: `/qr-order/${tableId}/order`,
      type: 'POST',
      data: {
        _token: '{{ csrf_token() }}',
        ten_mon: tenMon,
        don_gia: donGia,
        thoi_gian_uoc_tinh: timeEst,
        so_luong: qty,
        ghi_chu: notes
      },
      success: function(res) {
        if (res.success) {
          bootstrap.Modal.getInstance(document.getElementById('staffOrderModal')).hide();
          $('#staffOrderQty').val(1);
          $('#staffOrderNotes').val('');
          alert('Nhân viên gọi món hộ thành công!');
          refreshTablesGrid();
        }
      },
      error: function(err) {
        alert('Lỗi đặt món hộ khách!');
      }
    });
  }

  // Serve all ready-made kitchen items at once
  function serveAllDishes(tableId) {
    $.ajax({
      url: "{{ route('api.realtime_updates') }}",
      type: 'GET',
      success: function(res) {
        const readyDishIds = res.orders
          .filter(o => o.ban_id == tableId && o.trang_thai === 'dang_giao')
          .map(o => o.id);

        if (readyDishIds.length === 0) return;

        let completedCount = 0;
        readyDishIds.forEach(id => {
          $.ajax({
            url: `/dat-mon/doi-trang-thai/${id}`,
            type: 'POST',
            data: { _token: '{{ csrf_token() }}', status: 'da_giao' },
            success: function() {
              completedCount++;
              if (completedCount === readyDishIds.length) {
                alert('Đã xác nhận giao toàn bộ món ăn thành công!');
                refreshTablesGrid();
              }
            }
          });
        });
      }
    });
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
</script>

<style>
  @keyframes slideIn {
    0% {
      transform: translateX(-50px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slideIn 0.3s ease forwards;
  }
</style>
@endsection
