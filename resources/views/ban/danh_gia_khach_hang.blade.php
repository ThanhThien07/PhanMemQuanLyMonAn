@extends('layouts.app')

@section('title', 'Đánh Giá Khách Hàng & Cảnh Báo Sự Cố')

@section('content')
<div class="container-fluid px-4 py-4">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h1 class="h3 font-bold text-ms-dark mb-1">
                <i class="bi bi-star-half text-amber-500 me-2"></i>Đánh Giá Khách Hàng & Cảnh Báo Đỏ Khẩn Cấp
            </h1>
            <p class="text-muted mb-0">Giám sát mức độ hài lòng của khách hàng quét QR tại bàn và xử lý tức thì các phản hồi xấu (1-2 sao) trước khi khách rời quán.</p>
        </div>
    </div>

    @if($emergencyAlerts->isNotEmpty())
        <div class="card border-0 rounded-2xl shadow-md mb-5 overflow-hidden bg-white border-start border-5 border-danger">
            <div class="card-body p-4">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <h4 class="fw-extrabold text-danger mb-1 fs-4 d-flex align-items-center">
                            <span class="bg-danger text-white rounded-circle p-2 d-inline-flex align-items-center justify-content-center me-2 shadow-sm" style="width:36px; height:36px;">
                                <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                            </span>
                            CẢNH BÁO ĐỎ KHẨN CẤP ({{ $emergencyAlerts->count() }} phản hồi 1-2 sao chưa xử lý!)
                        </h4>
                        <p class="mb-0 text-slate-600 font-semibold ms-5">Có bàn đang chưa hài lòng với món ăn hoặc dịch vụ. Quản lý hãy đến trực tiếp xử lý ngay lập tức!</p>
                    </div>
                    <span class="badge bg-danger text-white font-bold px-3 py-2 fs-6 rounded-pill shadow-sm animate-pulse">
                        <i class="bi bi-bell-fill me-1"></i>Xử lý gấp
                    </span>
                </div>
                <hr class="border-slate-200 my-3">
                <div class="row g-3">
                    @foreach($emergencyAlerts as $alert)
                        <div class="col-md-6">
                            <div class="p-3 bg-red-50 rounded-xl border border-red-200">
                                <div class="d-flex justify-content-between align-items-center fw-bold">
                                    <span class="text-danger fs-5"><i class="bi bi-geo-alt-fill me-1"></i>{{ $alert->ban->ten ?? 'Bàn ăn' }}</span>
                                    <span class="badge bg-danger text-white font-extrabold px-3 py-1.5 fs-6 shadow-sm">{{ $alert->so_sao }} ★ SAO</span>
                                </div>
                                <div class="mt-2 fw-extrabold fs-5 text-slate-900">"{{ $alert->noi_dung_danh_gia ?? 'Khách không nhập ghi chú' }}"</div>
                                <small class="text-slate-600 d-block mt-2 font-semibold">
                                    <i class="bi bi-egg-fried me-1 text-danger"></i>Món: <strong class="text-slate-900">{{ $alert->datMon->ten_mon ?? 'Đánh giá chung' }}</strong> | <i class="bi bi-clock me-1"></i>{{ $alert->created_at->diffForHumans() }}
                                </small>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    @endif

    <div class="card card-premium">
        <div class="card-premium-header bg-light">
            <h2 class="card-premium-title"><i class="bi bi-chat-left-quote-fill text-ms-primary"></i>Tất cả phản hồi từ khách hàng</h2>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-slate-100 text-uppercase text-xs font-semibold text-slate-600">
                        <tr>
                            <th>Bàn Ăn</th>
                            <th>Món Ăn Bị Đánh Giá</th>
                            <th>Đánh Giá (Sao)</th>
                            <th>Nội Dung Phản Hồi</th>
                            <th>Thời Gian</th>
                            <th>Cảnh Báo KHẨN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($feedbacks as $fb)
                            <tr class="{{ $fb->canh_bao_do ? 'table-danger bg-red-50 text-rose-950' : '' }}">
                                <td class="fw-bold text-slate-900">{{ $fb->ban->ten ?? 'Khách vãng lai' }}</td>
                                <td class="fw-medium text-slate-800">{{ $fb->datMon->ten_mon ?? 'Đánh giá chung' }}</td>
                                <td>
                                    <div class="text-warning">
                                        @for($i=1; $i<=5; $i++)
                                            <i class="bi bi-star-fill {{ $i <= $fb->so_sao ? 'text-amber-400' : 'text-slate-300' }}"></i>
                                        @endfor
                                        <span class="text-xs text-slate-800 ms-1 font-bold">({{ $fb->so_sao }}/5)</span>
                                    </div>
                                </td>
                                <td class="fw-bold text-slate-900">"{{ $fb->noi_dung_danh_gia ?? 'Không có nhận xét' }}"</td>
                                <td class="text-slate-600 text-sm font-medium">{{ $fb->created_at->format('H:i - d/m/Y') }}</td>
                                <td>
                                    @if($fb->canh_bao_do)
                                        <span class="badge bg-danger text-white rounded-pill px-3 py-1.5 font-bold shadow-sm"><i class="bi bi-bell-fill me-1"></i> CẢNH BÁO ĐỎ</span>
                                    @else
                                        <span class="badge bg-success text-white rounded-pill px-3 py-1.5 font-bold shadow-sm"><i class="bi bi-check-circle-fill me-1"></i> Hài lòng</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-5 text-slate-500">
                                    <i class="bi bi-chat-square-heart fs-1 d-block mb-2 opacity-50"></i>
                                    Chưa có đánh giá nào từ khách hàng.
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
