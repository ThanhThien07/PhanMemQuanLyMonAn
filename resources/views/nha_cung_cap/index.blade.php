@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-truck me-2 text-primary"></i>Danh Mục Nhà Cung Cấp</h1>
      <p class="text-secondary small mb-0">Lưu trữ thông tin liên hệ nhà cung cấp nguyên vật liệu nhập khẩu, theo dõi lịch sử và tổng giá trị đơn hàng đã nhập kho.</p>
    </div>
    <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#addSupplierModal">
      <i class="bi bi-plus-circle me-1"></i> Thêm nhà cung cấp
    </button>
  </div>

  <!-- Search Bar -->
  <div class="card-premium bg-white p-4 mb-4">
    <form action="{{ route('nha_cung_cap.index') }}" method="GET" class="row g-3 align-items-center">
      <div class="col-12 col-md-8">
        <div class="input-group">
          <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" name="search" class="form-control bg-light border-0" placeholder="Tìm tên nhà cung cấp, địa chỉ..." value="{{ $search }}">
        </div>
      </div>
      <div class="col-12 col-md-4 d-flex gap-2">
        <button type="submit" class="btn btn-premium-gold px-4 flex-fill"><i class="bi bi-search me-1"></i> Tìm nhà cung cấp</button>
        @if ($search)
          <a href="{{ route('nha_cung_cap.index') }}" class="btn btn-outline-secondary px-3"><i class="bi bi-arrow-counterclockwise"></i></a>
        @endif
      </div>
    </form>
  </div>

  <!-- Suppliers Table -->
  <div class="card-premium bg-white">
    <div class="card-premium-header">
      <h5 class="card-premium-title"><i class="bi bi-shop text-primary"></i>Danh sách đối tác cung ứng</h5>
      <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold">{{ $suppliers->count() }} đối tác</span>
    </div>
    <div class="p-0 table-responsive">
      @if ($suppliers->count() > 0)
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr class="text-nowrap">
              <th class="ps-4" style="width: 50px;">ID</th>
              <th>Tên nhà cung cấp / Đối tác</th>
              <th>Số điện thoại liên hệ</th>
              <th>Địa chỉ trụ sở</th>
              <th>Đơn hàng đã đặt</th>
              <th>Tổng tiền nhập kho</th>
              <th>Ngày hợp tác</th>
              <th class="pe-4 text-end" style="width: 150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            @foreach ($suppliers as $s)
              <tr>
                <td class="ps-4 text-muted fw-semibold text-nowrap">#{{ $s->id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded p-2 me-3 bg-light text-primary">
                      <i class="bi bi-building fs-5"></i>
                    </div>
                    <div>
                      <strong class="text-dark d-block">{{ $s->ten }}</strong>
                    </div>
                  </div>
                </td>
                <td class="text-dark fw-bold text-nowrap">{{ $s->sdt ?: 'Chưa cập nhật' }}</td>
                <td class="text-secondary small">{{ $s->dia_chi ?: 'Chưa cập nhật' }}</td>
                <td class="text-nowrap">
                  <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-2 py-1">{{ $s->don_nhap_count }} đơn hàng</span>
                </td>
                <td class="text-nowrap">
                  <strong class="text-primary">{{ number_format($s->tong_nhap_gia_tri) }}đ</strong>
                </td>
                <td class="text-secondary small text-nowrap">
                  {{ $s->created_at ? $s->created_at->format('d/m/Y') : 'Hệ thống' }}
                </td>
                <td class="pe-4 text-end text-nowrap">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditModal({{ json_encode($s) }})">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <form action="{{ route('nha_cung_cap.destroy', $s->id) }}" method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa đối tác này không?')">
                      @csrf
                      @method('DELETE')
                      <button type="submit" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash-fill"></i>
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
          <i class="bi bi-truck fs-1 mb-2 d-block text-secondary"></i>
          <h6>Không tìm thấy nhà cung cấp nào.</h6>
        </div>
      @endif
    </div>
  </div>
</div>

<!-- Modal: Thêm nhà cung cấp mới -->
<div class="modal fade" id="addSupplierModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg animate-scale-up" style="border-radius:20px;">
      <div class="modal-header bg-premium text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold"><i class="bi bi-plus-circle me-2"></i>Thêm Nhà Cung Cấp</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="{{ route('nha_cung_cap.store') }}" method="POST">
        @csrf
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Tên đối tác cung ứng <span class="text-danger">*</span></label>
            <input type="text" name="ten" class="form-control bg-light border-0" required placeholder="Ví dụ: Đại lý thịt bò Metro, Co.op Food...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Số điện thoại liên hệ</label>
            <input type="text" name="sdt" class="form-control bg-light border-0" placeholder="Ví dụ: 0281234567...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Địa chỉ trụ sở đối tác</label>
            <input type="text" name="dia_chi" class="form-control bg-light border-0" placeholder="Ví dụ: 123 Lý Thường Kiệt, Quận 10...">
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
          <button type="submit" class="btn btn-premium py-2 px-4">Lưu đối tác</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Sửa nhà cung cấp -->
<div class="modal fade" id="editSupplierModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold text-warning"><i class="bi bi-pencil-square me-2"></i>Cập Nhật Đối Tác</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="editSupplierForm" method="POST">
        @csrf
        @method('PUT')
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Tên đối tác cung ứng <span class="text-danger">*</span></label>
            <input type="text" name="ten" id="edit_ten" class="form-control bg-light border-0" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Số điện thoại liên hệ</label>
            <input type="text" name="sdt" id="edit_sdt" class="form-control bg-light border-0">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Địa chỉ trụ sở</label>
            <input type="text" name="dia_chi" id="edit_dia_chi" class="form-control bg-light border-0">
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
  function openEditModal(s) {
    $('#editSupplierForm').attr('action', `/quan-ly/nha-cung-cap/${s.id}`);
    $('#edit_ten').val(s.ten);
    $('#edit_sdt').val(s.sdt);
    $('#edit_dia_chi').val(s.dia_chi);
    
    const myModal = new bootstrap.Modal(document.getElementById('editSupplierModal'));
    myModal.show();
  }
</script>
@endsection
