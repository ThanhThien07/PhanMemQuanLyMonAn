@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-shop me-2 text-primary"></i>Sơ Đồ Bàn Ăn M&S</h1>
      <p class="text-secondary small mb-0">Quản lý sơ đồ bàn trực quan, tự động tạo mã QR đặt món và hỗ trợ tách hóa đơn linh hoạt.</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-primary" onclick="printAllQrCodes()">
        <i class="bi bi-printer me-1"></i> In tất cả QR
      </button>
      <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#addTableModal">
        <i class="bi bi-plus-circle me-1"></i> Thêm bàn mới
      </button>
    </div>
  </div>

  <!-- Dashboard Stats Row -->
  <div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
      <div class="card-premium p-3 bg-white d-flex align-items-center">
        <div class="rounded-circle p-3 bg-primary bg-opacity-10 text-primary me-3">
          <i class="bi bi-border-all fs-4"></i>
        </div>
        <div>
          <h6 class="text-secondary small mb-1">Tổng số bàn</h6>
          <h4 class="fw-bold mb-0 text-dark">{{ $totalTables }}</h4>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card-premium p-3 bg-white d-flex align-items-center">
        <div class="rounded-circle p-3 bg-success bg-opacity-10 text-success me-3">
          <i class="bi bi-door-open fs-4"></i>
        </div>
        <div>
          <h6 class="text-secondary small mb-1">Bàn trống</h6>
          <h4 class="fw-bold mb-0 text-success">{{ $freeTables }}</h4>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card-premium p-3 bg-white d-flex align-items-center">
        <div class="rounded-circle p-3 bg-danger bg-opacity-10 text-danger me-3">
          <i class="bi bi-cart-check fs-4"></i>
        </div>
        <div>
          <h6 class="text-secondary small mb-1">Đang gọi món</h6>
          <h4 class="fw-bold mb-0 text-danger">{{ $orderedTables }}</h4>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card-premium p-3 bg-white d-flex align-items-center">
        <div class="rounded-circle p-3 bg-warning bg-opacity-10 text-warning me-3">
          <i class="bi bi-currency-dollar fs-4"></i>
        </div>
        <div>
          <h6 class="text-secondary small mb-1">Doanh thu hôm nay</h6>
          <h4 class="fw-bold mb-0 text-warning">{{ number_format($totalRevenue) }}đ</h4>
        </div>
      </div>
    </div>
  </div>

  <!-- Realtime Cashier Alerts Banner -->
  @php
    $alertTables = $tables->whereNotNull('yeu_cau_thanh_toan');
  @endphp
  @if ($alertTables->count() > 0)
    <div class="mb-4">
      <div class="card border-0 shadow-sm bg-warning bg-opacity-10 p-3" style="border-radius:16px;">
        <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bell-fill text-warning me-2 animate-bounce"></i>YÊU CẦU THANH TOÁN TỪ BÀN</h5>
        <div class="row g-2">
          @foreach ($alertTables as $t)
            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center justify-content-between p-2 bg-white rounded shadow-sm border-start border-4 @if($t->yeu_cau_thanh_toan === 'tien_mat') border-danger @elseif($t->yeu_cau_thanh_toan === 'qr') border-primary @else border-success @endif">
                <div>
                  <strong class="text-dark">{{ $t->ten }}</strong>
                  <span class="ms-2 small">
                    @if ($t->yeu_cau_thanh_toan === 'tien_mat')
                      <span class="badge bg-danger">Yêu cầu thanh toán tiền mặt</span>
                    @elseif ($t->yeu_cau_thanh_toan === 'qr')
                      <span class="badge bg-primary">Khách đang quét mã QR chuyển khoản</span>
                    @else
                      <span class="badge bg-success">ĐÃ CHUYỂN KHOẢN THÀNH CÔNG!</span>
                    @endif
                  </span>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary py-1" onclick="viewTableDetails({{ $t->id }})">Xem & Thanh toán</button>
                </div>
              </div>
            </div>
          @endforeach
        </div>
      </div>
    </div>
  @endif

  <!-- Grid of Tables -->
  <div class="row g-4">
    @foreach ($tables as $ban)
      @php
        $cardBg = 'bg-white';
        $borderCol = 'border-top: 4px solid #198754;'; // Trống -> green
        $statusText = 'Bàn trống';
        $statusColor = 'text-success';
        
        if ($ban->trang_thai === 'Co_khach') {
            $borderCol = 'border-top: 4px solid #0d6efd;'; // Có khách -> blue
            $statusText = 'Có khách';
            $statusColor = 'text-primary';
        } elseif ($ban->trang_thai === 'Da_goi') {
            $borderCol = 'border-top: 4px solid #dc3545;'; // Đã gọi món -> red
            $statusText = 'Đang gọi món';
            $statusColor = 'text-danger';
        }

        // Flashing alert overlay if there is a payment request
        $alertClass = '';
        if ($ban->yeu_cau_thanh_toan === 'tien_mat') {
            $alertClass = 'kitchen-late-warning';
        } elseif ($ban->yeu_cau_thanh_toan === 'qr_paid') {
            $alertClass = 'border border-success bg-success bg-opacity-10';
        }
      @endphp
      
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card-premium h-100 p-3 {{ $cardBg }} {{ $alertClass }}" style="{{ $borderCol }}">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="fw-bold text-dark mb-0">{{ $ban->ten }}</h5>
              <span class="small {{ $statusColor }} fw-semibold"><i class="bi bi-circle-fill me-1 small"></i>{{ $statusText }}</span>
            </div>
            
            <div class="d-flex gap-1">
              <!-- Print QR Button -->
              <button class="btn btn-sm btn-outline-secondary border-0 p-1" onclick="printQrCode({{ $ban->id }}, '{{ $ban->ten }}', '{{ route('dat_mon.qr_order', $ban->id) }}')" title="In mã QR bàn này">
                <i class="bi bi-printer text-primary fs-5"></i>
              </button>
              <!-- Link to QR menu -->
              <a href="{{ route('dat_mon.qr_order', $ban->id) }}" target="_blank" class="btn btn-sm btn-outline-dark border-0 p-1" title="Xem menu QR của bàn">
                <i class="bi bi-qr-code-scan fs-5 text-warning"></i>
              </a>
            </div>
          </div>

          <!-- Checkout status overlays -->
          @if ($ban->yeu_cau_thanh_toan === 'tien_mat')
            <div class="p-2 mb-2 rounded bg-danger bg-opacity-25 text-danger small fw-bold text-center animate-pulse">
              <i class="bi bi-cash-coin me-1"></i>YÊU CẦU TIỀN MẶT
            </div>
          @elseif ($ban->yeu_cau_thanh_toan === 'qr')
            <div class="p-2 mb-2 rounded bg-primary bg-opacity-25 text-primary small fw-bold text-center">
              <i class="bi bi-qr-code me-1"></i>KHÁCH ĐANG CK...
            </div>
          @elseif ($ban->yeu_cau_thanh_toan === 'qr_paid')
            <div class="p-2 mb-2 rounded bg-success bg-opacity-25 text-success small fw-bold text-center animate-pulse">
              <i class="bi bi-check-circle-fill me-1"></i>ĐÃ CHUYỂN KHOẢN!
            </div>
          @endif

          <div class="mb-3">
            @if ($ban->activeDatMons->count() > 0)
              <p class="text-secondary small mb-1">Món ăn đang phục vụ ({{ $ban->activeDatMons->count() }}):</p>
              <div class="d-flex flex-column gap-1 max-height-100 overflow-y-auto">
                @foreach ($ban->activeDatMons as $dm)
                  <div class="d-flex justify-content-between text-dark small bg-light p-1 rounded">
                    <span>{{ $dm->ten_mon }} <span class="text-muted">x{{ $dm->so_luong }}</span></span>
                    <span class="small font-weight-bold">
                      @if ($dm->trang_thai === 'dang_cho')
                        <span class="text-warning">Chờ bếp</span>
                      @elseif ($dm->trang_thai === 'dang_lam')
                        <span class="text-primary">Đang nấu</span>
                      @elseif ($dm->trang_thai === 'dang_giao')
                        <span class="text-info">Đang giao</span>
                      @else
                        <span class="text-success">Đã giao</span>
                      @endif
                    </span>
                  </div>
                @endforeach
              </div>
            @else
              <p class="text-muted small mb-0 mt-3 text-center py-2 bg-light rounded"><i class="bi bi-egg-fried me-1"></i>Bàn trống chưa gọi món</p>
            @endif
          </div>

          <div class="mt-auto pt-3 border-top border-light d-flex gap-2">
            @if ($ban->activeDatMons->count() > 0)
              <button class="btn btn-sm btn-premium w-100 py-2" onclick="viewTableDetails({{ $ban->id }})">
                <i class="bi bi-wallet2 me-1"></i>Thành tiền: {{ number_format($ban->activeDatMons->sum(function($o){ return $o->so_luong * $o->don_gia; })) }}đ
              </button>
            @else
              <a href="{{ route('dat_mon.qr_order', $ban->id) }}" target="_blank" class="btn btn-sm btn-outline-primary w-100 py-2">
                <i class="bi bi-plus-lg me-1"></i>Gọi món nhanh
              </a>
            @endif
          </div>
        </div>
      </div>
    @endforeach
  </div>
