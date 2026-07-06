@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-person-heart me-2 text-primary"></i>Hồ Sơ & Chăm Sóc Khách Hàng</h1>
      <p class="text-secondary small mb-0">Quản lý cơ sở dữ liệu khách hàng CRM, theo dõi lịch sử giao dịch mua hàng, doanh thu đóng góp và quản lý điểm tích lũy thành viên.</p>
    </div>
    <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#addCustomerModal">
      <i class="bi bi-person-plus-fill me-1"></i> Đăng ký khách hàng
    </button>
  </div>

  <!-- Search and Filter Bar -->
  <div class="card-premium bg-white p-4 mb-4">
    <form action="{{ route('khach_hang.index') }}" method="GET" class="row g-3 align-items-center">
      <div class="col-12 col-md-8">
        <div class="input-group">
          <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" name="search" class="form-control bg-light border-0" placeholder="Tìm tên khách hàng, số điện thoại..." value="{{ $search }}">
        </div>
      </div>
      <div class="col-12 col-md-4 d-flex gap-2">
        <button type="submit" class="btn btn-premium-gold px-4 flex-fill"><i class="bi bi-search me-1"></i> Tìm kiếm CRM</button>
        @if ($search)
          <a href="{{ route('khach_hang.index') }}" class="btn btn-outline-secondary px-3"><i class="bi bi-arrow-counterclockwise"></i></a>
        @endif
      </div>
    </form>
  </div>

  <!-- Customers Table/Grid -->
  <div class="card-premium bg-white">
    <div class="card-premium-header">
      <h5 class="card-premium-title"><i class="bi bi-people-fill text-primary"></i>Danh sách khách hàng thành viên</h5>
      <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold">{{ $customers->count() }} thành viên</span>
    </div>
    <div class="p-0 table-responsive">
      @if ($customers->count() > 0)
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4" style="width: 50px;">ID</th>
              <th>Tên khách hàng</th>
              <th>Số điện thoại</th>
              <th>Hạng thành viên</th>
              <th>Điểm tích lũy</th>
              <th>Tổng chi tiêu đóng góp</th>
              <th>Ngày gia nhập</th>
              <th class="pe-4 text-end" style="width: 150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            @foreach ($customers as $c)
              @php
                $rank = 'Thành viên Bạc';
                $badgeColor = 'bg-secondary';
                if ($c->diem_tich_luy >= 300) {
                    $rank = 'Thành viên Kim Cương';
                    $badgeColor = 'bg-info text-dark';
                } elseif ($c->diem_tich_luy >= 150) {
                    $rank = 'Thành viên Vàng';
                    $badgeColor = 'bg-warning text-dark border border-warning';
                }
              @endphp
              <tr>
                <td class="ps-4 text-muted fw-semibold">#{{ $c->id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle p-2 me-3 bg-light text-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                      <i class="bi bi-person-fill fs-5"></i>
                    </div>
                    <div>
                      <strong class="text-dark d-block">{{ $c->ten }}</strong>
                    </div>
                  </div>
                </td>
                <td class="text-dark fw-bold">{{ $c->sdt }}</td>
                <td>
                  <span class="badge {{ $badgeColor }} px-2.5 py-1 fw-bold">{{ $rank }}</span>
                </td>
                <td>
                  <span class="badge bg-dark bg-opacity-10 text-dark border border-dark-subtle fs-6">{{ $c->diem_tich_luy }} điểm</span>
                </td>
                <td>
                  <strong class="text-success">+{{ number_format($c->doanh_thu_tich_luy) }}đ</strong>
                </td>
                <td class="text-secondary small">
                  {{ $c->created_at ? $c->created_at->format('d/m/Y') : 'Hệ thống' }}
                </td>
                <td class="pe-4 text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditModal({{ json_encode($c) }})">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <form action="{{ route('khach_hang.destroy', $c->id) }}" method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa hồ sơ khách hàng này không?')">
                      @csrf
                      @method('DELETE')
                      <button type="submit" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-person-dash-fill"></i>
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            @endforeach
          </tbody>
        </table>
      @else
        <div class="text-center py-5 text-muted">
          <i class="bi bi-person-heart fs-1 mb-2 d-block text-secondary"></i>
          <h6>Không tìm thấy thông tin khách hàng.</h6>
        </div>
      @endif
    </div>
  </div>
</div>

<!-- Modal: Đăng ký khách hàng mới -->
<div class="modal fade" id="addCustomerModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg animate-scale-up" style="border-radius:20px;">
      <div class="modal-header bg-premium text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold"><i class="bi bi-person-plus-fill me-2"></i>Đăng Ký Khách Hàng CRM</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="{{ route('khach_hang.store') }}" method="POST">
        @csrf
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Họ và tên khách hàng <span class="text-danger">*</span></label>
            <input type="text" name="ten" class="form-control bg-light border-0" required placeholder="Ví dụ: Nguyễn Thị Hoa...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Số điện thoại liên hệ <span class="text-danger">*</span></label>
            <input type="text" name="sdt" class="form-control bg-light border-0" required placeholder="Ví dụ: 0905123456...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Điểm tích lũy ban đầu</label>
            <input type="number" name="diem_tich_luy" class="form-control bg-light border-0" placeholder="Mặc định: 0" min="0">
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
          <button type="submit" class="btn btn-premium py-2 px-4">Lưu hồ sơ</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Sửa khách hàng -->
<div class="modal fade" id="editCustomerModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold text-warning"><i class="bi bi-pencil-square me-2"></i>Cập Nhật Hồ Sơ</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="editCustomerForm" method="POST">
        @csrf
        @method('PUT')
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Họ và tên khách hàng <span class="text-danger">*</span></label>
            <input type="text" name="ten" id="edit_ten" class="form-control bg-light border-0" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Số điện thoại liên hệ <span class="text-danger">*</span></label>
            <input type="text" name="sdt" id="edit_sdt" class="form-control bg-light border-0" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Điểm tích lũy thành viên <span class="text-danger">*</span></label>
            <input type="number" name="diem_tich_luy" id="edit_diem_tich_luy" class="form-control bg-light border-0" required min="0">
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
          <button type="submit" class="btn btn-premium-gold py-2 px-4 text-dark">Cập nhật</button>
        </div>
      </form>
    </div>
  </div>
</div>

@endsection

@section('scripts')
<script>
  function openEditModal(c) {
    $('#editCustomerForm').attr('action', `/quan-ly/khach-hang/${c.id}`);
    $('#edit_ten').val(c.ten);
    $('#edit_sdt').val(c.sdt);
    $('#edit_diem_tich_luy').val(c.diem_tich_luy);
    
    const myModal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    myModal.show();
  }
</script>
@endsection
