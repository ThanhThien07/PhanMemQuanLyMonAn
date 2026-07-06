@php
  $totalBill = $ban->activeDatMons->sum(function($item) {
      return $item->so_luong * $item->don_gia;
  });
@endphp

<h5 class="fw-bold text-dark mb-3"><i class="bi bi-hourglass-split text-warning me-2"></i>Tiến trình bếp chuẩn bị món</h5>

@if ($ban->activeDatMons->count() > 0)
  @foreach ($ban->activeDatMons as $order)
    @php
      $progressWidth = '20%';
      $progressColor = 'bg-warning';
      $statusLabel = 'Đang chờ (Bếp đã nhận)';
      $isLate = $order->is_late_warning;

      if ($order->trang_thai === 'dang_lam') {
          $progressWidth = '60%';
          $progressColor = 'bg-primary';
          $statusLabel = 'Đang chế biến...';
      } elseif ($order->trang_thai === 'dang_giao') {
          $progressWidth = '85%';
          $progressColor = 'bg-info';
          $statusLabel = 'Đang giao ra bàn';
      } elseif ($order->trang_thai === 'da_giao') {
          $progressWidth = '100%';
          $progressColor = 'bg-success';
          $statusLabel = 'Đã phục vụ';
      }
    @endphp
    
    <div class="ordered-item-card position-relative {{ $isLate ? 'kitchen-late-warning' : '' }}">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="fw-bold text-dark mb-1">{{ $order->ten_mon }} <span class="text-secondary small">x{{ $order->so_luong }}</span></h6>
          
          <!-- Priority badge if set -->
          @if($order->thu_tu_uu_tien > 1)
            <span class="badge bg-danger mb-1 text-white"><i class="bi bi-star-fill me-1"></i>Ưu tiên Cấp {{ $order->thu_tu_uu_tien }}</span>
          @endif

          <p class="text-secondary small mb-1"><i class="bi bi-chat-left-text me-1"></i>Ghi chú: {{ $order->ghi_chu ?: 'Không có' }}</p>
          <p class="text-muted small mb-0"><i class="bi bi-clock me-1"></i>Đã chờ: {{ $order->minutes_elapsed }} phút / Định mức: {{ $order->thoi_gian_uoc_tinh }} phút</p>
          <p class="text-primary small mb-0 fw-bold"><i class="bi bi-hourglass-split me-1"></i>Ước tính nấu xong: <span id="wait-time-{{ $order->id }}">Đang tính...</span></p>
        </div>
        <div class="text-end">
          <span class="badge @if($order->trang_thai === 'dang_cho') bg-warning text-dark @elseif($order->trang_thai === 'dang_lam') bg-primary @elseif($order->trang_thai === 'dang_giao') bg-info text-dark @else bg-success @endif">
            {{ $statusLabel }}
          </span>
          <div class="text-dark fw-bold mt-1" style="font-size: 14px;">{{ number_format($order->so_luong * $order->don_gia) }}đ</div>
        </div>
      </div>

      <!-- Late Warning Alert Overlay -->
      @if ($isLate)
        <div class="mt-2 text-danger small fw-bold text-uppercase animate-pulse">
          <i class="bi bi-exclamation-octagon-fill me-1"></i> Bếp đang bị trễ món ăn! Đang thúc giục...
        </div>
      @endif

      <!-- Progress bar -->
      <div class="progress-bar-ms">
        <div class="progress-bar-ms-fill {{ $progressColor }}" style="width: {{ $progressWidth }}"></div>
      </div>
    </div>
  @endforeach

  <!-- Check-out bill stats -->
  <div class="card border-0 p-3 mt-4 bg-white" style="border-radius:16px;">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="text-secondary font-weight-bold">Tổng thanh toán bàn ăn:</span>
      <h4 class="fw-bold text-primary mb-0" id="totalBillAmount">{{ number_format($totalBill) }}đ</h4>
    </div>
    <p class="small text-muted mb-0"><i class="bi bi-info-circle me-1"></i>Chọn phương thức thanh toán bên dưới để kết thúc bữa ăn của bạn.</p>
  </div>
@else
  <div class="text-center py-5 text-muted bg-white rounded shadow-sm" style="border-radius:16px;">
    <i class="bi bi-egg-fried fs-1 text-warning mb-3 d-block"></i>
    <h6>Bàn của bạn chưa gọi món ăn nào.</h6>
    <button class="btn btn-sm btn-premium mt-2" onclick="switchTab('menu')">Xem thực đơn ngay</button>
  </div>
@endif
