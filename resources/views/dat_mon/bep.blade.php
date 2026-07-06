@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-fire me-2 text-danger"></i>Màn Hình Nhà Bếp M&S (KDS Pro)</h1>
      <p class="text-secondary small mb-0">Hệ thống lập lịch chế biến (Job Scheduling) tối ưu hóa thời gian chờ theo số lượng đầu bếp trực ca.</p>
    </div>
    <div class="d-flex align-items-center gap-2">
      <!-- Nút kích hoạt âm thanh KDS (Web Audio API bắt buộc người dùng tương tác trước khi phát tiếng) -->
      <button id="kitchenAudioBtn" class="btn btn-danger fw-bold" onclick="initKitchenAudio()">
        <i class="bi bi-volume-up-fill me-1"></i> Bật Âm Báo Đơn Mới
      </button>
      <span class="badge bg-success bg-opacity-10 text-success p-2 small"><i class="bi bi-arrow-repeat me-1 animate-spin"></i>Real-time: 4s</span>
      <button class="btn btn-outline-secondary py-2" onclick="location.reload()">
        <i class="bi bi-arrow-clockwise"></i>
      </button>
    </div>
  </div>

  <!-- Bộ lọc KDS và Cấu hình số đầu bếp trực ca -->
  <div class="card-premium p-3 bg-white mb-4">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="d-flex gap-2" id="kdsFilters">
        <button class="btn btn-sm btn-outline-secondary rounded-pill active" onclick="filterKDS('all')">Tất cả ({{ $orders->count() }})</button>
        <button class="btn btn-sm btn-outline-warning rounded-pill" onclick="filterKDS('dang_cho')">Chờ chế biến ({{ $orders->where('trang_thai', 'dang_cho')->count() }})</button>
        <button class="btn btn-sm btn-outline-primary rounded-pill" onclick="filterKDS('dang_lam')">Đang nấu ({{ $orders->where('trang_thai', 'dang_lam')->count() }})</button>
        <button class="btn btn-sm btn-outline-info rounded-pill" onclick="filterKDS('dang_giao')">Đang giao món ({{ $orders->where('trang_thai', 'dang_giao')->count() }})</button>
      </div>

      <!-- Điều khiển số lượng đầu bếp đang làm việc (Cập nhật thời gian chờ ước tính tức thì) -->
      <div class="d-flex align-items-center gap-2 bg-light p-2 rounded-3 border">
        <span class="small fw-bold text-dark"><i class="bi bi-people-fill text-primary me-1"></i>Đầu bếp làm việc:</span>
        <div class="input-group input-group-sm" style="width: 120px;">
          <button class="btn btn-outline-secondary py-0 fw-bold" type="button" onclick="adjustChefs(-1)">-</button>
          <input type="text" id="chefCountInput" class="form-control text-center fw-bold py-0 bg-white" value="3" readonly>
          <button class="btn btn-outline-secondary py-0 fw-bold" type="button" onclick="adjustChefs(1)">+</button>
        </div>
      </div>
      
      <div class="text-secondary small font-weight-bold">
        Tổng món xếp hàng: <strong>{{ $orders->where('trang_thai', '!=', 'da_giao')->count() }}</strong> món
      </div>
    </div>
  </div>

  <!-- Cảnh báo nếu có đơn hàng bị trễ chế biến -->
  @php
    $lateOrders = $orders->filter(function($o) { return $o->is_late_warning; });
  @endphp
  @if ($lateOrders->count() > 0)
    <div class="alert alert-danger border-0 shadow-sm mb-4 d-flex align-items-center p-3" style="border-radius: 12px;" role="alert">
      <i class="bi bi-exclamation-octagon-fill fs-3 text-danger me-3 animate-pulse"></i>
      <div>
        <h5 class="alert-heading fw-bold mb-1">CẢNH BÁO TRỄ CHẾ BIẾN!</h5>
        <p class="mb-0 small">Hiện đang có <strong>{{ $lateOrders->count() }}</strong> món ăn ở trạng thái chờ vượt quá thời gian chế biến định mức. Vui lòng ưu tiên làm trước!</p>
      </div>
    </div>
  @endif

  <!-- Lưới hiển thị các thẻ món ăn của Bếp (Được load động từ bep_grid.blade.php) -->
  <div class="row g-4" id="kdsContainer">
    @include('dat_mon.bep_grid')
  </div>
