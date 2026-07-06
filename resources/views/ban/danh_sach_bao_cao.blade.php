@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
  <!-- Page Header -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <div>
      <h1 class="h3 mb-1 fw-bold text-dark"><i class="bi bi-journal-text me-2 text-primary"></i>Lịch Sử Báo Cáo Ca & Quản Lý</h1>
      <p class="text-secondary small mb-0">Danh sách các báo cáo 7 phần định kỳ được lưu trữ trên hệ thống Cơ sở dữ liệu.</p>
    </div>
    <div class="d-flex gap-2">
      <a href="{{ route('quan_ly.index') }}" class="btn btn-outline-secondary py-2">
        <i class="bi bi-arrow-left me-1"></i> Quay lại Tổng quan
      </a>
    </div>
  </div>

  <!-- Table Card -->
  <div class="card-premium bg-white p-4">
    @if ($reports->count() > 0)
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Mã báo cáo</th>
              <th>Ngày lập</th>
              <th>Người lập</th>
              <th>Ca trực</th>
              <th class="text-end">Doanh thu</th>
              <th class="text-center">Đơn / Khách</th>
              <th class="text-center">Nhân sự ca</th>
              <th>Sự cố / Ý kiến</th>
              <th class="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            @foreach ($reports as $rep)
              <tr>
                <td><strong class="text-primary">{{ $rep->ma_bao_cao }}</strong></td>
                <td>{{ $rep->ngay_lap->format('d/m/Y') }}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-semibold">{{ $rep->nguoi_lap }}</span></td>
                <td><span class="badge bg-info bg-opacity-10 text-info fw-semibold">{{ $rep->ca_lam_viec }}</span></td>
                <td class="text-end fw-bold text-success">{{ number_format($rep->tong_doanh_thu) }}đ</td>
                <td class="text-center">
                  <span class="text-success fw-bold" title="Hoàn thành">{{ $rep->don_hoan_thanh }}</span> / 
                  <span class="text-danger fw-bold" title="Hủy">{{ $rep->don_huy }}</span>
                  <div class="small text-muted fw-semibold mt-1" title="Lượng khách"><i class="bi bi-people-fill text-warning me-1"></i>{{ $rep->tong_luong_khach ?: 0 }} khách</div>
                </td>
                <td class="text-center">{{ $rep->so_nhan_vien }} NV ({{ $rep->so_gio_lam }}h)</td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 150px;" title="{{ $rep->su_co }}">
                    {{ $rep->su_co ?: 'Không có sự cố' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" onclick="showReportDetails({{ $rep->id }})">
                    <i class="bi bi-eye"></i> Chi tiết
                  </button>
                </td>
              </tr>
            @endforeach
          </tbody>
        </table>
      </div>
    @else
      <div class="text-center py-5 text-muted">
        <i class="bi bi-journal-x fs-1 mb-2 d-block"></i>
        Không tìm thấy báo cáo nào được lưu trong Cơ sở dữ liệu.
      </div>
    @endif
  </div>
</div>

<!-- Modal Chi tiết Báo cáo -->
@foreach ($reports as $rep)
  <div class="modal fade" id="reportModal-{{ $rep->id }}" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
        <div class="modal-header bg-dark text-white border-0 py-3" style="border-top-left-radius:20px; border-top-right-radius:20px;">
          <h5 class="modal-title fw-bold text-warning"><i class="bi bi-file-earmark-bar-graph me-2"></i>BÁO CÁO CHI TIẾT: {{ $rep->ma_bao_cao }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="p-3 bg-light rounded">
                <span class="text-muted small">Ngày lập & Ca:</span>
                <h6 class="fw-bold mb-0 text-dark">{{ $rep->ngay_lap->format('d/m/Y') }} - Ca {{ $rep->ca_lam_viec }}</h6>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-light rounded">
                <span class="text-muted small">Người lập:</span>
                <h6 class="fw-bold mb-0 text-dark">{{ $rep->nguoi_lap }}</h6>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-light rounded">
                <span class="text-muted small">Tổng doanh thu:</span>
                <h6 class="fw-bold mb-0 text-success">{{ number_format($rep->tong_doanh_thu) }}đ</h6>
              </div>
            </div>
          </div>

          <h6 class="fw-bold text-dark border-bottom pb-2 mb-3"><i class="bi bi-grid-fill text-primary me-2"></i>Phân bổ 7 mục chi tiết</h6>
          <div class="row g-3">
            <!-- Shift & HR Info -->
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3 h-100" style="border-radius:12px;">
                <h6 class="fw-bold text-secondary mb-2" style="font-size: 13px;">1. Ca trực & 6. Nhân sự</h6>
                <p class="small mb-1">Số lượng nhân sự: <strong>{{ $rep->so_nhan_vien }} phục vụ</strong></p>
                <p class="small mb-1">Số giờ làm: <strong>{{ $rep->so_gio_lam }} giờ công</strong></p>
                <p class="small mb-0">Hiệu suất ca: <span class="badge bg-success">{{ $rep->hieu_suat ?: 'Tốt' }}</span></p>
              </div>
            </div>
            <!-- Financial breakdown -->
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3 h-100" style="border-radius:12px;">
                <h6 class="fw-bold text-secondary mb-2" style="font-size: 13px;">2. Phân bổ Doanh thu</h6>
                <p class="small mb-1">Tiền mặt: <strong>{{ number_format($rep->doanh_thu_tien_mat) }}đ</strong></p>
                <p class="small mb-1">Chuyển khoản QR: <strong>{{ number_format($rep->doanh_thu_chuyen_khoan) }}đ</strong></p>
                <p class="small mb-0">ROI vốn recipe (60%): <strong>{{ number_format($rep->tong_doanh_thu * 0.6) }}đ</strong></p>
              </div>
            </div>

            <!-- Orders stats -->
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3 h-100" style="border-radius:12px;">
                <h6 class="fw-bold text-secondary mb-2" style="font-size: 13px;">3. Đơn hàng & 4. Món ăn chạy nhất</h6>
                <p class="small mb-1">Tổng số đơn hàng đặt: <strong>{{ $rep->tong_don_hang }}</strong> (Phục vụ <strong>{{ $rep->tong_luong_khach ?: 0 }}</strong> khách)</p>
                <p class="small mb-1">Món bán chạy nhất: <strong class="text-danger">{{ $rep->mon_ban_chay ?: 'N/A' }}</strong></p>
                <p class="small mb-0">Món ít được gọi: <strong>{{ $rep->mon_ban_it ?: 'N/A' }}</strong></p>
              </div>
            </div>
            
            <!-- Materials info -->
            <div class="col-md-6">
              <div class="card border-0 bg-light p-3 h-100" style="border-radius:12px;">
                <h6 class="fw-bold text-secondary mb-2" style="font-size: 13px;">5. Nguyên liệu & Thất thoát</h6>
                <p class="small mb-1">Nguyên liệu nhập ca: <strong>Thịt bò, Hải sản, Rau xanh</strong></p>
                <p class="small mb-1">Cảnh báo tồn thấp: 
                  @if (is_array($rep->nguyen_lieu_sap_het) && count($rep->nguyen_lieu_sap_het) > 0)
                    <strong class="text-danger">{{ implode(', ', $rep->nguyen_lieu_sap_het) }}</strong>
                  @else
                    <strong class="text-success">Không có cảnh báo</strong>
                  @endif
                </p>
                <p class="small mb-0">Tiết kiệm hao phí (15%): <strong class="text-success">+{{ number_format($rep->tong_doanh_thu * 0.15) }}đ</strong></p>
              </div>
            </div>

            <!-- Incidents & Notes -->
            <div class="col-12">
              <div class="card border-0 bg-warning bg-opacity-10 text-warning-emphasis p-3" style="border-radius:12px;">
                <h6 class="fw-bold mb-2 text-dark" style="font-size: 13px;">7. Phản hồi khách hàng & Sự cố ca</h6>
                <p class="small mb-1"><i class="bi bi-chat-left-text-fill me-1"></i> Khách hàng: {{ $rep->phan_hoi_khach ?: 'Không ghi nhận ý kiến trái chiều' }}</p>
                <p class="small mb-1"><i class="bi bi-exclamation-triangle-fill me-1 text-danger"></i> Sự cố ca trực: <strong class="text-dark">{{ $rep->su_co ?: 'Không phát sinh sự cố lớn' }}</strong></p>
                <p class="small mb-0"><i class="bi bi-lightbulb-fill me-1 text-success"></i> Đề xuất của Quản lý: <strong class="text-dark">{{ $rep->de_xuat ?: 'Tiếp tục duy trì quy trình phục vụ' }}</strong></p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 bg-light py-2" style="border-bottom-left-radius:20px; border-bottom-right-radius:20px;">
          <button type="button" class="btn btn-secondary py-2" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>
@endforeach

@endsection

@section('scripts')
<script>
  function showReportDetails(id) {
    const modal = new bootstrap.Modal(document.getElementById(`reportModal-${id}`));
    modal.show();
  }
</script>
@endsection
