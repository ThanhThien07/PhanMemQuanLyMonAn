@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-people-fill me-2 text-primary"></i>Quản Lý Nhân Viên & Phân Quyền</h1>
      <p class="text-secondary small mb-0">Tạo tài khoản, điều phối vai trò làm việc cho nhân viên và phân chia quyền hạn truy cập các khu vực chức năng.</p>
    </div>
    <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#addEmployeeModal">
      <i class="bi bi-person-plus-fill me-1"></i> Thêm tài khoản mới
    </button>
  </div>

  <!-- Search and Filter Bar -->
  <div class="card-premium bg-white p-4 mb-4">
    <form action="{{ route('nhan_vien_quan_ly.index') }}" method="GET" class="row g-3 align-items-center">
      <div class="col-12 col-md-5">
        <div class="input-group">
          <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" name="search" class="form-control bg-light border-0" placeholder="Tìm tên nhân viên, email..." value="{{ $search }}">
        </div>
      </div>
      <div class="col-12 col-md-3">
        <select name="role" class="form-select bg-light border-0">
          <option value="">Tất cả chức vụ</option>
          <option value="admin" {{ $role === 'admin' ? 'selected' : '' }}>Quản lý (Admin)</option>
          <option value="nhan_vien" {{ $role === 'nhan_vien' ? 'selected' : '' }}>Nhân viên phục vụ</option>
          <option value="bep" {{ $role === 'bep' ? 'selected' : '' }}>Đầu bếp (Kitchen)</option>
        </select>
      </div>
      <div class="col-12 col-md-4 d-flex gap-2">
        <button type="submit" class="btn btn-premium-gold px-4 flex-fill"><i class="bi bi-funnel me-1"></i> Lọc tài khoản</button>
        @if ($search || $role)
          <a href="{{ route('nhan_vien_quan_ly.index') }}" class="btn btn-outline-secondary px-3"><i class="bi bi-arrow-counterclockwise"></i></a>
        @endif
      </div>
    </form>
  </div>

  <!-- Employees Table/Grid -->
  <div class="card-premium bg-white">
    <div class="card-premium-header">
      <h5 class="card-premium-title"><i class="bi bi-shield-lock text-primary"></i>Danh sách nhân viên hệ thống</h5>
      <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold">{{ $employees->count() }} nhân sự</span>
    </div>
    <div class="p-0 table-responsive">
      @if ($employees->count() > 0)
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4" style="width: 50px;">ID</th>
              <th>Họ và tên nhân viên</th>
              <th>Địa chỉ Email</th>
              <th>Vai trò phục vụ</th>
              <th>Trạng thái hoạt động</th>
              <th>Ngày gia nhập</th>
              <th class="pe-4 text-end" style="width: 150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            @foreach ($employees as $emp)
              <tr>
                <td class="ps-4 text-muted fw-semibold">#{{ $emp->id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle p-2 me-3 {{ $emp->role === 'admin' ? 'bg-danger bg-opacity-10 text-danger' : ($emp->role === 'bep' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary') }}" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                      <i class="bi {{ $emp->role === 'admin' ? 'bi-shield-fill' : ($emp->role === 'bep' ? 'bi-fire' : 'bi-person-badge-fill') }} fs-5"></i>
                    </div>
                    <div>
                      <strong class="text-dark d-block">{{ $emp->name }}</strong>
                    </div>
                  </div>
                </td>
                <td class="text-muted fw-semibold">{{ $emp->email }}</td>
                <td>
                  @if ($emp->role === 'admin')
                    <span class="badge bg-danger bg-opacity-10 text-danger px-2.5 py-1 fw-bold"><i class="bi bi-shield-fill me-1"></i>Ban điều hành</span>
                  @elseif ($emp->role === 'bep')
                    <span class="badge bg-warning bg-opacity-10 text-warning px-2.5 py-1 fw-bold"><i class="bi bi-fire me-1"></i>Đầu bếp KDS</span>
                  @else
                    <span class="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 fw-bold"><i class="bi bi-people-fill me-1"></i>Nhân viên</span>
                  @endif
                </td>
                <td>
                  <span class="badge bg-success bg-opacity-10 text-success px-2 py-1 fw-semibold"><i class="bi bi-circle-fill small me-1"></i>Đang trực tuyến</span>
                </td>
                <td class="text-secondary small">
                  {{ $emp->created_at ? $emp->created_at->format('d/m/Y') : 'Hệ thống' }}
                </td>
                <td class="pe-4 text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditModal({{ json_encode($emp) }})">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    @if ($emp->email !== 'admin@ms.com')
                      <form action="{{ route('nhan_vien_quan_ly.destroy', $emp->id) }}" method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn thu hồi tài khoản của nhân viên này không?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger">
                          <i class="bi bi-person-x-fill"></i>
                        </button>
                      </form>
                    @endif
                  </div>
                </td>
              </tr>
            @endforeach
          </tbody>
        </table>
      @else
        <div class="text-center py-5 text-muted">
          <i class="bi bi-people fs-1 mb-2 d-block text-secondary"></i>
          <h6>Không tìm thấy nhân viên nào phù hợp.</h6>
        </div>
      @endif
    </div>
  </div>
