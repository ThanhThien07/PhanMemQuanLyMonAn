@foreach ($tables as $ban)
  @php
    $cardBorder = 'border-top: 4px solid #198754;'; // Trống
    $statusBadge = '<span class="badge bg-success">Trống</span>';
    if ($ban->trang_thai === 'Co_khach') {
        $cardBorder = 'border-top: 4px solid #0d6efd;';
        $statusBadge = '<span class="badge bg-primary">Có khách</span>';
    } elseif ($ban->trang_thai === 'Da_goi') {
        $cardBorder = 'border-top: 4px solid #dc3545;';
        $statusBadge = '<span class="badge bg-danger animate-pulse">Đã gọi món</span>';
    }
  @endphp
  <div class="col-12 col-sm-6 col-md-4" id="table-card-{{ $ban->id }}">
    <div class="card p-3 shadow-sm h-100" style="{{ $cardBorder }}">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="fw-bold mb-0 text-dark">{{ $ban->ten }}</h6>
        {!! $statusBadge !!}
      </div>
      
      <!-- Payment indicator -->
      <div class="payment-request-area mb-2" id="table-payment-{{ $ban->id }}">
        @if ($ban->yeu_cau_thanh_toan === 'tien_mat')
          <div class="badge bg-danger w-100 p-2 text-center animate-pulse"><i class="bi bi-cash-coin me-1"></i>BÁO THANH TOÁN TIỀN MẶT</div>
        @elseif ($ban->yeu_cau_thanh_toan === 'qr')
          <div class="badge bg-primary w-100 p-2 text-center"><i class="bi bi-qr-code me-1"></i>ĐANG QUÉT MÃ CHUYỂN KHOẢN</div>
        @elseif ($ban->yeu_cau_thanh_toan === 'qr_paid')
          <div class="badge bg-success w-100 p-2 text-center animate-pulse"><i class="bi bi-check-circle-fill me-1"></i>ĐÃ CHUYỂN KHOẢN XONG!</div>
        @endif
      </div>

      <!-- Active dishes list summary -->
      <div class="mb-3" style="max-height: 120px; overflow-y: auto;">
        <div class="table-orders-summary small" id="table-orders-summary-{{ $ban->id }}">
          @if ($ban->activeDatMons->count() > 0)
            @foreach ($ban->activeDatMons as $dm)
              @php
                $color = 'text-warning';
                if ($dm->trang_thai === 'dang_lam') $color = 'text-primary';
                elseif ($dm->trang_thai === 'dang_giao') $color = 'text-info fw-bold animate-pulse';
                elseif ($dm->trang_thai === 'da_giao') $color = 'text-success';
              @endphp
              <div class="d-flex justify-content-between bg-light p-1 rounded mb-1">
                <span class="text-dark">{{ $dm->ten_mon }} <strong class="text-muted">x{{ $dm->so_luong }}</strong></span>
                <span class="{{ $color }}">
                  @if ($dm->trang_thai === 'dang_cho') Chờ bếp
                  @elseif ($dm->trang_thai === 'dang_lam') Đang nấu
                  @elseif ($dm->trang_thai === 'dang_giao') Bếp trả món!
                  @else Đã giao
                  @endif
                </span>
              </div>
            @endforeach
          @else
            <div class="text-center py-2 text-muted bg-light rounded" style="font-size: 11px;">Chưa gọi món</div>
          @endif
        </div>
      </div>

      <!-- Action buttons -->
      <div class="mt-auto d-flex gap-1">
        @if ($ban->yeu_cau_thanh_toan)
          <form action="{{ route('ban.checkout', $ban->id) }}" method="POST" class="w-100">
            @csrf
            <button type="submit" class="btn btn-sm btn-success w-100 py-2 fw-bold"><i class="bi bi-wallet2 me-1"></i>Xác nhận Thu tiền</button>
          </form>
        @else
          <button class="btn btn-sm btn-outline-primary w-50" onclick="openStaffOrderModal({{ $ban->id }}, '{{ $ban->ten }}')"><i class="bi bi-plus-lg"></i> Gọi món</button>
          @if ($ban->activeDatMons->where('trang_thai', 'dang_giao')->count() > 0)
            <button class="btn btn-sm btn-info text-dark w-50 fw-bold animate-pulse" onclick="serveAllDishes({{ $ban->id }})"><i class="bi bi-bell-fill"></i> Giao món</button>
          @else
            <a href="{{ route('dat_mon.qr_order', $ban->id) }}" target="_blank" class="btn btn-sm btn-outline-warning w-50" title="Link gọi món giả lập"><i class="bi bi-qr-code"></i> Quét QR</a>
          @endif
        @endif
      </div>
    </div>
  </div>
@endforeach
