@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-box-seam me-2 text-primary"></i>Quản Lý Nguyên Liệu Nhập Khẩu</h1>
      <p class="text-secondary small mb-0">Quản lý kho hàng, so sánh giá cung ứng quốc tế và kiểm kê nhập kho.</p>
    </div>
  </div>

  <div class="row g-4">
    <!-- LEFT COLUMN: Inventory & Purchase Checklist -->
    <div class="col-12 col-lg-8">
      
      <!-- 1. Active Stock Inventory -->
      <div class="card-premium bg-white mb-4">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-archive text-success"></i>Tồn kho nguyên liệu nhập khẩu</h5>
        </div>
        <div class="table-responsive p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Tên nguyên liệu</th>
                <th class="text-center">Số lượng tồn</th>
                <th>Đơn vị</th>
                <th>Cập nhật cuối</th>
                <th class="pe-4 text-end">Trạng thái kho</th>
              </tr>
            </thead>
            <tbody>
              @foreach ($ingredients as $ing)
                @php
                  $isLow = $ing->so_luong_ton < 10;
                @endphp
                <tr>
                  <td class="ps-4"><strong class="text-dark">{{ $ing->ten }}</strong></td>
                  <td class="text-center font-weight-bold @if($isLow) text-danger @else text-dark @endif">
                    {{ number_format($ing->so_luong_ton, 1) }}
                  </td>
                  <td><span class="text-secondary small">{{ $ing->don_vi }}</span></td>
                  <td><small class="text-secondary">{{ $ing->updated_at->format('H:i d/m/Y') }}</small></td>
                  <td class="pe-4 text-end">
                    @if ($isLow)
                      <span class="badge bg-danger text-white"><i class="bi bi-exclamation-triangle-fill me-1"></i>Tồn thấp - Cần nhập!</span>
                    @else
                      <span class="badge bg-success text-white"><i class="bi bi-check-circle-fill me-1"></i>Đầy đủ</span>
                    @endif
                  </td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Import Goods checklist (Kiểm kê khi nhập hàng) -->
      <div class="card-premium bg-white">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-clipboard-check text-primary"></i>Kiểm kê đối chiếu đơn hàng nhập kho</h5>
        </div>
        <div class="p-3">
          <p class="small text-secondary mb-3"><i class="bi bi-info-circle me-1"></i>Danh sách các đơn đặt hàng nguyên liệu đang trên đường về. Tiến hành đếm thực tế và kiểm kê trước khi nhập kho chính thức.</p>
          
          <div class="table-responsive">
            <table class="table table-bordered align-middle">
              <thead class="table-light">
                <tr>
                  <th>Chi tiết đơn đặt</th>
                  <th class="text-center">Đặt trước</th>
                  <th class="text-center">Thực nhận</th>
                  <th class="text-center">Trạng thái</th>
                  <th class="text-center">Xác nhận kiểm kê</th>
                </tr>
              </thead>
              <tbody>
                @php
                  $pendingImports = $importOrders->where('trang_thai', 'cho_kiem_ke');
                  $completedImports = $importOrders->where('trang_thai', 'da_nhap_kho');
                @endphp
                
                @if ($pendingImports->count() > 0)
                  @foreach ($pendingImports as $order)
                    <tr>
                      <td>
                        <strong class="text-dark">{{ $order->ten_nguyen_lieu }}</strong><br>
                        <small class="text-secondary">Nhà CC: {{ $order->nha_cung_cap }} | Đơn giá: {{ number_format($order->don_gia) }}đ/kg</small>
                      </td>
                      <td class="text-center fw-bold text-primary">{{ $order->so_luong_dat }} kg</td>
                      
                      <!-- Verification Form -->
                      <form action="{{ route('nguyen_lieu.verify', $order->id) }}" method="POST">
                        @csrf
                        <td class="text-center" style="width: 130px;">
                          <input type="number" step="0.1" name="so_luong_nhan" class="form-control text-center fw-bold form-control-sm py-1 border-primary" value="{{ $order->so_luong_dat }}" required>
                        </td>
                        <td class="text-center">
                          <span class="badge bg-warning text-dark">Chờ kiểm kê</span>
                        </td>
                        <td class="text-center">
                          <button type="submit" class="btn btn-sm btn-success px-3 py-1">
                            <i class="bi bi-check-lg me-1"></i>Xác nhận nhập kho
                          </button>
                        </td>
                      </form>
                    </tr>
                  @endforeach
                @else
                  <tr>
                    <td colspan="5" class="text-center py-3 text-muted">Không có đơn đặt hàng nào đang chờ kiểm kê. Hãy so sánh giá và đặt hàng bên cột phải!</td>
                  </tr>
                @endif
              </tbody>
            </table>
          </div>

          <!-- History of stocktakes -->
          @if ($completedImports->count() > 0)
            <div class="mt-4">
              <h6 class="fw-bold text-secondary mb-2 small"><i class="bi bi-journal-text me-2"></i>Lịch sử kiểm kê đã hoàn thành</h6>
              <div class="table-responsive max-height-200 overflow-y-auto">
                <table class="table table-sm table-striped small align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Nguyên liệu</th>
                      <th>Nhà CC</th>
                      <th class="text-center">Đặt</th>
                      <th class="text-center">Nhận</th>
                      <th class="text-center">Chênh lệch</th>
                      <th class="text-end">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    @foreach ($completedImports as $co)
                      @php
                        $diff = $co->so_luong_nhan - $co->so_luong_dat;
                        $diffText = 'Đủ';
                        $diffClass = 'text-success';
                        
                        if ($diff < 0) {
                            $diffText = 'Thiếu ' . abs($diff) . ' kg';
                            $diffClass = 'text-danger fw-bold';
                        } elseif ($diff > 0) {
                            $diffText = 'Dư ' . $diff . ' kg';
                            $diffClass = 'text-primary fw-bold';
                        }
                      @endphp
                      <tr>
                        <td><strong>{{ $co->ten_nguyen_lieu }}</strong></td>
                        <td>{{ $co->nha_cung_cap }}</td>
                        <td class="text-center">{{ $co->so_luong_dat }}</td>
                        <td class="text-center font-weight-bold">{{ $co->so_luong_nhan }}</td>
                        <td class="text-center {{ $diffClass }}">{{ $diffText }}</td>
                        <td class="text-end text-muted">{{ $co->updated_at->format('H:i d/m/Y') }}</td>
                      </tr>
                    @endforeach
                  </tbody>
                </table>
              </div>
            </div>
          @endif
        </div>
      </div>

    </div>

    <!-- RIGHT COLUMN: Price Comparison Tool -->
    <div class="col-12 col-lg-4">
      
      <!-- Cheapest supplier selector widget -->
      <div class="card-premium bg-white">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-search text-warning"></i>So sánh giá nhà cung ứng</h5>
        </div>
        <div class="p-3">
          <p class="small text-secondary mb-3">Nhập tên nguyên liệu nhập khẩu để hệ thống tự động dò tìm và đề xuất nhà cung cấp có mức giá rẻ nhất toàn cầu.</p>
          
          <!-- Search box -->
          <div class="input-group mb-3">
            <input type="text" id="supplierSearchInput" class="form-control border-warning" placeholder="Ví dụ: Thịt bò Úc, Bơ Lạt...">
            <button class="btn btn-premium-gold" type="button" id="btnComparePrice" onclick="triggerPriceComparison()">
              <i class="bi bi-search"></i>
            </button>
          </div>

          <!-- Loader -->
          <div class="text-center py-4 d-none" id="compareLoader">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="small text-secondary mt-2 mb-0">Đang quét hệ thống cung ứng quốc tế...</p>
          </div>

          <!-- Comparison Results Table -->
          <div class="d-none" id="compareResultsCard">
            <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-globe me-2 text-primary"></i>Kết quả tìm kiếm cho: <strong class="text-danger" id="resultQueryText">thịt bò</strong></h6>
            <div class="d-flex flex-column gap-2 mb-3">
              <!-- Dynamically populated via AJAX -->
              <div id="suppliersListContainer"></div>
            </div>

            <!-- Pre-filled Order Form to Cheapes Supplier -->
            <div class="p-3 bg-light rounded" style="border-radius:12px;">
              <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-cart-plus me-2 text-success"></i>Đặt hàng nhanh từ Đơn vị rẻ nhất</h6>
              
              <form action="{{ route('nguyen_lieu.order') }}" method="POST">
                @csrf
                <input type="hidden" name="ten_nguyen_lieu" id="orderFormIngName">
                <input type="hidden" name="nha_cung_cap" id="orderFormSupplierName">
                <input type="hidden" name="don_gia" id="orderFormPrice">

                <div class="mb-2">
                  <span class="small text-secondary d-block">Nguyên liệu nhập khẩu:</span>
                  <strong class="text-dark" id="displayIngName">Thịt bò Úc</strong>
                </div>
                <div class="mb-3">
                  <span class="small text-secondary d-block">Nhà cung cấp đề xuất:</span>
                  <strong class="text-success" id="displaySupplierName">EuroIngredient Group</strong>
                </div>
                
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Số lượng đặt mua (kg / lít)</label>
                  <div class="input-group">
                    <input type="number" name="so_luong_dat" class="form-control border-success fw-bold text-center" value="20" min="1" required>
                    <span class="input-group-text bg-success text-white border-success">kg</span>
                  </div>
                </div>

                <button type="submit" class="btn btn-sm btn-success w-100 py-2 fw-semibold">
                  <i class="bi bi-cart-check me-2"></i>Gửi Đơn Đặt Mua
                </button>
              </form>
            </div>
          </div>

          <!-- Static instructions if no search -->
          <div class="text-center py-5 text-muted" id="emptySearchInstructions">
            <i class="bi bi-globe fs-1 text-primary text-opacity-25 mb-2 d-block"></i>
            <span class="small">Hãy nhập tên nguyên liệu để tìm kiếm giá cung ứng rẻ nhất.</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>
