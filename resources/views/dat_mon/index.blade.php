@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Tiêu đề trang quản lý các đơn đặt món -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-receipt me-2 text-primary"></i>Danh Sách Món Đang Phục Vụ</h1>
      <p class="text-secondary small mb-0">Quản lý và thống kê toàn bộ món ăn được khách hàng gọi tại M&S.</p>
    </div>
    <div class="d-flex gap-2">
      <!-- Nút mở nhanh màn hình KDS dành cho bếp -->
      <a href="{{ route('dat_mon.bep') }}" class="btn btn-premium bg-danger">
        <i class="bi bi-fire me-2"></i>Mở Màn Hình Bếp
      </a>
    </div>
  </div>

  <!-- Bộ lọc nhanh trạng thái đơn đặt món (Tất cả, Chờ bếp, Đang làm, Đang giao, Đã giao) -->
  <div class="card-premium p-3 bg-white mb-4">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div class="d-flex gap-2">
        <a href="{{ route('dat_mon.index') }}" class="btn btn-sm btn-outline-secondary rounded-pill {{ !$status ? 'active bg-secondary text-white' : '' }}">Tất cả</a>
        <a href="{{ route('dat_mon.index', ['status' => 'dang_cho']) }}" class="btn btn-sm btn-outline-secondary rounded-pill {{ $status === 'dang_cho' ? 'active bg-warning text-dark border-warning' : '' }}">Chờ bếp</a>
        <a href="{{ route('dat_mon.index', ['status' => 'dang_lam']) }}" class="btn btn-sm btn-outline-secondary rounded-pill {{ $status === 'dang_lam' ? 'active bg-primary text-white border-primary' : '' }}">Đang làm</a>
        <a href="{{ route('dat_mon.index', ['status' => 'dang_giao']) }}" class="btn btn-sm btn-outline-secondary rounded-pill {{ $status === 'dang_giao' ? 'active bg-info text-dark border-info' : '' }}">Đang giao</a>
        <a href="{{ route('dat_mon.index', ['status' => 'da_giao']) }}" class="btn btn-sm btn-outline-secondary rounded-pill {{ $status === 'da_giao' ? 'active bg-success text-white border-success' : '' }}">Đã giao</a>
      </div>
      
      <div class="text-secondary small font-weight-bold">
        Tổng số bản ghi: <strong>{{ $orders->count() }}</strong> đơn món
      </div>
    </div>
  </div>

  <!-- Bảng chi tiết danh sách các đĩa gọi món đang phục vụ -->
  <div class="card-premium bg-white">
    <div class="card-premium-header">
      <h5 class="card-premium-title"><i class="bi bi-list-ol"></i>Chi tiết danh sách các món ăn đã gọi</h5>
    </div>
    <div class="table-responsive p-0">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-4">Mã đơn</th>
            <th>Vị trí bàn</th>
            <th>Tên món ăn</th>
            <th class="text-center">Số lượng</th>
            <th class="text-end">Đơn giá</th>
            <th class="text-end">Thành tiền</th>
            <th>Thời gian định mức</th>
            <th>Thời gian đã trôi qua</th>
            <th>Trạng thái</th>
            <th class="pe-4 text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          @if ($orders->count() > 0)
            @foreach ($orders as $o)
              @php
                // Kiểm tra xem đơn hàng này có bị chậm trễ nấu hay không
                $isLate = $o->is_late_warning;
                $rowClass = '';
                if ($isLate) {
                    // Tô đỏ nhạt nền dòng nếu đơn bị quá hạn nấu định mức
                    $rowClass = 'table-danger table-opacity-10';
                }
              @endphp
              <tr class="{{ $rowClass }}">
                <!-- Mã định danh đĩa gọi món -->
                <td class="ps-4 text-secondary small">#DM-{{ str_pad($o->id, 4, '0', STR_PAD_LEFT) }}</td>
                <!-- Vị trí bàn ngồi ăn của khách -->
                <td>
                  <span class="badge bg-dark px-2 py-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ $o->ban->ten }}</span>
                </td>
                <!-- Tên món kèm ghi chú ăn uống -->
                <td>
                  <strong class="text-dark">{{ $o->ten_mon }}</strong>
                  @if ($o->ghi_chu)
                    <div class="text-muted small"><i class="bi bi-chat-left-text me-1"></i>Ghi chú: {{ $o->ghi_chu }}</div>
                  @endif
                </td>
                <td class="text-center font-weight-bold">{{ $o->so_luong }}</td>
                <td class="text-end text-secondary">{{ number_format($o->don_gia) }}đ</td>
                <td class="text-end fw-bold text-dark">{{ number_format($o->so_luong * $o->don_gia) }}đ</td>
                <!-- Định mức thời gian chế biến món ăn -->
                <td>
                  <span class="badge bg-warning bg-opacity-10 text-dark border border-warning"><i class="bi bi-clock me-1 text-warning"></i>{{ $o->thoi_gian_uoc_tinh }} phút</span>
                </td>
                <!-- Thời gian chờ đợi thực tế tích lũy -->
                <td>
                  @if ($o->trang_thai !== 'da_giao')
                    <span class="text-secondary small">{{ $o->minutes_elapsed }} phút</span>
                    @if ($isLate)
                      <span class="badge bg-danger ms-1 text-uppercase"><i class="bi bi-exclamation-triangle-fill"></i> Trễ</span>
                    @endif
                  @else
                    <span class="text-success small"><i class="bi bi-check-circle"></i> Đã hoàn thành</span>
                  @endif
                </td>
                <!-- Huy hiệu nhãn trạng thái của đĩa ăn -->
                <td>
                  @if ($o->trang_thai === 'dang_cho')
                    <span class="badge bg-warning text-dark"><i class="bi bi-hourglass me-1"></i>Đang chờ</span>
                  @elseif ($o->trang_thai === 'dang_lam')
                    <span class="badge bg-primary"><i class="bi bi-fire me-1"></i>Đang làm</span>
                  @elseif ($o->trang_thai === 'dang_giao')
                    <span class="badge bg-info text-dark"><i class="bi bi-truck me-1"></i>Đang giao</span>
                  @else
                    <span class="badge bg-success"><i class="bi bi-check2-all me-1"></i>Đã giao</span>
                  @endif
                </td>
                <!-- Cột hành động chuyển đổi trạng thái thủ công hoặc hủy đĩa gọi món -->
                <td class="pe-4 text-end">
                  <div class="dropdown d-inline-block">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Cập nhật
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-1">
                      <li><button class="dropdown-item py-2" onclick="changeStatus({{ $o->id }}, 'dang_cho')"><i class="bi bi-hourglass text-warning me-2"></i>Chuyển Đang chờ</button></li>
                      <li><button class="dropdown-item py-2" onclick="changeStatus({{ $o->id }}, 'dang_lam')"><i class="bi bi-fire text-primary me-2"></i>Chuyển Đang làm</button></li>
                      <li><button class="dropdown-item py-2" onclick="changeStatus({{ $o->id }}, 'dang_giao')"><i class="bi bi-truck text-info me-2"></i>Chuyển Đang giao</button></li>
                      <li><button class="dropdown-item py-2" onclick="changeStatus({{ $o->id }}, 'da_giao')"><i class="bi bi-check-circle text-success me-2"></i>Chuyển Đã giao</button></li>
                    </ul>
                  </div>
                  
                  <!-- Form thực hiện hủy món, có cảnh báo xác nhận -->
                  <form action="{{ route('dat_mon.destroy', $o->id) }}" method="POST" class="d-inline ms-1" onsubmit="return confirm('Bạn chắc chắn muốn hủy món ăn này không? Hành động này sẽ tự động hoàn trả nguyên vật liệu tương ứng về kho hàng!')">
                    @csrf
                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hủy món ăn">
                      <i class="bi bi-trash"></i>
                    </button>
                  </form>
                </td>
              </tr>
            @endforeach
          @else
            <!-- Trạng thái trống -->
            <tr>
              <td colspan="10" class="text-center py-5 text-muted">
                <i class="bi bi-receipt fs-2 mb-2 d-block"></i>
                Không tìm thấy đơn món ăn nào được ghi nhận.
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
  // Hàm gửi yêu cầu AJAX cập nhật trạng thái chế biến lên Server
  function changeStatus(orderId, status) {
    $.ajax({
      url: `/dat-mon/doi-trang-thai/${orderId}`,
      type: 'POST',
      data: {
        _token: '{{ csrf_token() }}',
        status: status
      },
      success: function(res) {
        if (res.success) {
          location.reload();
        }
      },
      error: function(err) {
        alert('Cập nhật trạng thái thất bại! Vui lòng kiểm tra lại định lượng tồn kho.');
      }
    });
  }
</script>
@endsection