</div>

<!-- Modal: Thêm Bàn Mới -->
<div class="modal fade" id="addTableModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:16px;">
      <div class="modal-header bg-primary text-white border-0 py-3" style="border-top-left-radius:16px; border-top-right-radius:16px;">
        <h5 class="modal-title fw-bold"><i class="bi bi-plus-circle me-2"></i>Thêm Bàn Ăn Mới</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="{{ route('ban.store') }}" method="POST">
        @csrf
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark">Tên bàn ăn</label>
            <input type="text" name="ten" class="form-control py-2" placeholder="Ví dụ: Bàn 11" required>
            <span class="text-muted small">Tên bàn ăn không được trùng với các bàn đã có.</span>
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:16px; border-bottom-right-radius:16px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Hủy</button>
          <button type="submit" class="btn btn-premium py-2">Tạo bàn</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Chi Tiết Đơn Hàng & Hóa Đơn Thanh Toán (Có Tách Bill) -->
<div class="modal fade" id="tableDetailsModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-xl">
    <div class="modal-content border-0 shadow-lg" style="border-radius:16px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:16px; border-top-right-radius:16px;">
        <h5 class="modal-title fw-bold" id="modalTableTitle">HÓA ĐƠN CHI TIẾT BÀN</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      
      <!-- VIEW 1: THANH TOÁN TOÀN BỘ (STANDARD CHECKOUT) -->
      <div id="standardCheckoutDiv">
        <form id="checkoutForm" action="" method="POST">
          @csrf
          <div class="modal-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-primary mb-0"><i class="bi bi-receipt-cutoff me-2"></i>Danh sách món ăn trên bàn</h6>
              <button type="button" class="btn btn-sm btn-outline-warning fw-semibold px-3" onclick="switchToSplitMode()">
                <i class="bi bi-scissors me-1"></i> Tách hóa đơn (Split Bill)
              </button>
            </div>
            
            <div class="table-responsive mb-4">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Tên món ăn</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-end">Đơn giá</th>
                    <th class="text-end">Thành tiền</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái bếp</th>
                  </tr>
                </thead>
                <tbody id="billItemsBody">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>

            <!-- CRM Customer Point Accumulation Section -->
            <div class="card border-primary border-opacity-25 bg-primary bg-opacity-10 p-3 mb-4" style="border-radius:12px;">
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-person-heart me-2"></i>CRM Khách hàng & Tích lũy điểm thành viên</h6>
              <div class="row g-2 align-items-center">
                <div class="col-md-5">
                  <label class="small text-secondary fw-semibold">Chọn thành viên đã có:</label>
                  <select class="form-select form-select-sm border-0" id="crmSelect" onchange="fillCrmCustomer(this, 'standard')">
                    <option value="">-- Khách hàng vãng lai --</option>
                    @foreach ($crmCustomers as $customer)
                      <option value="{{ $customer->sdt }}" data-ten="{{ $customer->ten }}">{{ $customer->ten }} ({{ $customer->sdt }}) - {{ $customer->diem_tich_luy }} điểm</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="small text-secondary fw-semibold">Số điện thoại (tích điểm):</label>
                  <input type="text" name="sdt" id="checkoutSdt" class="form-control form-control-sm border-0 py-1.5" placeholder="Nhập SĐT để tích điểm...">
                </div>
                <div class="col-md-3">
                  <label class="small text-secondary fw-semibold">Họ tên khách mới:</label>
                  <input type="text" name="khach_hang_ten" id="checkoutKhName" class="form-control form-control-sm border-0 py-1.5" placeholder="Tên khách mới...">
                </div>
              </div>
            </div>

            <!-- ROI & Saving Analysis details -->
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <div class="card border-0 bg-light p-3" style="border-radius:12px;">
                  <h6 class="fw-bold text-dark mb-2"><i class="bi bi-calculator me-2 text-warning"></i>Phân tích Lợi nhuận (ROI)</h6>
                  <div class="d-flex justify-content-between small text-dark mb-1">
                    <span>Tổng giá trị bán:</span>
                    <strong id="billSubtotal">0đ</strong>
                  </div>
                  <div class="d-flex justify-content-between small text-dark mb-1">
                    <span>Giá vốn (Giả định Recipe 60%):</span>
                    <span id="billRecipeCost">0đ</span>
                  </div>
                  <div class="d-flex justify-content-between small text-dark pt-1 border-top border-secondary border-opacity-10">
                    <strong>Lợi nhuận gộp ước tính:</strong>
                    <strong class="text-success" id="billProfit">0đ</strong>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card border-0 bg-success bg-opacity-10 p-3" style="border-radius:12px;">
                  <h6 class="fw-bold text-success mb-2"><i class="bi bi-shield-check me-2"></i>Tiết kiệm từ kiểm soát Recipe</h6>
                  <p class="small text-secondary mb-2">Nhờ cơ chế tự động trừ kho và giám sát recipe thông minh của <strong>M&S</strong>, quán tiết kiệm trung bình <strong>15%</strong> lượng thất thoát nguyên vật liệu.</p>
                  <div class="d-flex justify-content-between text-success">
                    <strong>Số tiền thất thoát tiết kiệm được:</strong>
                    <strong class="fs-5" id="billSavedLoss">0đ</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
              <h5 class="fw-bold text-dark mb-0">TỔNG CỘNG HÓA ĐƠN:</h5>
              <h3 class="fw-bold text-primary mb-0" id="billTotalAmount">0đ</h3>
            </div>
          </div>
          
          <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:16px; border-bottom-right-radius:16px;">
            <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
            <button type="submit" class="btn btn-premium py-2 px-4"><i class="bi bi-wallet2 me-2"></i>Xác nhận Thanh toán & Giải phóng bàn</button>
          </div>
        </form>
      </div>

      <!-- VIEW 2: TÁCH BILL TRỰC QUAN (SPLIT BILL WORKSPACE) -->
      <div id="splitCheckoutDiv" style="display: none;">
        <form id="splitCheckoutForm" action="" method="POST" onsubmit="submitSplitCheckoutForm(event)">
          @csrf
          <div class="modal-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-warning mb-0"><i class="bi bi-scissors me-2"></i>Không gian làm việc tách hóa đơn</h6>
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="switchToStandardMode()">
                <i class="bi bi-arrow-left"></i> Quay lại Thanh toán chung
              </button>
            </div>

            <div class="row g-4">
              <!-- Left side: Bill B (Remaining on Table) -->
              <div class="col-12 col-md-6">
                <div class="card border-0 shadow-sm bg-light p-3" style="border-radius:12px;">
                  <h6 class="fw-bold text-secondary mb-3"><i class="bi bi-table me-2"></i>Bill B (Món giữ lại trên bàn)</h6>
                  <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                    <table class="table table-sm align-middle table-borderless">
                      <thead>
                        <tr class="text-secondary small">
                          <th>Tên món</th>
                          <th class="text-center">Số lượng</th>
                          <th class="text-end">Đơn giá</th>
                          <th class="text-center" style="width: 80px;">Chuyển</th>
                        </tr>
                      </thead>
                      <tbody id="splitLeftBody">
                        <!-- Dynamically populated -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Right side: Bill A (Paying Now) -->
              <div class="col-12 col-md-6">
                <div class="card border-warning border-opacity-20 shadow-sm bg-white p-3" style="border-radius:12px; border: 1.5px solid;">
                  <h6 class="fw-bold text-primary mb-3"><i class="bi bi-receipt-cutoff me-2"></i>Bill A (Thanh toán đợt này)</h6>
                  <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                    <table class="table table-sm align-middle table-borderless">
                      <thead>
                        <tr class="text-secondary small">
                          <th>Tên món</th>
                          <th class="text-center">Số lượng</th>
                          <th class="text-end">Đơn giá</th>
                          <th class="text-end">Thành tiền</th>
                          <th class="text-center" style="width: 50px;">Bỏ</th>
                        </tr>
                      </thead>
                      <tbody id="splitRightBody">
                        <!-- Dynamically populated -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- CRM Section for Bill A -->
            <div class="card border-primary border-opacity-25 bg-primary bg-opacity-10 p-3 my-4" style="border-radius:12px;">
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-person-heart me-2"></i>CRM Khách hàng & Tích điểm cho Bill A</h6>
              <div class="row g-2 align-items-center">
                <div class="col-md-5">
                  <label class="small text-secondary fw-semibold">Chọn thành viên:</label>
                  <select class="form-select form-select-sm border-0" id="crmSelectSplit" onchange="fillCrmCustomer(this, 'split')">
                    <option value="">-- Khách hàng vãng lai --</option>
                    @foreach ($crmCustomers as $customer)
                      <option value="{{ $customer->sdt }}" data-ten="{{ $customer->ten }}">{{ $customer->ten }} ({{ $customer->sdt }}) - {{ $customer->diem_tich_luy }} điểm</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="small text-secondary fw-semibold">Số điện thoại (tích điểm):</label>
                  <input type="text" name="sdt" id="checkoutSdtSplit" class="form-control form-control-sm border-0 py-1.5" placeholder="Nhập SĐT để tích điểm...">
                </div>
                <div class="col-md-3">
                  <label class="small text-secondary fw-semibold">Họ tên khách mới:</label>
                  <input type="text" name="khach_hang_ten" id="checkoutKhNameSplit" class="form-control form-control-sm border-0 py-1.5" placeholder="Tên khách mới...">
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
              <h5 class="fw-bold text-dark mb-0">TỔNG THANH TOÁN BILL A:</h5>
              <h3 class="fw-bold text-warning mb-0" id="splitBillTotalAmount">0đ</h3>
            </div>
          </div>
          
          <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:16px; border-bottom-right-radius:16px;">
            <button type="button" class="btn btn-secondary py-2" onclick="switchToStandardMode()">Quay lại</button>
            <button type="submit" class="btn btn-warning py-2 px-4 text-dark fw-bold"><i class="bi bi-wallet2 me-2"></i>Thanh toán Bill A</button>
          </div>
        </form>
      </div>

    </div>
  </div>