</div>

<!-- Modal: Thêm nhân viên mới -->
<div class="modal fade" id="addEmployeeModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg animate-scale-up" style="border-radius:20px;">
      <div class="modal-header bg-premium text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold"><i class="bi bi-person-plus-fill me-2"></i>Thêm Tài Khoản Nhân Viên</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="{{ route('nhan_vien_quan_ly.store') }}" method="POST">
        @csrf
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Họ và tên nhân sự <span class="text-danger">*</span></label>
            <input type="text" name="name" class="form-control bg-light border-0" required placeholder="Ví dụ: Nguyễn Văn Hải...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Địa chỉ Email đăng nhập <span class="text-danger">*</span></label>
            <input type="email" name="email" class="form-control bg-light border-0" required placeholder="Ví dụ: hai.nv@ms.com...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Mật khẩu đăng nhập <span class="text-danger">*</span></label>
            <input type="password" name="password" class="form-control bg-light border-0" required placeholder="Tối thiểu 6 ký tự..." minlength="6">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Chức năng phân quyền <span class="text-danger">*</span></label>
            <select name="role" class="form-select bg-light border-0" required>
              <option value="nhan_vien">Nhân viên phục vụ (Staff orders & table checkout)</option>
              <option value="bep">Đầu bếp phục vụ KDS (Kitchen management)</option>
              <option value="admin">Quản trị viên hệ thống (Admin & statistics)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
          <button type="submit" class="btn btn-premium py-2 px-4">Lưu nhân sự</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Sửa nhân viên -->
<div class="modal fade" id="editEmployeeModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold text-warning"><i class="bi bi-pencil-square me-2"></i>Cập Nhật Nhân Sự</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="editEmployeeForm" method="POST">
        @csrf
        @method('PUT')
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Họ và tên nhân sự <span class="text-danger">*</span></label>
            <input type="text" name="name" id="edit_name" class="form-control bg-light border-0" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Địa chỉ Email <span class="text-danger">*</span></label>
            <input type="email" name="email" id="edit_email" class="form-control bg-light border-0" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Mật khẩu mới (để trống nếu giữ nguyên)</label>
            <input type="password" name="password" class="form-control bg-light border-0" placeholder="Tối thiểu 6 ký tự..." minlength="6">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Chức năng phân quyền <span class="text-danger">*</span></label>
            <select name="role" id="edit_role" class="form-select bg-light border-0" required>
              <option value="nhan_vien">Nhân viên phục vụ (Staff orders & table checkout)</option>
              <option value="bep">Đầu bếp phục vụ KDS (Kitchen management)</option>
              <option value="admin">Quản trị viên hệ thống (Admin & statistics)</option>
            </select>
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
  function openEditModal(emp) {
    $('#editEmployeeForm').attr('action', `/quan-ly/nhan-vien/${emp.id}`);
    $('#edit_name').val(emp.name);
    $('#edit_email').val(emp.email);
    $('#edit_role').val(emp.role);
    
    const myModal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
    myModal.show();
  }
</script>
@endsection
