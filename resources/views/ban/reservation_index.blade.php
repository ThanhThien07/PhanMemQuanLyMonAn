@extends('layouts.app')

@section('title', 'Quản lý Đặt Bàn Trước & Tiền Cọc')

@section('content')
<div class="container-fluid px-4 py-4">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h1 class="h3 font-bold text-ms-dark mb-1">
                <i class="bi bi-calendar-check-fill text-ms-primary me-2"></i>Quản lý Đặt Bàn Trước & Tiền Cọc Giữ Bàn
            </h1>
            <p class="text-muted mb-0">Theo dõi lịch hẹn khách đến, quản lý số lượng người, giữ bàn trên sơ đồ và tiền đặt cọc.</p>
        </div>
        <div>
            <button class="btn btn-ms-primary font-semibold rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalAddReservation">
                <i class="bi bi-calendar-plus me-1"></i> Tạo Đặt Bàn Mới
            </button>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show rounded-xl mb-4" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card card-premium mb-5">
        <div class="card-premium-header bg-light">
            <h2 class="card-premium-title"><i class="bi bi-list-task text-ms-primary"></i>Danh sách lịch hẹn đặt bàn trước</h2>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-gray-100 text-uppercase text-xs font-semibold text-gray-600">
                        <tr>
                            <th>Mã Giữ Bàn</th>
                            <th>Tên Khách Hàng</th>
                            <th>Số Điện Thoại</th>
                            <th>Thời Gian Hẹn</th>
                            <th>Bàn Ăn</th>
                            <th>Số Khách</th>
                            <th>Tiền Cọc</th>
                            <th>Trạng Thái</th>
                            <th class="text-end">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($reservations as $res)
                            <tr>
                                <td>
                                    <span class="font-mono font-bold text-ms-primary fs-6">{{ $res->ma_reservation }}</span>
                                </td>
                                <td class="fw-bold text-ms-dark">{{ $res->ten_khach }}</td>
                                <td>
                                    <a href="tel:{{ $res->sdt }}" class="text-decoration-none text-blue-600 font-semibold">
                                        <i class="bi bi-telephone me-1"></i>{{ $res->sdt }}
                                    </a>
                                </td>
                                <td>
                                    <span class="badge bg-blue-50 text-blue-800 fs-6 font-semibold py-2 px-3">
                                        <i class="bi bi-clock me-1"></i>{{ $res->thoi_gian_hen ? $res->thoi_gian_hen->format('H:i - d/m/Y') : '' }}
                                    </span>
                                </td>
                                <td>
                                    @if($res->ban)
                                        <span class="badge bg-danger rounded-pill px-3 py-2 fs-6">{{ $res->ban->ten }}</span>
                                    @else
                                        <span class="badge bg-secondary rounded-pill px-3 py-2">Chưa xếp bàn</span>
                                    @endif
                                </td>
                                <td><i class="bi bi-people me-1"></i>{{ $res->so_luong_khach }} người</td>
                                <td>
                                    <span class="fw-bold text-success fs-6">{{ number_format($res->tien_coc) }}đ</span>
                                </td>
                                <td>
                                    @if($res->trang_thai === 'cho_xac_nhan')
                                        <span class="badge bg-warning text-dark rounded-pill px-3 py-1"><i class="bi bi-hourglass-split me-1"></i> Chờ Xác Nhận</span>
                                    @elseif($res->trang_thai === 'da_xac_nhan')
                                        <span class="badge bg-info text-white rounded-pill px-3 py-1"><i class="bi bi-check-circle me-1"></i> Đã Giữ Bàn</span>
                                    @elseif($res->trang_thai === 'khach_da_den')
                                        <span class="badge bg-success rounded-pill px-3 py-1"><i class="bi bi-geo-alt-fill me-1"></i> Khách Đã Đến</span>
                                    @else
                                        <span class="badge bg-secondary rounded-pill px-3 py-1">Đã Hủy</span>
                                    @endif
                                </td>
                                <td class="text-end">
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 dropdown-toggle" data-bs-toggle="dropdown">
                                            Chuyển trạng thái
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-xl">
                                            <li>
                                                <form method="POST" action="{{ route('dat_ban_truoc.update_status', $res->id) }}">
                                                    @csrf
                                                    <input type="hidden" name="trang_thai" value="da_xac_nhan">
                                                    <button type="submit" class="dropdown-item text-info"><i class="bi bi-check-circle me-2"></i>Đã Xác Nhận</button>
                                                </form>
                                            </li>
                                            <li>
                                                <form method="POST" action="{{ route('dat_ban_truoc.update_status', $res->id) }}">
                                                    @csrf
                                                    <input type="hidden" name="trang_thai" value="khach_da_den">
                                                    <button type="submit" class="dropdown-item text-success"><i class="bi bi-person-check-fill me-2"></i>Khách Đã Đến (Mở Bàn)</button>
                                                </form>
                                            </li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li>
                                                <form method="POST" action="{{ route('dat_ban_truoc.update_status', $res->id) }}">
                                                    @csrf
                                                    <input type="hidden" name="trang_thai" value="da_huy">
                                                    <button type="submit" class="dropdown-item text-danger"><i class="bi bi-x-circle me-2"></i>Hủy Phiếu Đặt</button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="text-center py-5 text-muted">
                                    <i class="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
                                    Chưa có phiếu đặt bàn trước nào.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal Tạo Đặt Bàn Mới -->
<div class="modal fade" id="modalAddReservation" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-2xl border-0">
            <div class="modal-header bg-ms-primary text-white">
                <h5 class="modal-title font-bold"><i class="bi bi-calendar-plus me-2"></i>Tạo Đặt Bàn Trước Mới</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="{{ route('dat_ban_truoc.store') }}">
                @csrf
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label font-semibold">Tên Khách Hàng</label>
                        <input type="text" name="ten_khach" class="form-control rounded-xl" placeholder="VD: Anh Minh" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label font-semibold">Số Điện Thoại</label>
                        <input type="text" name="sdt" class="form-control rounded-xl" placeholder="VD: 0901234567" required>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Bàn Chọn Trước</label>
                            <select name="ban_id" class="form-select rounded-xl">
                                <option value="">-- Tự động xếp sau --</option>
                                @foreach($bans as $b)
                                    <option value="{{ $b->id }}">{{ $b->ten }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Số Khách Đến</label>
                            <input type="number" name="so_luong_khach" class="form-control rounded-xl" value="2" min="1" required>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Thời Gian Hẹn Đến</label>
                            <input type="datetime-local" name="thoi_gian_hen" class="form-control rounded-xl" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Tiền Đặt Cọc (VND)</label>
                            <input type="number" name="tien_coc" class="form-control rounded-xl" placeholder="0" value="100000">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label font-semibold">Ghi Chú Đặt Bàn</label>
                        <textarea name="ghi_chu" class="form-control rounded-xl" rows="2" placeholder="VD: Cần bàn gần cửa sổ, ăn sinh nhật"></textarea>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
                    <button type="submit" class="btn btn-ms-primary rounded-pill px-4 font-semibold">Xác Nhận Đặt Bàn</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