</div>
@endsection

@section('scripts')
<script>
  // Dynamic table data passed from Laravel
  const tablesData = @json($tables);
  let currentTable = null;
  
  // States of splitting cart
  let originalItems = []; // [{order_id, name, total_qty, don_gia, notes, status}]
  let splitItems = [];    // [{order_id, pay_qty}]

  function viewTableDetails(tableId) {
    const table = tablesData.find(t => t.id === tableId);
    if (!table) return;

    currentTable = table;
    $('#modalTableTitle').html(`<i class="bi bi-receipt-cutoff me-2"></i>HÓA ĐƠN CHI TIẾT - ${table.ten}`);
    
    // Set standard checkout form action
    $('#checkoutForm').attr('action', `/ban/thanh-toan/${table.id}`);
    $('#splitCheckoutForm').attr('action', `/ban/tach-thanh-toan/${table.id}`);

    // Reset CRM inputs
    $('#crmSelect').val('');
    $('#checkoutSdt').val('');
    $('#checkoutKhName').val('');
    $('#crmSelectSplit').val('');
    $('#checkoutSdtSplit').val('');
    $('#checkoutKhNameSplit').val('');

    // Switch view to Standard mode
    switchToStandardMode();

    // Populate billing items
    let bodyHtml = '';
    let subtotal = 0;
    originalItems = [];
    splitItems = [];

    const activeOrders = table.active_dat_mons || [];

    if (activeOrders.length > 0) {
      activeOrders.forEach(item => {
        const itemTotal = item.so_luong * item.don_gia;
        subtotal += itemTotal;

        // Record for split calculations
        originalItems.push({
          order_id: item.id,
          name: item.ten_mon,
          total_qty: item.so_luong,
          don_gia: item.don_gia,
          notes: item.ghi_chu,
          status: item.trang_thai
        });

        let statusBadge = '';
        if (item.trang_thai === 'dang_cho') {
          statusBadge = '<span class="badge bg-warning">Chờ bếp</span>';
        } else if (item.trang_thai === 'dang_lam') {
          statusBadge = '<span class="badge bg-primary">Đang nấu</span>';
        } else if (item.trang_thai === 'dang_giao') {
          statusBadge = '<span class="badge bg-info">Đang giao</span>';
        } else {
          statusBadge = '<span class="badge bg-success">Đã giao</span>';
        }

        bodyHtml += `
          <tr>
            <td><strong>${item.ten_mon}</strong></td>
            <td class="text-center font-weight-bold">${item.so_luong}</td>
            <td class="text-end">${numberWithCommas(item.don_gia)}đ</td>
            <td class="text-end fw-bold text-dark">${numberWithCommas(itemTotal)}đ</td>
            <td><small class="text-secondary">${item.ghi_chu || '-'}</small></td>
            <td>${statusBadge}</td>
          </tr>
        `;
      });
    } else {
      bodyHtml = `<tr><td colspan="6" class="text-center py-4 text-muted">Không có món ăn nào đang gọi tại bàn này.</td></tr>`;
    }

    $('#billItemsBody').html(bodyHtml);

    // Calculate profit stats
    const recipeCost = Math.round(subtotal * 0.60);
    const profit = subtotal - recipeCost;
    const savedLoss = Math.round(subtotal * 0.15);

    $('#billSubtotal').text(numberWithCommas(subtotal) + 'đ');
    $('#billRecipeCost').text(numberWithCommas(recipeCost) + 'đ');
    $('#billProfit').text('+' + numberWithCommas(profit) + 'đ');
    $('#billSavedLoss').text('+' + numberWithCommas(savedLoss) + 'đ');
    $('#billTotalAmount').text(numberWithCommas(subtotal) + 'đ');

    // Open Modal
    const myModal = new bootstrap.Modal(document.getElementById('tableDetailsModal'));
    myModal.show();
  }

  // View switches
  function switchToStandardMode() {
    $('#standardCheckoutDiv').show();
    $('#splitCheckoutDiv').hide();
  }

  function switchToSplitMode() {
    $('#standardCheckoutDiv').hide();
    $('#splitCheckoutDiv').show();
    renderSplitWorkspace();
  }

  // Split Workspace rendering and logic
  function renderSplitWorkspace() {
    let leftHtml = '';
    let rightHtml = '';
    let billATotal = 0;

    originalItems.forEach(item => {
      // Find how many quantities are assigned to Bill A (Right)
      const splitRecord = splitItems.find(s => s.order_id === item.order_id);
      const payQty = splitRecord ? splitRecord.pay_qty : 0;
      const remainingQty = item.total_qty - payQty;

      // Left Table (Bill B - Remaining)
      if (remainingQty > 0) {
        leftHtml += `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td class="text-center fw-bold">${remainingQty}</td>
            <td class="text-end text-muted small">${numberWithCommas(item.don_gia)}đ</td>
            <td class="text-center">
              <button type="button" class="btn btn-sm btn-warning p-1 py-0 rounded-circle" onclick="transferToRight(${item.order_id})">
                <i class="bi bi-arrow-right"></i>
              </button>
            </td>
          </tr>
        `;
      }

      // Right Table (Bill A - Paying now)
      if (payQty > 0) {
        const itemATotal = payQty * item.don_gia;
        billATotal += itemATotal;

        rightHtml += `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td class="text-center fw-bold text-primary">${payQty}</td>
            <td class="text-end text-muted small">${numberWithCommas(item.don_gia)}đ</td>
            <td class="text-end fw-bold">${numberWithCommas(itemATotal)}đ</td>
            <td class="text-center">
              <button type="button" class="btn btn-sm btn-outline-danger p-1 py-0 rounded-circle" onclick="transferToLeft(${item.order_id})">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }
    });

    if (!leftHtml) {
      leftHtml = `<tr><td colspan="4" class="text-center py-3 text-muted small">Tất cả món đã được đưa sang Bill A.</td></tr>`;
    }
    if (!rightHtml) {
      rightHtml = `<tr><td colspan="5" class="text-center py-3 text-muted small">Chưa chọn món nào để thanh toán.</td></tr>`;
    }

    $('#splitLeftBody').html(leftHtml);
    $('#splitRightBody').html(rightHtml);
    $('#splitBillTotalAmount').text(numberWithCommas(billATotal) + 'đ');
  }

  function transferToRight(orderId) {
    const item = originalItems.find(i => i.order_id === orderId);
    if (!item) return;

    let splitRecord = splitItems.find(s => s.order_id === orderId);
    if (!splitRecord) {
      splitRecord = { order_id: orderId, pay_qty: 0 };
      splitItems.push(splitRecord);
    }

    if (splitRecord.pay_qty < item.total_qty) {
      splitRecord.pay_qty++;
    }

    renderSplitWorkspace();
  }

  function transferToLeft(orderId) {
    const splitIndex = splitItems.findIndex(s => s.order_id === orderId);
    if (splitIndex === -1) return;

    const splitRecord = splitItems[splitIndex];
    if (splitRecord.pay_qty > 0) {
      splitRecord.pay_qty--;
    }

    if (splitRecord.pay_qty === 0) {
      splitItems.splice(splitIndex, 1);
    }

    renderSplitWorkspace();
  }

  function submitSplitCheckoutForm(event) {
    // Prevent default form submit to inject hidden inputs first
    event.preventDefault();

    if (splitItems.length === 0) {
      alert('Vui lòng chọn ít nhất một món ăn sang Bill A để tiến hành thanh toán tách hóa đơn!');
      return;
    }

    const form = $('#splitCheckoutForm');
    
    // Clear any previous injected splits input elements
    form.find('.injected-split-input').remove();

    // Inject hidden inputs for each split item
    splitItems.forEach((item, index) => {
      form.append(`<input type="hidden" class="injected-split-input" name="splits[${index}][order_id]" value="${item.order_id}">`);
      form.append(`<input type="hidden" class="injected-split-input" name="splits[${index}][pay_qty]" value="${item.pay_qty}">`);
    });

    // Injected CRM inputs
    form.append(`<input type="hidden" class="injected-split-input" name="sdt" value="${$('#checkoutSdtSplit').val()}">`);
    form.append(`<input type="hidden" class="injected-split-input" name="khach_hang_ten" value="${$('#checkoutKhNameSplit').val()}">`);

    form[0].submit();
  }

  function fillCrmCustomer(select, mode) {
    const selectedOption = $(select).find('option:selected');
    const sdt = selectedOption.val();
    const name = selectedOption.data('ten') || '';

    if (mode === 'standard') {
      $('#checkoutSdt').val(sdt);
      $('#checkoutKhName').val(name);
    } else {
      $('#checkoutSdtSplit').val(sdt);
      $('#checkoutKhNameSplit').val(name);
    }
  }

  // Print single table QR
  function printQrCode(tableId, tableName, qrUrl) {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>In mã QR - ${tableName}</title>
          <style>
            body {
              font-family: 'Outfit', sans-serif;
              text-align: center;
              padding: 40px;
              background-color: #fff;
              color: #2b2b2b;
            }
            .qr-card {
              border: 2px dashed #8e192a;
              border-radius: 20px;
              padding: 30px;
              display: inline-block;
              max-width: 320px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }
            h2 {
              color: #8e192a;
              margin-bottom: 5px;
              font-size: 20px;
              font-weight: 800;
            }
            h3 {
              color: #e6b15c;
              margin-top: 0;
              margin-bottom: 20px;
              font-size: 26px;
              font-weight: 700;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #8e192a;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 13px;
              color: #666;
              margin-top: 20px;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="logo">M&S CUISINE</div>
            <h2>QUÉT QR ĐẶT MÓN</h2>
            <h3>${tableName}</h3>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}" alt="QR Code" style="margin: 20px 0; border: 1px solid #eee; padding: 10px; border-radius: 10px;">
            <div class="instructions">
              Dùng điện thoại quét mã QR để xem thực đơn trực tuyến, gọi món trực tiếp và theo dõi trạng thái bếp!
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Print all tables QR
  function printAllQrCodes() {
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    
    let htmlContent = `
      <html>
        <head>
          <title>In Tất Cả Mã QR Bàn Ăn</title>
          <style>
            body {
              font-family: 'Outfit', sans-serif;
              background-color: #fff;
              color: #2b2b2b;
              margin: 0;
              padding: 20px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
            }
            .qr-card {
              border: 2px dashed #8e192a;
              border-radius: 20px;
              padding: 20px;
              text-align: center;
              page-break-inside: avoid;
            }
            h2 {
              color: #8e192a;
              margin-bottom: 5px;
              font-size: 18px;
            }
            h3 {
              color: #e6b15c;
              margin-top: 0;
              margin-bottom: 15px;
              font-size: 22px;
            }
            .logo {
              font-size: 20px;
              font-weight: 800;
              color: #8e192a;
            }
            .instructions {
              font-size: 12px;
              color: #666;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="qr-grid">
    `;

    tablesData.forEach(ban => {
      // Build absolute QR order URL
      const qrUrl = `${window.location.origin}/qr-order/${ban.id}`;
      htmlContent += `
        <div class="qr-card">
          <div class="logo">M&S CUISINE</div>
          <h2>QUÉT QR ĐẶT MÓN</h2>
          <h3>${ban.ten}</h3>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}" alt="QR Code" style="margin: 10px 0; border: 1px solid #eee; padding: 5px; border-radius: 10px;">
          <div class="instructions">
            Quét mã để xem thực đơn trực tuyến và tự phục vụ gọi món nhanh chóng.
          </div>
        </div>
      `;
    });

    htmlContent += `
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          <\/script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
</script>
@endsection
