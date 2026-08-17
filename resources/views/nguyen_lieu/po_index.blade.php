@extends('layouts.app')

@section('title', 'Quản lý Đơn Mua Hàng (PO)')

@section('content')
<div class="container-fluid px-4 py-4">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h1 class="h3 font-bold text-ms-dark mb-1">
                <i class="bi bi-file-earmark-spreadsheet-fill text-ms-primary me-2"></i>Danh Sách Đơn Đặt Hàng PO (Purchase Orders)
            </h1>
            <p class="text-muted mb-0">Quản lý toàn bộ các đơn mua hàng phát hành tự động gửi cho Nhà cung cấp thực phẩm.</p>
        </div>
        <div>
            <a href="{{ route('nguyen_lieu.so_sanh_gia') }}" class="btn btn-ms-primary font-semibold rounded-pill px-4">
                <i class="bi bi-diagram-3-fill me-1"></i> So Sánh Giá & Đặt PO Mới
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show rounded-xl mb-4" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card card-premium">
        <div class="card-premium-header bg-light">
            <h2 class="card-premium-title"><i class="bi bi-journal-check text-ms-primary"></i>Lịch sử Đơn Mua Hàng đã phát hành</h2>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-gray-100 text-uppercase text-xs font-semibold text-gray-600">
                        <tr>
                            <th>Mã Đơn PO</th>
                            <th>Nhà Cung Cấp</th>
                            <th>Ngày Đặt</th>
                            <th>Dự Kiến Giao</th>
                            <th>Tổng Chi Phí</th>
                            <th>Chế Độ Tối Ưu</th>
                            <th>Trạng Thái</th>
                            <th class="text-end">Chi Tiết Mặt Hàng</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($pos as $po)
                            <tr>
                                <td>
                                    <span class="font-mono font-bold text-ms-primary fs-6">{{ $po->ma_don_po }}</span>
                                </td>
                                <td>
                                    <div class="fw-bold text-ms-dark">{{ $po->nhaCungCap->ten }}</div>
                                    <small class="text-muted">{{ $po->nhaCungCap->sdt }}</small>
                                </td>
                                <td>{{ $po->ngay_dat ? $po->ngay_dat->format('d/m/Y') : '' }}</td>
                                <td>
                                    <span class="badge bg-blue-100 text-blue-800 font-medium">
                                        <i class="bi bi-calendar-event me-1"></i>{{ $po->du_kien_giao ? $po->du_kien_giao->format('d/m/Y') : 'Chưa xếp' }}
                                    </span>
                                </td>
                                <td>
                                    <span class="fs-5 font-extrabold text-success">{{ number_format($po->tong_tien) }}đ</span>
                                </td>
                                <td>
                                    @if($po->che_do_toi_uu === 'lowest_cost')
                                        <span class="badge bg-success rounded-pill px-3 py-1">Giá Rẻ Nhất</span>
                                    @else
                                        <span class="badge bg-info rounded-pill px-3 py-1">Giao Nhanh & Uy Tín</span>
                                    @endif
                                </td>
                                <td>
                                    @if($po->trang_thai === 'cho_duyet')
                                        <span class="badge bg-warning text-dark rounded-pill px-3 py-1"><i class="bi bi-clock me-1"></i> Chờ Duyệt PO</span>
                                    @elseif($po->trang_thai === 'da_giao_hang')
                                        <span class="badge bg-success rounded-pill px-3 py-1"><i class="bi bi-check-all me-1"></i> Đã Giao Kho</span>
                                    @else
                                        <span class="badge bg-secondary rounded-pill px-3 py-1">Đã Phát Hành</span>
                                    @endif
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" data-bs-toggle="collapse" data-bs-target="#po-details-{{ $po->id }}">
                                        <i class="bi bi-eye me-1"></i>Xem {{ $po->chiTiet->count() }} Mặt Hàng
                                    </button>
                                </td>
                            </tr>
                            <!-- Details Collapse Row -->
                            <tr class="collapse bg-gray-50" id="po-details-{{ $po->id }}">
                                <td colspan="8" class="p-4">
                                    <div class="p-3 bg-white rounded-xl border border-gray-200">
                                        <h6 class="font-bold text-ms-primary mb-3"><i class="bi bi-box-seam me-2"></i>Chi tiết các nguyên liệu trong đơn PO {{ $po->ma_don_po }}:</h6>
                                        <table class="table table-sm table-bordered align-middle mb-0 text-sm">
                                            <thead class="bg-gray-100">
                                                <tr>
                                                    <th>Nguyên Liệu</th>
                                                    <th>Số Lượng Đặt</th>
                                                    <th>Đơn Giá</th>
                                                    <th>Thành Tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach($po->chiTiet as $dt)
                                                    <tr>
                                                        <td><strong>{{ $dt->nguyenLieu->ten }}</strong></td>
                                                        <td>{{ $dt->so_luong_dat }} {{ $dt->nguyenLieu->don_vi }}</td>
                                                        <td>{{ number_format($dt->don_gia_dat) }}đ</td>
                                                        <td class="fw-bold text-success">{{ number_format($dt->thanh_tien) }}đ</td>
                                                    </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="bi bi-receipt fs-1 d-block mb-2 opacity-50"></i>
                                    Chưa có Đơn mua hàng PO nào được tạo.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
