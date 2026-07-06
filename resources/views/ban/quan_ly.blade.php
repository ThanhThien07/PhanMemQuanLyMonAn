@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  @if(session('success'))
    <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm mb-4" role="alert" style="border-radius: 12px;">
      <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  @endif
  @if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4" role="alert" style="border-radius: 12px;">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ session('error') }}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  @endif

  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-sliders me-2 text-primary"></i>Báo Cáo & Quản Lý Chung</h1>
      <p class="text-secondary small mb-0">Hệ thống giám sát điều hành toàn diện M&S. Lập báo cáo 7 phần định kỳ lưu trữ CSDL.</p>
    </div>
    <div class="d-flex gap-2 align-items-center">
      <form action="{{ route('quan_ly.report_trigger_auto') }}" method="POST" class="d-inline-flex gap-2 align-items-center mb-0">
        @csrf
        <select name="type" class="form-select py-2 border-success text-success fw-bold" style="width: 160px; border-radius: 8px;">
          <option value="weekly" selected>Báo cáo tuần</option>
          <option value="monthly">Báo cáo tháng</option>
        </select>
        <button type="submit" class="btn btn-success py-2 px-3 fw-bold text-white" style="border-radius: 8px;">
          <i class="bi bi-file-earmark-bar-graph me-1"></i> Tạo báo cáo
        </button>
      </form>
      <a href="{{ route('quan_ly.list_bao_cao') }}" class="btn btn-outline-primary py-2">
        <i class="bi bi-journal-text me-1"></i> Xem lịch sử báo cáo
      </a>
      <a href="{{ route('ban.index') }}" class="btn btn-outline-secondary py-2">
        <i class="bi bi-grid-3x3-gap me-1"></i> Sơ đồ bàn ăn
      </a>
    </div>
  </div>

  <!-- Advanced Sales Filter Card -->
  <div class="card-premium bg-white p-4 mb-4">
    <form action="{{ route('quan_ly.index') }}" method="GET" id="reportFilterForm">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-secondary">Phạm vi thống kê</label>
          <select name="filter_type" id="filterTypeSelect" class="form-select bg-light border-0" onchange="toggleFilterFields()">
            <option value="today" {{ $filterType === 'today' ? 'selected' : '' }}>Hôm nay (Thời gian thực)</option>
            <option value="yesterday" {{ $filterType === 'yesterday' ? 'selected' : '' }}>Hôm qua</option>
            <option value="custom_date" {{ $filterType === 'custom_date' ? 'selected' : '' }}>Theo ngày cụ thể</option>
            <option value="month" {{ $filterType === 'month' ? 'selected' : '' }}>Theo tháng</option>
            <option value="year" {{ $filterType === 'year' ? 'selected' : '' }}>Theo năm</option>
          </select>
        </div>

        <!-- Custom Date Input -->
        <div class="col-12 col-md-3 d-none" id="customDateContainer">
          <label class="form-label small fw-bold text-secondary">Chọn ngày báo cáo</label>
          <input type="date" name="custom_date" class="form-control bg-light border-0" value="{{ $customDate ?: date('Y-m-d') }}">
        </div>

        <!-- Custom Month Input -->
        <div class="col-12 col-md-3 d-none" id="customMonthContainer">
          <label class="form-label small fw-bold text-secondary">Chọn tháng báo cáo</label>
          <input type="month" name="custom_month" class="form-control bg-light border-0" value="{{ $customMonth ?: date('Y-m') }}">
        </div>

        <!-- Custom Year Input -->
        <div class="col-12 col-md-3 d-none" id="customYearContainer">
          <label class="form-label small fw-bold text-secondary">Chọn năm báo cáo</label>
          <select name="custom_year" class="form-select bg-light border-0">
            @for ($y = date('Y'); $y >= date('Y') - 5; $y--)
              <option value="{{ $y }}" {{ (int)$customYear === $y ? 'selected' : '' }}>Năm {{ $y }}</option>
            @endfor
          </select>
        </div>

        <div class="col-12 col-md-6 d-flex gap-2">
          <button type="submit" class="btn btn-premium-gold px-4 flex-fill"><i class="bi bi-filter-circle me-1"></i> Áp dụng bộ lọc</button>
          <a href="#" onclick="triggerCsvExport()" class="btn btn-outline-success px-3" title="Tải báo cáo CSV Excel"><i class="bi bi-file-earmark-excel-fill me-1"></i> Xuất Excel</a>
        </div>
      </div>
    </form>
  </div>

  <!-- 7-SECTION INTERACTIVE REPORT SUBMISSION FORM -->
  <div class="card-premium bg-white p-4 mb-4 border-start border-4 border-warning">
    <h5 class="fw-bold text-dark mb-3"><i class="bi bi-clipboard-check text-warning me-2"></i>Lập báo cáo ca làm việc & quản lý định kỳ (7 phần)</h5>
    <form action="{{ route('quan_ly.store_bao_cao') }}" method="POST">
      @csrf
      <input type="hidden" name="ngay_lap" value="{{ $customDate ?: date('Y-m-d') }}">
      
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label small fw-bold text-secondary">Ca làm việc</label>
          <select name="ca_lam_viec" class="form-select bg-light border-0" required>
            <option value="Sáng">Ca Sáng (06:00 - 14:00)</option>
            <option value="Chiều">Ca Chiều (14:00 - 22:00)</option>
            <option value="Tối">Ca Tối (22:00 - 06:00)</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold text-secondary">Số nhân viên trực ca</label>
          <input type="number" name="so_nhan_vien" class="form-control bg-light border-0" value="4" min="1" required>
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold text-secondary">Số giờ công tích lũy (h)</label>
          <input type="number" step="0.5" name="so_gio_lam" class="form-control bg-light border-0" value="8" min="0.5" required>
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold text-secondary">Hiệu suất nhân sự</label>
          <input type="text" name="hieu_suat" class="form-control bg-light border-0" value="Tốt" readonly>
        </div>
        
        <div class="col-md-4">
          <label class="form-label small fw-bold text-secondary">Phản hồi của khách hàng (Mục 1 & 7)</label>
          <textarea name="phan_hoi_khach" class="form-control bg-light border-0" rows="2" placeholder="Ví dụ: Khách rất hài lòng với chất lượng đồ ăn và thái độ phục vụ nhanh chóng."></textarea>
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-bold text-secondary">Ghi nhận Sự cố phát sinh (Mục 7)</label>
          <textarea name="su_co" class="form-control bg-light border-0" rows="2" placeholder="Ví dụ: Máy in nhiệt hóa đơn bị kẹt giấy lúc 19h, đã sửa chữa xong."></textarea>
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-bold text-secondary">Đề xuất / Kế hoạch (Mục 7)</label>
          <textarea name="de_xuat" class="form-control bg-light border-0" rows="2" placeholder="Ví dụ: Đề xuất bổ sung thêm 1 nhân viên chạy bàn cho ca tối cuối tuần."></textarea>
        </div>
      </div>
      <div class="mt-3 text-end">
        <button type="submit" class="btn btn-premium"><i class="bi bi-save me-1"></i> Lưu & Lưu trữ Báo cáo 7 Mục vào DB</button>
      </div>
    </form>
  </div>

  <!-- VIEW PREVIEW OF 7 SECTIONS OF REPORT -->
  <div class="card-premium bg-white mb-4">
    <div class="card-premium-header">
      <h5 class="card-premium-title"><i class="bi bi-file-earmark-text text-primary"></i>Xem trước nội dung chi tiết báo cáo 7 phần</h5>
      <span class="badge bg-secondary">Xem trước dữ liệu kỳ lọc</span>
    </div>
    
    <div class="p-4">
      <ul class="nav nav-tabs mb-3" id="reportTabs" role="tablist">
        <li class="nav-item">
          <button class="nav-link active fw-bold" id="tab1-btn" data-bs-toggle="tab" data-bs-target="#tab1" type="button">1. Ca & Nhân sự</button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" id="tab2-btn" data-bs-toggle="tab" data-bs-target="#tab2" type="button">2. Doanh thu</button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" id="tab3-btn" data-bs-toggle="tab" data-bs-target="#tab3" type="button">3. Đơn hàng</button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" id="tab4-btn" data-bs-toggle="tab" data-bs-target="#tab4" type="button">4. Món ăn</button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" id="tab5-btn" data-bs-toggle="tab" data-bs-target="#tab5" type="button">5. Nguyên liệu (Recipe)</button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" id="tab6-btn" data-bs-toggle="tab" data-bs-target="#tab6" type="button">6. Sự cố & Đóng góp</button>
        </li>
      </ul>

      <div class="tab-content" id="reportTabsContent">
        <!-- Section 1: Shift & Personnel -->
        <div class="tab-pane fade show active" id="tab1" role="tabpanel">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3" style="border-radius:12px;">
                <h6 class="fw-bold text-dark mb-2">Thông tin ca làm việc</h6>
                <p class="small text-secondary mb-1">Thời gian lập báo cáo: <strong>{{ date('d/m/Y') }}</strong></p>
                <p class="small text-secondary mb-1">Người phụ trách bàn giao ca: <strong>{{ Auth::user()->name ?? 'Quản lý ca trực' }}</strong></p>
                <p class="small text-secondary mb-0">Hiệu suất tổng quan: <span class="badge bg-success">Tốt</span></p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3" style="border-radius:12px;">
                <h6 class="fw-bold text-dark mb-2">Chi tiết nhân viên & chi phí lương tạm tính</h6>
                <p class="small text-secondary mb-1">Số lượng nhân sự hoạt động trực tiếp: <strong>4 nhân viên</strong></p>
                <p class="small text-secondary mb-1">Số giờ công thực tế tích lũy: <strong>8.0 giờ/ca</strong></p>
                <p class="small text-secondary mb-0">Chi phí nhân sự tạm tính (mức 25k/h): <strong>800,000đ</strong></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Revenue -->
        <div class="tab-pane fade" id="tab2" role="tabpanel">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="card border-0 bg-primary bg-opacity-10 text-primary p-3" style="border-radius:12px;">
                <h6 class="fw-bold mb-1">Tổng doanh thu</h6>
                <h3 class="fw-bold mb-0">{{ number_format($totalRevenue) }}đ</h3>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 bg-success bg-opacity-10 text-success p-3" style="border-radius:12px;">
                <h6 class="fw-bold mb-1">Chuyển khoản QR (Ước tính 65%)</h6>
                <h3 class="fw-bold mb-0">{{ number_format($totalRevenue * 0.65) }}đ</h3>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 bg-warning bg-opacity-10 text-warning p-3" style="border-radius:12px;">
                <h6 class="fw-bold mb-1">Tiền mặt tại quầy (Ước tính 35%)</h6>
                <h3 class="fw-bold mb-0">{{ number_format($totalRevenue * 0.35) }}đ</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Orders -->
        <div class="tab-pane fade" id="tab3" role="tabpanel">
          <div class="row g-3 text-center justify-content-center">
            <div class="col-6 col-md-4 col-lg-2">
              <div class="p-3 bg-light rounded h-100">
                <h6 class="text-secondary small mb-1">Tổng số đơn hàng</h6>
                <h4 class="fw-bold text-dark mb-0">{{ $totalOrdersCount }}</h4>
              </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <div class="p-3 bg-light rounded h-100">
                <h6 class="text-secondary small mb-1">Đơn hoàn thành</h6>
                <h4 class="fw-bold text-success mb-0">{{ $totalOrdersCount }}</h4>
              </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <div class="p-3 bg-light rounded h-100">
                <h6 class="text-secondary small mb-1">Tổng lượng khách</h6>
                <h4 class="fw-bold text-warning mb-0">{{ $totalGuestsServed }}</h4>
              </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <div class="p-3 bg-light rounded h-100">
                <h6 class="text-secondary small mb-1">Đơn hủy (Mô phỏng 2%)</h6>
                <h4 class="fw-bold text-danger mb-0">{{ round($totalOrdersCount * 0.02) }}</h4>
              </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <div class="p-3 bg-light rounded h-100">
                <h6 class="text-secondary small mb-1">Món ăn phục vụ</h6>
                <h4 class="fw-bold text-primary mb-0">{{ $totalPlatesServed }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Dishes -->
        <div class="tab-pane fade" id="tab4" role="tabpanel">
          <div class="row g-3">
            <div class="col-md-6">
              <h6 class="fw-bold text-dark mb-3"><i class="bi bi-star-fill text-warning me-1"></i> TOP 5 Món ăn bán chạy</h6>
              <div class="d-flex flex-column gap-2">
                @forelse ($bestSellers as $index => $item)
                  <div class="d-flex justify-content-between border-bottom pb-1">
                    <span>#{{ $index+1 }} <strong>{{ $item['ten_mon'] }}</strong></span>
                    <span>{{ $item['so_luong'] }} đĩa / {{ number_format($item['doanh_thu']) }}đ</span>
                  </div>
                @empty
                  <p class="text-muted small">Chưa ghi nhận số liệu bán chạy.</p>
                @endforelse
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold text-dark mb-3"><i class="bi bi-graph-down text-danger me-1"></i> Món ăn bán chậm nhất</h6>
              @if ($bestSellers->count() > 0)
                <p class="small">Món ít được khách lựa chọn nhất trong ca trực qua:</p>
                <div class="alert alert-secondary py-2 border-0">
                  <strong>{{ $bestSellers->last()['ten_mon'] }}</strong> (Bán ra {{ $bestSellers->last()['so_luong'] }} phần)
                </div>
              @else
                <p class="text-muted small">Không có dữ liệu.</p>
              @endif
            </div>
          </div>
        </div>

        <!-- Section 5: Materials (Recipe) -->
        <div class="tab-pane fade" id="tab5" role="tabpanel">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3" style="border-radius:12px;">
                <h6 class="fw-bold text-dark mb-2">ROI & Định mức hao phí Recipe</h6>
                <p class="small text-secondary mb-1">Tổng chi phí nguyên vật liệu định mức (recipe cost 60%): <strong>{{ number_format($totalRevenue * 0.6) }}đ</strong></p>
                <p class="small text-secondary mb-1">Lợi nhuận gộp kỳ lọc ước tính: <strong>{{ number_format($estimatedProfit) }}đ</strong></p>
                <p class="small text-success mb-0 fw-bold">Tiết kiệm từ Recipe (15%): <strong>+{{ number_format($savedFromLoss) }}đ</strong></p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-0 bg-danger bg-opacity-10 text-danger p-3" style="border-radius:12px;">
                <h6 class="fw-bold text-danger mb-2">Cảnh báo nguyên vật liệu sắp hết (&lt; 5kg)</h6>
                <p class="small text-secondary mb-2">Các nguyên liệu sau cần lập tức nhập thêm để phục vụ ca kế tiếp:</p>
                <div class="d-flex flex-wrap gap-2">
                  @forelse ($lowStockIngredients as $ing)
                    <span class="badge bg-danger">{{ $ing->ten }} ({{ $ing->so_luong_ton }} {{ $ing->don_vi }})</span>
                  @empty
                    <span class="badge bg-success">An toàn (Không có nguyên liệu nào dưới 5kg)</span>
                  @forelse ($lowStockIngredients as $ing) @empty @endforelse
                  @endforelse
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 6: Incidents & Suggestions -->
        <div class="tab-pane fade" id="tab6" role="tabpanel">
          <div class="row g-3">
            <div class="col-md-6">
              <h6 class="fw-bold text-dark mb-2">Ghi nhận sự cố & Phản hồi từ Khách hàng</h6>
              <div class="p-3 bg-light rounded small text-secondary">
                <i class="bi bi-chat-right-quote-fill me-1 text-primary"></i> Khách hàng phản hồi rất tích cực đối với giao diện đặt món QR tự chọn và xem bếp real-time.
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold text-dark mb-2">Phương án đề xuất tối ưu dịch vụ</h6>
              <div class="p-3 bg-light rounded small text-secondary">
                <i class="bi bi-lightbulb-fill me-1 text-warning"></i> Giữ vững định mức kiểm tra định lượng nguyên liệu theo từng ca làm việc để giảm thất thoát.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Historical Statistics Dashboard Grid -->
  <div class="row g-4">
    <!-- Left Column: Tables Grid & Best Sellers -->
    <div class="col-12 col-lg-8">
      
      <!-- 1. Best Selling Dishes (TOP 5) -->
      <div class="card-premium bg-white mb-4">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-graph-up text-primary"></i>TOP 5 Món Ăn Bán Chạy Nhất (Kỳ Lọc)</h5>
          <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold">Thống kê tự động</span>
        </div>
        <div class="p-4">
          @if ($bestSellers->count() > 0)
            <div class="d-flex flex-column gap-3">
              @php
                $maxQty = $bestSellers->max('so_luong') ?: 1;
              @endphp
              @foreach ($bestSellers as $index => $item)
                @php
                  $pct = ($item['so_luong'] / $maxQty) * 100;
                  $colorClass = 'bg-primary';
                  if ($index === 0) $colorClass = 'bg-danger'; // Đứng đầu
                  elseif ($index === 1) $colorClass = 'bg-warning';
                  elseif ($index === 2) $colorClass = 'bg-success';
                @endphp
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-1.5">
                    <div>
                      <strong class="text-dark">#{{ $index + 1 }} {{ $item['ten_mon'] }}</strong>
                      <span class="badge bg-secondary bg-opacity-10 text-secondary ms-2">{{ $item['so_luong'] }} đĩa</span>
                    </div>
                    <strong class="text-primary">{{ number_format($item['doanh_thu']) }}đ</strong>
                  </div>
                  <div class="progress" style="height: 12px; border-radius: 6px;">
                    <div class="progress-bar {{ $colorClass }}" role="progressbar" style="width: {{ $pct }}%; border-radius: 6px;" aria-valuenow="{{ $pct }}" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                </div>
              @endforeach
            </div>
          @else
            <div class="text-center py-5 text-muted">
              <i class="bi bi-bar-chart-line fs-1 mb-2 d-block text-secondary"></i>
              Không tìm thấy món ăn nào được bán ra trong kỳ báo cáo đã lọc.
            </div>
          @endif
        </div>
      </div>

      <!-- 2. Tables Status Grid -->
      <div class="card-premium bg-white mb-4">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-door-open text-primary"></i>Mật Độ Hoạt Động Bàn Ăn Hiện Tại</h5>
          <div class="d-flex gap-2 text-secondary small fw-bold">
            <span class="text-success"><i class="bi bi-circle-fill small me-1"></i>Trống: {{ $freeTables }}</span>
            <span class="text-primary"><i class="bi bi-circle-fill small me-1"></i>Có khách: {{ $occupiedTables }}</span>
            <span class="text-danger"><i class="bi bi-circle-fill small me-1"></i>Đã gọi: {{ $orderedTables }}</span>
          </div>
        </div>
        <div class="p-4">
          <div class="row g-2">
            @foreach ($tables as $t)
              @php
                $bg = 'bg-success';
                $text = 'Trống';
                if ($t->trang_thai === 'Co_khach') {
                    $bg = 'bg-primary';
                    $text = 'Có khách';
                } elseif ($t->trang_thai === 'Da_goi') {
                    $bg = 'bg-danger animate-pulse';
                    $text = 'Đã gọi món';
                }
              @endphp
              <div class="col-6 col-sm-4 col-md-3">
                <div class="p-3 rounded text-white text-center shadow-sm {{ $bg }}" style="min-height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                  <strong class="fs-6">{{ $t->ten }}</strong>
                  <span class="small opacity-75 mt-1" style="font-size: 11px;">{{ $text }}</span>
                </div>
              </div>
            @endforeach
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Timeline of Recent Orders -->
    <div class="col-12 col-lg-4">
      <div class="card-premium bg-white h-100">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-clock-history text-warning"></i>Món Ăn Được Gọi Gần Đây</h5>
        </div>
        <div class="p-3">
          @if ($recentOrders->count() > 0)
            <div class="position-relative ps-3 border-start border-secondary border-opacity-25" style="margin-left: 10px;">
              @foreach ($recentOrders as $order)
                @php
                  $color = 'bg-secondary';
                  if ($order->trang_thai === 'dang_cho') $color = 'bg-warning text-dark';
                  elseif ($order->trang_thai === 'dang_lam') $color = 'bg-primary';
                  elseif ($order->trang_thai === 'dang_giao') $color = 'bg-info text-dark';
                  elseif ($order->trang_thai === 'da_giao') $color = 'bg-success';
                  elseif ($order->trang_thai === 'da_thanh_toan') $color = 'bg-dark';
                @endphp
                <div class="mb-4 position-relative">
                  <!-- Timeline dot -->
                  <span class="position-absolute rounded-circle {{ $color }}" style="width: 12px; height: 12px; left: -20px; top: 6px; border: 2px solid white;"></span>
                  
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <strong class="text-dark">{{ $order->ten_mon }}</strong>
                      <span class="badge bg-dark ms-1 small" style="font-size: 9px;">{{ $order->ban->ten ?? 'Bàn' }}</span>
                      <div class="text-muted small">x{{ $order->so_luong }} &bull; {{ number_format($order->so_luong * $order->don_gia) }}đ</div>
                    </div>
                    <span class="text-secondary small" style="font-size: 10px;">{{ $order->created_at->diffForHumans() }}</span>
                  </div>
                  <div class="mt-1">
                    @if ($order->trang_thai === 'dang_cho')
                      <span class="badge bg-warning bg-opacity-10 text-dark border border-warning" style="font-size: 9px;">Chờ bếp</span>
                    @elseif ($order->trang_thai === 'dang_lam')
                      <span class="badge bg-primary bg-opacity-10 text-primary border border-primary" style="font-size: 9px;">Bếp đang nấu</span>
                    @elseif ($order->trang_thai === 'dang_giao')
                      <span class="badge bg-info bg-opacity-10 text-info border border-info" style="font-size: 9px;">Đang giao</span>
                    @elseif ($order->trang_thai === 'da_giao')
                      <span class="badge bg-success bg-opacity-10 text-success border border-success" style="font-size: 9px;">Đã giao</span>
                    @else
                      <span class="badge bg-dark bg-opacity-10 text-dark border border-dark" style="font-size: 9px;"><i class="bi bi-check-all me-1"></i>Đã thanh toán</span>
                    @endif
                  </div>
                </div>
              @endforeach
            </div>
          @else
            <div class="text-center py-5 text-muted">
              <i class="bi bi-clock-history fs-1 mb-2 d-block"></i>
              Không có giao dịch nào được ghi nhận gần đây.
            </div>
          @endif
        </div>
      </div>
    </div>
  </div>

  <!-- BACKUP STORAGE & MANAGEMENT PANEL -->
  <div class="card-premium bg-white p-4 mb-4 mt-4 border-start border-4 border-success">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h5 class="fw-bold text-dark mb-1"><i class="bi bi-cloud-arrow-up-fill text-success me-2"></i>Quản Lý Lưu Trữ & Sao Lưu Hệ Thống</h5>
        <p class="text-secondary small mb-0">Xem danh sách, tải về hoặc kích hoạt các bản sao lưu cơ sở dữ liệu MySQL và tệp tin hệ thống.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <form action="{{ route('quan_ly.backup_trigger_db') }}" method="POST" class="d-inline">
          @csrf
          <button type="submit" class="btn btn-outline-success btn-sm py-2 px-3 fw-bold">
            <i class="bi bi-database-fill-gear me-1"></i> Sao lưu Database (SQL)
          </button>
        </form>
        <form action="{{ route('quan_ly.backup_trigger_system') }}" method="POST" class="d-inline">
          @csrf
          <button type="submit" class="btn btn-premium-gold btn-sm py-2 px-3 fw-bold">
            <i class="bi bi-file-earmark-zip-fill me-1"></i> Sao lưu File hệ thống (ZIP)
          </button>
        </form>
      </div>
    </div>

    <!-- Alert Messages inside Dashboard -->
    @if(session('success'))
      <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm mb-3" role="alert" style="border-radius: 12px;">
        <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    @endif
    @if(session('error'))
      <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-3" role="alert" style="border-radius: 12px;">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    @endif

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Tên Bản Sao Lưu</th>
            <th class="text-center">Loại Sao Lưu</th>
            <th class="text-center">Kích thước</th>
            <th class="text-center">Thời Gian Tạo</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          @if(count($backupFiles) > 0)
            @foreach($backupFiles as $file)
              <tr>
                <td>
                  <strong class="text-dark"><i class="bi bi-file-earmark-text me-2 text-secondary"></i>{{ $file['name'] }}</strong>
                </td>
                <td class="text-center">
                  @if($file['type'] === 'ZIP Archive')
                    <span class="badge bg-warning text-dark px-2.5 py-1.5"><i class="bi bi-file-zip me-1"></i>ZIP Files</span>
                  @else
                    <span class="badge bg-success px-2.5 py-1.5"><i class="bi bi-database me-1"></i>SQL Dump</span>
                  @endif
                </td>
                <td class="text-center fw-semibold text-dark">
                  @if($file['size'] >= 1048576)
                    {{ number_format($file['size'] / 1048576, 2) }} MB
                  @elseif($file['size'] >= 1024)
                    {{ number_format($file['size'] / 1024, 1) }} KB
                  @else
                    {{ $file['size'] }} B
                  @endif
                </td>
                <td class="text-center text-muted small">
                  {{ $file['created_at']->format('H:i:s d/m/Y') }} <span class="badge bg-light text-secondary">({{ $file['created_at']->diffForHumans() }})</span>
                </td>
                <td class="text-end">
                  <div class="d-flex gap-2 justify-content-end">
                    <a href="{{ route('quan_ly.backup_download', $file['name']) }}" class="btn btn-sm btn-outline-primary px-3 py-1.5 rounded-pill">
                      <i class="bi bi-download me-1"></i> Tải về
                    </a>
                    <form action="{{ route('quan_ly.backup_delete', $file['name']) }}" method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tệp sao lưu này?')" class="d-inline">
                      @csrf
                      @method('DELETE')
                      <button type="submit" class="btn btn-sm btn-outline-danger px-3 py-1.5 rounded-pill">
                        <i class="bi bi-trash3 me-1"></i> Xóa
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            @endforeach
          @else
            <tr>
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="bi bi-folder2-open fs-2 mb-2 d-block text-secondary"></i>
                Chưa có tệp tin sao lưu nào trong thư mục lưu trữ (`storage/app/backups/`).
              </td>
            </tr>
          @endif
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script>
  function toggleFilterFields() {
    const filterType = $('#filterTypeSelect').val();
    
    // Hide all
    $('#customDateContainer').addClass('d-none');
    $('#customMonthContainer').addClass('d-none');
    $('#customYearContainer').addClass('d-none');
    
    // Show active
    if (filterType === 'custom_date') {
      $('#customDateContainer').removeClass('d-none');
    } else if (filterType === 'month') {
      $('#customMonthContainer').removeClass('d-none');
    } else if (filterType === 'year') {
      $('#customYearContainer').removeClass('d-none');
    }
  }

  function triggerCsvExport() {
    const formParams = $('#reportFilterForm').serialize();
    window.location.href = `/quan-ly/bao-cao/export?` + formParams;
  }

  // Dynamic dashboard reload on event broadcast
  function refreshDashboardHtml() {
    // TODO: Tối ưu bằng cách tạo API JSON riêng thay vì tải và parse toàn bộ trang HTML khi nhận event Echo
    $.get(window.location.href, function(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // Update the 6 sections preview tabs content
      $('#reportTabsContent').html($(doc).find('#reportTabsContent').html());
      
      // Update table status grid density card
      const newTableDensity = $(doc).find('.card-premium:has(.bi-door-open)').html();
      if (newTableDensity) {
        $('.card-premium:has(.bi-door-open)').html(newTableDensity);
      }
      
      // Update TOP 5 Best sellers card
      const newBestSellers = $(doc).find('.card-premium:has(.bi-graph-up)').html();
      if (newBestSellers) {
        $('.card-premium:has(.bi-graph-up)').html(newBestSellers);
      }
      
      // Update Recent Orders timeline card
      const newTimeline = $(doc).find('.card-premium:has(.bi-clock-history)').html();
      if (newTimeline) {
        $('.card-premium:has(.bi-clock-history)').html(newTimeline);
      }
    });
  }

  // Connect to Echo channels
  if (window.Echo) {
    window.Echo.channel('dashboard')
      .listen('DashboardUpdated', (e) => {
        console.log('Echo DashboardUpdated event:', e);
        refreshDashboardHtml();
      });

    // Also listen to orders and table changes to auto-update dashboard
    window.Echo.channel('orders')
      .listen('OrderStatusUpdated', (e) => {
        console.log('Echo OrderStatusUpdated on dashboard:', e);
        refreshDashboardHtml();
      });

    window.Echo.channel('tables')
      .listen('TableStateUpdated', (e) => {
        console.log('Echo TableStateUpdated on dashboard:', e);
        refreshDashboardHtml();
      });
  }

  // Run on load
  $(document).ready(function() {
    toggleFilterFields();
  });
</script>
@endsection