@endsection

@section('scripts')
<script>
  function triggerPriceComparison() {
    const query = $('#supplierSearchInput').val().trim();
    if (!query) {
      alert('Vui lòng nhập tên nguyên liệu cần tìm kiếm!');
      return;
    }

    // Toggle loader
    $('#emptySearchInstructions').addClass('d-none');
    $('#compareResultsCard').addClass('d-none');
    $('#compareLoader').removeClass('d-none');

    // AJAX request
    $.ajax({
      url: '/nguyen-lieu/so-sanh',
      type: 'GET',
      data: { query: query },
      success: function(res) {
        if (res.success) {
          $('#compareLoader').addClass('d-none');
          $('#compareResultsCard').removeClass('d-none');
          $('#resultQueryText').text(res.query);

          // Find cheapest details to fill order form
          const cheapest = res.suppliers.find(s => s.is_cheapest);
          
          // Set inputs on order form
          $('#orderFormIngName').val(res.query);
          $('#orderFormSupplierName').val(cheapest.name);
          $('#orderFormPrice').val(cheapest.price);

          // Set display texts
          $('#displayIngName').text(res.query);
          $('#displaySupplierName').text(cheapest.name + ' (' + numberWithCommas(cheapest.price) + 'đ/kg)');

          // Render supplier listings
          let html = '';
          res.suppliers.forEach(sup => {
            const highlightClass = sup.is_cheapest ? 'border-success bg-success bg-opacity-10' : 'bg-light';
            const badgeHtml = sup.is_cheapest ? '<span class="badge bg-success float-end"><i class="bi bi-check-lg me-1"></i>Rẻ nhất</span>' : '';
            
            html += `
              <div class="p-3 rounded border ${highlightClass} small text-dark">
                ${badgeHtml}
                <strong class="d-block mb-1">${sup.name}</strong>
                <div class="d-flex justify-content-between text-secondary">
                  <span>Giá: <strong class="text-primary">${numberWithCommas(sup.price)}đ</strong></span>
                  <span>Đánh giá: <strong class="text-warning"><i class="bi bi-star-fill"></i> ${sup.rating}</strong></span>
                </div>
                <div class="text-muted small mt-1"><i class="bi bi-truck me-1"></i>Giao trong: ${sup.time}</div>
              </div>
            `;
          });

          $('#suppliersListContainer').html(html);
        }
      },
      error: function(err) {
        alert('Tìm kiếm nhà cung cấp thất bại. Vui lòng thử lại!');
        $('#compareLoader').addClass('d-none');
        $('#emptySearchInstructions').removeClass('d-none');
      }
    });
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
</script>
@endsection