</div>
@endsection

@section('scripts')
<script>
  // Khởi tạo các biến quản lý âm thanh
  let kitchenAudioCtx = null;
  let kitchenAudioEnabled = false;

  // Lấy cấu hình số lượng đầu bếp từ bộ nhớ trình duyệt LocalStorage (Mặc định là 3)
  let chefCount = parseInt(localStorage.getItem('kitchen_chefs_count') || '3');
  $('#chefCountInput').val(chefCount);

  /**
   * Hàm điều chỉnh số lượng đầu bếp hoạt động và cập nhật lại bộ đếm thời gian
   */
  function adjustChefs(delta) {
    chefCount += delta;
    if (chefCount < 1) chefCount = 1;
    if (chefCount > 15) chefCount = 15; // Giới hạn tối đa 15 đầu bếp
    
    $('#chefCountInput').val(chefCount);
    localStorage.setItem('kitchen_chefs_count', chefCount);
    
    // Yêu cầu làm mới màn hình để tính toán lại thời gian chờ của các món ăn ngay lập tức
    pollRealtimeUpdates();
  }

  function getChefCount() {
    return parseInt(localStorage.getItem('kitchen_chefs_count') || '3');
  }

  /**
   * Khởi tạo bộ sinh âm thanh Web Audio API
   * Giải pháp này tự động tạo tần số nốt nhạc hình sin bằng code JS, không cần tải file .mp3 từ server
   * giúp giao diện siêu nhẹ, load nhanh và không bị trễ tiếng chuông báo.
   */
  function initKitchenAudio() {
    if (!kitchenAudioCtx) {
      // Tạo đối tượng âm thanh trình duyệt
      kitchenAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (kitchenAudioCtx.state === 'suspended') {
      kitchenAudioCtx.resume();
    }
    kitchenAudioEnabled = true;
    localStorage.setItem('kitchen_audio_enabled', 'true');
    // Đổi màu nút chuông báo trên UI để người dùng nhận biết đã sẵn sàng phát nhạc
    $('#kitchenAudioBtn').removeClass('btn-danger').addClass('btn-outline-success').html('<i class="bi bi-volume-up-fill me-1"></i>Âm Báo Đã Bật');
    
    // Phát thử một âm ngắn (Nốt Re5 - 587.33 Hz) để xác nhận
    playKitchenChime(587.33, 0.15); 
  }

  /**
   * Hàm tổng hợp âm chuông từ tần số và thời gian tùy chọn
   */
  function playKitchenChime(freq, duration) {
    if (!kitchenAudioEnabled || !kitchenAudioCtx) return;
    try {
      // Tạo bộ tạo dao động (Oscillator) để phát ra sóng âm hình sin
      const osc = kitchenAudioCtx.createOscillator();
      // Tạo bộ kiểm soát âm lượng (GainNode) để chỉnh tiếng to/nhỏ và giảm âm lượng dần theo thời gian
      const gain = kitchenAudioCtx.createGain();
      
      osc.type = 'sine'; // Loại sóng hình sin mang lại tiếng chuông trong trẻo
      osc.frequency.setValueAtTime(freq, kitchenAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, kitchenAudioCtx.currentTime); // Thiết lập âm lượng ở mức 15%
      
      // Giảm âm lượng dần dần về 0 để tiếng chuông nghe tự nhiên, không bị ngắt đột ngột
      gain.gain.exponentialRampToValueAtTime(0.001, kitchenAudioCtx.currentTime + duration);
      
      // Kết nối: Bộ tạo sóng -> Bộ chỉnh âm lượng -> Cổng phát ra loa của máy tính (destination)
      osc.connect(gain);
      gain.connect(kitchenAudioCtx.destination);
      
      osc.start(); // Bắt đầu phát sóng
      osc.stop(kitchenAudioCtx.currentTime + duration); // Dừng phát sóng sau thời gian quy định
    } catch(e) {}
  }

  /**
   * Phát chuông báo kép khi có món mới đến (Chuông reo 2 nốt: Mi5 rồi đến Đô5)
   */
  function playNewOrderArrivalSound() {
    playKitchenChime(659.25, 0.2); // Nốt Mi5 (659.25 Hz) kêu trong 0.2 giây
    setTimeout(() => {
      playKitchenChime(523.25, 0.35); // Nốt Đô5 (523.25 Hz) kêu trong 0.35 giây sau đó
    }, 180);
  }

  /**
   * Tải lại lưới các thẻ KDS bằng AJAX mà không cần tải lại toàn bộ trang web (Single Page App)
   */
  function refreshKdsGrid(onSuccess = null) {
    const chefs = getChefCount();
    
    $.ajax({
      url: '/api/bep-grid-html',
      type: 'GET',
      success: function(html) {
        // Thay thế toàn bộ mã HTML cũ của lưới KDS bằng mã HTML mới tải về
        $('#kdsContainer').html(html);
        
        // Gửi tiếp AJAX phụ để cập nhật thời gian chờ thực tế tính theo số đầu bếp hiện tại
        $.ajax({
          url: `/api/realtime-updates?chefs=${chefs}`,
          type: 'GET',
          success: function(res) {
            if (res.success) {
              // Cập nhật nhãn thời gian chờ trên từng thẻ món ăn
              res.orders.forEach(o => {
                $(`#wait-time-${o.id}`).text(o.real_wait_time + ' phút nữa');
              });
              
              // Áp dụng lại bộ lọc trạng thái (all, dang_cho, dang_lam,...) đang hoạt động trước đó
              const activeBtn = $('#kdsFilters button.active');
              if (activeBtn.length) {
                const activeFilterFunc = activeBtn.attr('onclick');
                if (activeFilterFunc) {
                  const filterVal = activeFilterFunc.match(/'([^']+)'/)[1];
                  filterKDS(filterVal);
                }
              }
              if (onSuccess) onSuccess();
            }
          }
        });
      }
    });
  }

  /**
   * Vòng lặp lấy thông tin cập nhật (Cơ chế Polling dự phòng)
   * Giúp hệ thống vẫn hoạt động ổn định và có chuông báo ngay cả khi mạng bị chập chờn không kết nối được WebSocket.
   */
  function pollRealtimeUpdates() {
    const chefs = getChefCount();
    
    $.ajax({
      url: `/api/realtime-updates?chefs=${chefs}`,
      type: 'GET',
      success: function(res) {
        if (res.success) {
          const prevWaitingCount = parseInt(localStorage.getItem('prev_waiting_count') || '0');
          let waitingCount = 0;

          // Cập nhật thời gian chờ và đếm số lượng món đang chờ nấu
          res.orders.forEach(o => {
            if (o.trang_thai === 'dang_cho') waitingCount++;
            $(`#wait-time-${o.id}`).text(o.real_wait_time + ' phút nữa');
          });

          // Nếu số lượng món đang chờ tăng lên so với lần kiểm tra trước -> Rung chuông báo bếp
          if (waitingCount > prevWaitingCount && prevWaitingCount > 0) {
            playNewOrderArrivalSound();
          }
          localStorage.setItem('prev_waiting_count', waitingCount);

          // Nếu số lượng thẻ đĩa ăn thay đổi (có món mới thêm vào hoặc bị hủy) -> Tự tải lại lưới HTML
          const currentCardCount = $('.kds-card').length;
          if (res.orders.length !== currentCardCount) {
            refreshKdsGrid();
          }
        }
      }
    });
  }

  /**
   * KẾT NỐI WEBSOCKETS (LARAVEL REVERB):
   * Đăng ký lắng nghe kênh 'orders' để nhận sự kiện 'OrderStatusUpdated' từ Server gửi xuống tức thì.
   */
  if (window.Echo) {
    window.Echo.channel('orders')
      .listen('OrderStatusUpdated', (e) => {
        console.log('Nhận sự kiện thời gian thực qua WebSockets:', e);
        
        // Phát chuông báo nếu đó là đơn món mới được gửi xuống ở trạng thái đang chờ
        const currentIds = $('.kds-card').map(function() { 
          return parseInt($(this).attr('id').replace('kds-item-', '')); 
        }).get();
        
        if (e.trang_thai === 'dang_cho' && !currentIds.includes(e.id)) {
          playNewOrderArrivalSound();
        }
        
        // Tải lại lưới bếp KDS ngay lập tức
        refreshKdsGrid();
      });
  }

  // Chạy vòng lặp Polling dự phòng mỗi 5 giây
  setInterval(pollRealtimeUpdates, 5000);

  $(document).ready(function() {
    // Tự động bật chuông báo nếu lần trước người dùng đã kích hoạt
    if (localStorage.getItem('kitchen_audio_enabled') === 'true') {
      $('#kitchenAudioBtn').trigger('click');
    }
    
    // Gọi tính toán thời gian chờ và tải dữ liệu ngay khi vừa tải xong giao diện
    pollRealtimeUpdates();
  });

  /**
   * Lọc và ẩn/hiển thị các thẻ món ăn trên lưới KDS theo trạng thái được chọn
   */
  function filterKDS(status) {
    // Xóa màu hoạt động của tất cả các nút lọc
    $('#kdsFilters button').removeClass('active btn-secondary btn-warning btn-primary btn-info').addClass('btn-outline-secondary');
    
    if (status === 'all') {
      $(`#kdsFilters button:nth-child(1)`).addClass('active btn-secondary').removeClass('btn-outline-secondary');
      $('.kds-card').fadeIn(200);
    } else if (status === 'dang_cho') {
      $(`#kdsFilters button:nth-child(2)`).addClass('active btn-warning text-dark').removeClass('btn-outline-secondary');
      $('.kds-card').hide();
      $('.kds-card[data-status="dang_cho"]').fadeIn(200);
    } else if (status === 'dang_lam') {
      $(`#kdsFilters button:nth-child(3)`).addClass('active btn-primary').removeClass('btn-outline-secondary');
      $('.kds-card').hide();
      $('.kds-card[data-status="dang_lam"]').fadeIn(200);
    } else if (status === 'dang_giao') {
      $(`#kdsFilters button:nth-child(4)`).addClass('active btn-info text-dark').removeClass('btn-outline-secondary');
      $('.kds-card').hide();
      $('.kds-card[data-status="dang_giao"]').fadeIn(200);
    }
  }

  /**
   * Chuyển trạng thái chế biến của món ăn lên cấp tiếp theo (ví dụ: Chờ chế biến -> Bắt đầu nấu)
   */
  function advanceStatus(orderId, nextStatus) {
    const currentWaitingCount = $('.kds-card[data-status="dang_cho"]').length;
    localStorage.setItem('prev_waiting_count', currentWaitingCount);

    $.ajax({
      url: `/dat-mon/doi-trang-thai/${orderId}`,
      type: 'POST',
      data: {
        _token: '{{ csrf_token() }}', // Token CSRF bảo mật bắt buộc của Laravel
        status: nextStatus
      },
      success: function(res) {
        if (res.success) {
          // Làm mới lại lưới KDS mượt mà, không cần tải lại trang
          refreshKdsGrid();
        }
      },
      error: function(err) {
        alert(err.responseJSON ? err.responseJSON.message : 'Không thể cập nhật trạng thái chế biến!');
      }
    });
  }
</script>
@endsection
