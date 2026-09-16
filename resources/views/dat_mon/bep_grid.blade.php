<!-- BẢNG LƯỚI CHI TIẾT CÁC MÓN ĂN TRÊN KDS ĐẦU BẾP -->
@if ($orders->count() > 0)
  @foreach ($orders as $order)
    @php
      // Kiểm tra xem món ăn này có bị trễ định mức chế biến hay không
      $isLate = $order->is_late_warning;
      // Thiết lập màu sắc và nhãn hiển thị mặc định cho trạng thái "Đang chờ" (dang_cho)
      $cardClass = 'bg-white';
      $headerBg = 'bg-light';
      $statusLabel = 'Đang chờ bếp';
      $statusColor = 'text-warning';
      $btnText = 'Bắt đầu chế biến';
      $btnIcon = 'bi-fire';
      $btnColor = 'btn-warning text-dark';
      $nextStatus = 'dang_lam';
      
      // Chuyển đổi nhãn và nút bấm sang "Đang chế biến" (dang_lam)
      if ($order->trang_thai === 'dang_lam') {
          $headerBg = 'bg-primary bg-opacity-10';
          $statusLabel = 'Đang chế biến';
          $statusColor = 'text-primary';
          $btnText = 'Hoàn thành & Giao món';
          $btnIcon = 'bi-truck';
          $btnColor = 'btn-primary';
          $nextStatus = 'dang_giao';
      } 
      // Chuyển đổi nhãn và nút bấm sang "Đang giao món" (dang_giao)
      elseif ($order->trang_thai === 'dang_giao') {
          $headerBg = 'bg-info bg-opacity-10';
          $statusLabel = 'Đang giao món';
          $statusColor = 'text-info';
          $btnText = 'Xác nhận Khách đã nhận';
          $btnIcon = 'bi-check-circle';
          $btnColor = 'btn-info text-dark';
          $nextStatus = 'da_giao';
      }

      // Nếu đĩa ăn bị trễ, áp dụng class cảnh báo trấp nháy đỏ
      if ($isLate) {
          $cardClass = 'kitchen-late-warning';
      }
    @endphp
    
    <!-- Thẻ KDS cho từng đĩa đặt món ăn -->
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 kds-card" data-status="{{ $order->trang_thai }}" id="kds-item-{{ $order->id }}">
      <div class="card-premium h-100 d-flex flex-column {{ $cardClass }}">
        <!-- Phần đầu thẻ: Vị trí bàn và trạng thái chế biến -->
        <div class="p-3 {{ $headerBg }} border-bottom border-light d-flex justify-content-between align-items-center">
          <span class="badge bg-dark fs-6 py-2 px-3"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ $order->ban->ten }}</span>
          <span class="small {{ $statusColor }} fw-bold"><i class="bi bi-circle-fill me-1" style="font-size: 8px;"></i>{{ $statusLabel }}</span>
        </div>

        <!-- Phần thân thẻ: Tên món ăn, số lượng và các lưu ý đặc biệt -->
        <div class="p-3 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h4 class="fw-bold text-dark mb-0">{{ $order->ten_mon }}</h4>
            <span class="fs-4 fw-bold text-primary">x{{ $order->so_luong }}</span>
          </div>
          
          <!-- Huy hiệu chỉ mức độ ưu tiên nấu trước của đơn hàng -->
          @if ($order->thu_tu_uu_tien > 1)
            <div class="mb-2">
              <span class="badge bg-danger text-white"><i class="bi bi-star-fill me-1"></i>Ưu tiên Cấp {{ $order->thu_tu_uu_tien }}</span>
            </div>
          @endif

          <!-- Ghi chú ẩm thực do khách gửi lên từ điện thoại -->
          @if ($order->ghi_chu)
            <div class="p-2 mb-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded text-dark small">
              <strong class="text-danger"><i class="bi bi-exclamation-circle-fill me-1"></i>Khách ghi chú:</strong><br>
              <span class="fw-medium">{{ $order->ghi_chu }}</span>
            </div>
          @endif

          <!-- Bộ đếm thời gian: Định mức, đã chờ, và ước lượng hoàn tất -->
          <div class="mt-auto">
            <div class="d-flex justify-content-between small text-secondary mb-1">
              <span>Thời gian định mức:</span>
              <strong class="text-dark">{{ $order->thoi_gian_uoc_tinh }} phút</strong>
            </div>
            <div class="d-flex justify-content-between small text-secondary mb-1">
              <span>Thời gian đã chờ:</span>
              <strong class="@if($isLate) text-danger fw-bold animate-pulse @else text-dark @endif">{{ $order->minutes_elapsed }} phút</strong>
            </div>
            <div class="d-flex justify-content-between small text-secondary mb-3">
              <span>Thời gian chờ nấu xong:</span>
              <strong class="text-primary fw-bold" id="wait-time-{{ $order->id }}">Đang tính...</strong>
            </div>
          </div>
        </div>

        <!-- Phần chân thẻ: Nút bấm thay đổi trạng thái tiến độ -->
        <div class="p-3 border-top border-light mt-auto">
          <button class="btn {{ $btnColor }} w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" onclick="advanceStatus({{ $order->id }}, '{{ $nextStatus }}')">
            <i class="bi {{ $btnIcon }} fs-5"></i>
            <span>{{ $btnText }}</span>
          </button>
        </div>
      </div>
    </div>
  @endforeach
@else
  <!-- Giao diện hiển thị khi không còn đĩa ăn nào chờ nấu -->
  <div class="col-12" id="noOrdersPlaceholder">
    <div class="text-center py-5 bg-white rounded shadow-sm text-muted" style="border-radius: 16px;">
      <i class="bi bi-emoji-smile fs-1 text-success mb-3 d-block"></i>
      <h5 class="fw-bold">Tuyệt vời! Nhà bếp đã phục vụ hết tất cả các món ăn.</h5>
      <p class="mb-0 small">Khi khách hàng quét mã QR gọi món tại bàn, đơn hàng sẽ lập tức hiển thị tại đây.</p>
    </div>
  </div>
@endif
