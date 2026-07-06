@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-egg-fried me-2 text-primary"></i>Quản Lý Thực Đơn & Danh Mục</h1>
      <p class="text-secondary small mb-0">Thiết lập các danh mục thực đơn thực tế (Khai vị, Món chính, Món lẩu,...) và quản lý các món ăn chi tiết.</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#addCategoryModal">
        <i class="bi bi-folder-plus me-1"></i> Thêm danh mục
      </button>
      <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#addDishModal">
        <i class="bi bi-plus-circle me-1"></i> Thêm món mới
      </button>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <ul class="nav nav-pills mb-4 gap-2" id="menuTabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active px-4 py-2.5 fw-semibold rounded-3 shadow-sm" id="dishes-tab" data-bs-toggle="tab" data-bs-target="#dishes-pane" type="button" role="tab"><i class="bi bi-list-stars me-2"></i>Danh sách Món ăn</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link px-4 py-2.5 fw-semibold rounded-3 shadow-sm" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories-pane" type="button" role="tab"><i class="bi bi-tags-fill me-2"></i>Danh mục Loại món ({{ $categories->count() }})</button>
    </li>
  </ul>

  <div class="tab-content" id="menuTabsContent">
    
    <!-- TAB 1: DISHES -->
    <div class="tab-pane fade show active" id="dishes-pane" role="tabpanel">
      <!-- Search and Filter Bar -->
      <div class="card-premium bg-white p-4 mb-4">
        <form action="{{ route('mon_an.index') }}" method="GET" class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" name="search" class="form-control bg-light border-0" placeholder="Tìm tên món ăn, mô tả..." value="{{ $search }}">
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select name="loai_mon_id" class="form-select bg-light border-0">
              <option value="">Tất cả danh mục loại món</option>
              @foreach ($categories as $cat)
                <option value="{{ $cat->id }}" {{ $loai_mon_id == $cat->id ? 'selected' : '' }}>{{ $cat->ten_loai }} ({{ $cat->ma_loai }})</option>
              @endforeach
            </select>
          </div>
          <div class="col-12 col-md-3 d-flex gap-2">
            <button type="submit" class="btn btn-premium-gold px-4 flex-fill"><i class="bi bi-funnel me-1"></i> Lọc thực đơn</button>
            @if ($search || $loai_mon_id)
              <a href="{{ route('mon_an.index') }}" class="btn btn-outline-secondary px-3"><i class="bi bi-arrow-counterclockwise"></i></a>
            @endif
          </div>
        </form>
      </div>

      <!-- Dishes Table -->
      <div class="card-premium bg-white">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-egg-fried text-primary"></i>Danh sách thực đơn hiện có</h5>
          <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold">{{ $dishes->count() }} món ăn</span>
        </div>
        <div class="p-0 table-responsive">
          @if ($dishes->count() > 0)
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4" style="width: 50px;">ID</th>
                  <th>Tên món ăn / Đồ uống</th>
                  <th>Danh mục loại món</th>
                  <th>Đơn giá</th>
                  <th>Định mức nấu</th>
                  <th>Mô tả chi tiết</th>
                  <th class="pe-4 text-end" style="width: 150px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @foreach ($dishes as $dish)
                  <tr>
                    <td class="ps-4 text-muted fw-semibold">#{{ $dish->id }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="rounded p-2 me-3 {{ $dish->loai === 'MonAn' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary' }}">
                          <i class="bi {{ $dish->loai === 'MonAn' ? 'bi-egg-fried' : 'bi-cup-hot' }} fs-5"></i>
                        </div>
                        <div>
                          <strong class="text-dark d-block">{{ $dish->ten }}</strong>
                          <span class="small text-muted" style="font-size: 11px;">Cập nhật: {{ $dish->updated_at->diffForHumans() }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      @if ($dish->loaiMon)
                        <span class="badge bg-dark bg-opacity-10 text-dark px-2.5 py-1 fw-bold">
                          <i class="bi bi-tag-fill me-1 text-warning"></i>{{ $dish->loaiMon->ten_loai }}
                        </span>
                      @else
                        <span class="text-muted small">Chưa phân loại</span>
                      @endif
                    </td>
                    <td>
                      <strong class="text-primary">{{ number_format($dish->gia) }}đ</strong>
                    </td>
                    <td>
                      <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle px-2 py-1"><i class="bi bi-clock me-1"></i>{{ $dish->time }} phút</span>
                    </td>
                    <td class="text-secondary small" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {{ $dish->mota ?: 'Chưa có mô tả ngắn' }}
                    </td>
                    <td class="pe-4 text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <button class="btn btn-sm btn-outline-primary" onclick='openEditModal({!! json_encode($dish) !!})'>
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <form action="{{ route('mon_an.destroy', $dish->id) }}" method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa món này khỏi thực đơn không?')">
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
              <i class="bi bi-journal-x fs-1 mb-2 d-block text-secondary"></i>
              <h6>Không tìm thấy món ăn nào.</h6>
              <button class="btn btn-sm btn-premium mt-2" data-bs-toggle="modal" data-bs-target="#addDishModal">Thêm món mới</button>
            </div>
          @endif
        </div>
      </div>
    </div>

    <!-- TAB 2: CATEGORIES -->
    <div class="tab-pane fade" id="categories-pane" role="tabpanel">
      <div class="card-premium bg-white">
        <div class="card-premium-header">
          <h5 class="card-premium-title"><i class="bi bi-tags text-primary"></i>Danh mục Loại món ăn thực tế</h5>
          <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 fw-bold">{{ $categories->count() }} danh mục</span>
        </div>
        <div class="p-0 table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4" style="width: 80px;">Mã loại</th>
                <th>Tên danh mục loại món</th>
                <th>Số lượng món thuộc nhóm</th>
                <th>Ngày cập nhật</th>
                <th class="pe-4 text-end" style="width: 150px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @foreach ($categories as $cat)
                <tr>
                  <td class="ps-4 fw-bold text-primary">{{ $cat->ma_loai }}</td>
                  <td>
                    <strong class="text-dark">{{ $cat->ten_loai }}</strong>
                  </td>
                  <td>
                    <span class="badge bg-secondary px-2.5 py-1 fw-semibold">{{ $cat->mon_ans_count }} món ăn</span>
                  </td>
                  <td class="text-secondary small">{{ $cat->updated_at->format('H:i d/m/Y') }}</td>
                  <td class="pe-4 text-end">
                    <div class="d-flex justify-content-end gap-1">
                      <button class="btn btn-sm btn-outline-primary" onclick='openEditCategoryModal({!! json_encode($cat) !!})'>
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      @if($cat->mon_ans_count == 0)
                        <form action="{{ route('loai_mon.destroy', $cat->id) }}" method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa danh mục này?')">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn btn-sm btn-outline-danger">
                            <i class="bi bi-trash-fill"></i>
                          </button>
                        </form>
                      @else
                        <button class="btn btn-sm btn-outline-secondary" disabled title="Không thể xóa danh mục đang có món ăn">
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      @endif
                    </div>
                  </td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Modal: Thêm món ăn mới -->
<div class="modal fade" id="addDishModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-premium text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold"><i class="bi bi-plus-circle me-2"></i>Thêm Món Ăn Mới</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="{{ route('mon_an.store') }}" method="POST">
        @csrf
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Tên món ăn / Đồ uống <span class="text-danger">*</span></label>
            <input type="text" name="ten" class="form-control bg-light border-0" required placeholder="Ví dụ: Gỏi ngó sen tai heo, Cơm chiên hải sản...">
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label fw-bold text-dark">Đơn giá (đ) <span class="text-danger">*</span></label>
              <input type="number" name="gia" class="form-control bg-light border-0" required placeholder="Ví dụ: 45000" min="0">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold text-dark">Định mức nấu (phút) <span class="text-danger">*</span></label>
              <input type="number" name="time" class="form-control bg-light border-0" required placeholder="Ví dụ: 10" min="1">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Danh mục phân loại <span class="text-danger">*</span></label>
            <select name="loai_mon_id" class="form-select bg-light border-0" required>
              <option value="" disabled selected>-- Chọn danh mục thực tế --</option>
              @foreach ($categories as $cat)
                <option value="{{ $cat->id }}">{{ $cat->ten_loai }} ({{ $cat->ma_loai }})</option>
              @endforeach
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Mô tả chi tiết</label>
            <textarea name="mota" class="form-control bg-light border-0" rows="3" placeholder="Mô tả thành phần nguyên liệu, cách chế biến..."></textarea>
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
          <button type="submit" class="btn btn-premium py-2 px-4">Lưu món mới</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Sửa món ăn -->
<div class="modal fade" id="editDishModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold text-warning"><i class="bi bi-pencil-square me-2"></i>Cập Nhật Món Ăn</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="editDishForm" method="POST">
        @csrf
        @method('PUT')
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Tên món ăn / Đồ uống <span class="text-danger">*</span></label>
            <input type="text" name="ten" id="edit_ten" class="form-control bg-light border-0" required>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label fw-bold text-dark">Đơn giá (đ) <span class="text-danger">*</span></label>
              <input type="number" name="gia" id="edit_gia" class="form-control bg-light border-0" required min="0">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold text-dark">Định mức nấu (phút) <span class="text-danger">*</span></label>
              <input type="number" name="time" id="edit_time" class="form-control bg-light border-0" required min="1">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Danh mục phân loại <span class="text-danger">*</span></label>
            <select name="loai_mon_id" id="edit_loai_mon_id" class="form-select bg-light border-0" required>
              @foreach ($categories as $cat)
                <option value="{{ $cat->id }}">{{ $cat->ten_loai }} ({{ $cat->ma_loai }})</option>
              @endforeach
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Mô tả chi tiết</label>
            <textarea name="mota" id="edit_mota" class="form-control bg-light border-0" rows="3"></textarea>
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

<!-- Modal: Thêm danh mục mới -->
<div class="modal fade" id="addCategoryModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold text-warning"><i class="bi bi-folder-plus me-2"></i>Thêm Danh Mục Mới</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form action="{{ route('loai_mon.store') }}" method="POST">
        @csrf
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Mã danh mục (ma_loai) <span class="text-danger">*</span></label>
            <input type="text" name="ma_loai" class="form-control bg-light border-0" required placeholder="Ví dụ: LM09, LM10...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Tên danh mục (ten_loai) <span class="text-danger">*</span></label>
            <input type="text" name="ten_loai" class="form-control bg-light border-0" required placeholder="Ví dụ: Món nướng đặc biệt, Nước ép nguyên chất...">
          </div>
        </div>
        <div class="modal-footer border-0 p-3 bg-light" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
          <button type="submit" class="btn btn-premium-gold py-2 px-4 text-dark">Lưu danh mục</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal: Sửa danh mục -->
<div class="modal fade" id="editCategoryModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
        <h5 class="modal-title fw-bold text-warning"><i class="bi bi-pencil-square me-2"></i>Cập Nhật Danh Mục</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="editCategoryForm" method="POST">
        @csrf
        @method('PUT')
        <div class="modal-body p-4">
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Mã danh mục (ma_loai) <span class="text-danger">*</span></label>
            <input type="text" name="ma_loai" id="edit_cat_ma_loai" class="form-control bg-light border-0" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold text-dark">Tên danh mục (ten_loai) <span class="text-danger">*</span></label>
            <input type="text" name="ten_loai" id="edit_cat_ten_loai" class="form-control bg-light border-0" required>
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
  // Cập nhật modal chỉnh sửa món ăn
  function openEditModal(dish) {
    $('#editDishForm').attr('action', `/quan-ly/mon-an/${dish.id}`);
    $('#edit_ten').val(dish.ten);
    $('#edit_gia').val(dish.gia);
    $('#edit_time').val(dish.time);
    $('#edit_loai_mon_id').val(dish.loai_mon_id);
    $('#edit_mota').val(dish.mota);
    
    const myModal = new bootstrap.Modal(document.getElementById('editDishModal'));
    myModal.show();
  }

  // Cập nhật modal chỉnh sửa danh mục loại món
  function openEditCategoryModal(cat) {
    $('#editCategoryForm').attr('action', `/quan-ly/loai-mon/sua/${cat.id}`);
    $('#edit_cat_ma_loai').val(cat.ma_loai);
    $('#edit_cat_ten_loai').val(cat.ten_loai);
    
    const myModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    myModal.show();
  }
</script>
@endsection
