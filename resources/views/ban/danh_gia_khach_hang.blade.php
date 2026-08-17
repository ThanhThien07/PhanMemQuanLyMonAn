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
        <div class="alert alert-danger border-0 rounded-2xl shadow-lg mb-5 animate-pulse">
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <h5 class="font-extrabold text-white mb-1"><i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>CẢNH BÁO ĐỎ KHẨN CẤP ({{ $emergencyAlerts->count() }} phản hồi 1-2 sao chưa xử lý!)</h5>
                    <p class="mb-0 text-white opacity-90">Có bàn đang chưa hài lòng với món ăn hoặc dịch vụ. Quản lý hãy đến trực tiếp xử lý ngay lập tức!</p>
                </div>
            </div>
            <hr class="border-white border-opacity-25 my-3">
            <div class="row g-3">
                @foreach($emergencyAlerts as $alert)
                    <div class="col-md-6">
                        <div class="p-3 bg-white bg-opacity-20 rounded-xl text-white">
                            <div class="d-flex justify-content-between align-items-center font-bold">
                                <span><i class="bi bi-geo-alt-fill me-1"></i>{{ $alert->ban->ten ?? 'Bàn ăn' }}</span>
                                <span class="badge bg-warning text-dark">{{ $alert->so_sao }} ★ SAO</span>
                            </div>
                            <div class="mt-2 font-semibold fs-6">"{{ $alert->noi_dung_danh_gia ?? 'Khách không nhập ghi chú' }}"</div>
                            <small class="opacity-75 d-block mt-1">Món: {{ $alert->datMon->ten_mon ?? 'Chung' }} | Thời gian: {{ $alert->created_at->diffForHumans() }}</small>
                        </div>
                    </div>
                @endforeach
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
                    <thead class="bg-gray-100 text-uppercase text-xs font-semibold text-gray-600">
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
                            <tr class="{{ $fb->canh_bao_do ? 'table-danger bg-opacity-25' : '' }}">
                                <td class="fw-bold text-ms-dark">{{ $fb->ban->ten ?? 'Khách vãng lai' }}</td>
                                <td>{{ $fb->datMon->ten_mon ?? 'Đánh giá chung' }}</td>
                                <td>
                                    <div class="text-warning">
                                        @for($i=1; $i<=5; $i++)
                                            <i class="bi bi-star-fill {{ $i <= $fb->so_sao ? 'text-amber-400' : 'text-gray-300' }}"></i>
                                        @endfor
                                        <span class="text-xs text-dark ms-1 font-bold">({{ $fb->so_sao }}/5)</span>
                                    </div>
                                </td>
                                <td class="fw-semibold text-gray-800">"{{ $fb->noi_dung_danh_gia ?? 'Không có nhận xét' }}"</td>
                                <td class="text-muted text-sm">{{ $fb->created_at->format('H:i - d/m/Y') }}</td>
                                <td>
                                    @if($fb->canh_bao_do)
                                        <span class="badge bg-danger rounded-pill px-3 py-1"><i class="bi bi-bell-fill me-1"></i> CẢNH BÁO ĐỎ</span>
                                    @else
                                        <span class="badge bg-success rounded-pill px-3 py-1">Hài lòng</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-5 text-muted">
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
