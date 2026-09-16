@extends('layouts.app')

@section('title', 'So sánh Giá Nhà Cung Cấp & Tối ưu Mua Hàng')

@section('content')
<div class="container-fluid px-4 py-4">
    <!-- Header Page -->
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h1 class="h3 font-bold text-ms-dark mb-1">
                <i class="bi bi-diagram-3-fill text-ms-primary me-2"></i>Ma trận So sánh Giá Nhà Cung Cấp & Tối ưu Đấu thầu PO
            </h1>
            <p class="text-muted mb-0">Hệ thống phân tích báo giá thực tế, MOQ, lead-time và tự động đề xuất giỏ hàng mua nguyên liệu rẻ nhất & tối ưu nhất.</p>
        </div>
        <div class="d-flex gap-2">
            <a href="{{ route('nguyen_lieu.danh_sach_po') }}" class="btn btn-outline-danger font-semibold rounded-pill px-4">
                <i class="bi bi-journal-text me-1"></i> Quản lý Đơn PO
            </a>
            <button class="btn btn-ms-primary font-semibold rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalAddQuote">
                <i class="bi bi-cloud-arrow-down me-1"></i> Nạp Báo Giá Từ Web
            </button>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show rounded-xl mb-4" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <!-- Section 1: So sánh giá trực quan 1 loại nguyên liệu -->
    <div class="card card-premium mb-5">
        <div class="card-premium-header bg-light">
            <h2 class="card-premium-title">
                <i class="bi bi-search text-ms-primary"></i>So sánh đơn giá chi tiết giữa các đơn vị giao hàng
            </h2>
            <form method="GET" action="{{ route('nguyen_lieu.so_sanh_gia') }}" class="d-flex align-items-center gap-2">
                <label class="text-sm font-semibold text-muted text-nowrap">Chọn thực phẩm:</label>
                <select name="nguyen_lieu_id" class="form-select rounded-pill" onchange="this.form.submit()">
                    @foreach($nguyenLieus as $nl)
                        <option value="{{ $nl->id }}" {{ $selectedNguyenLieu && $selectedNguyenLieu->id == $nl->id ? 'selected' : '' }}>
                            {{ $nl->ten }} (Tồn: {{ $nl->so_luong_ton }} {{ $nl->don_vi }})
                        </option>
                    @endforeach
                </select>
            </form>
        </div>
        <div class="card-body p-4">
            @if($selectedNguyenLieu)
                <div class="row align-items-center mb-4">
                    <div class="col-md-4">
                        <div class="p-3 bg-red-50 rounded-2xl border border-red-100">
                            <span class="text-xs font-bold text-red-600 text-uppercase tracking-wider">Nguyên liệu được chọn</span>
                            <h3 class="text-2xl font-extrabold text-ms-primary mt-1 mb-0">{{ $selectedNguyenLieu->ten }}</h3>
                            <div class="text-sm text-muted mt-1">Đơn vị: <strong>{{ $selectedNguyenLieu->don_vi }}</strong> | Tồn kho hiện tại: <strong class="text-danger">{{ $selectedNguyenLieu->so_luong_ton }}</strong></div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="d-flex gap-3">
                            <div class="flex-1 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span class="text-xs font-semibold text-muted">Báo giá thấp nhất</span>
                                <div class="text-xl font-bold text-success mt-1">
                                    {{ $quotes->isNotEmpty() ? number_format($quotes->first()->don_gia_chao) . 'đ/' . $quotes->first()->don_vi_tinh : 'Chưa có' }}
                                </div>
                            </div>
                            <div class="flex-1 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span class="text-xs font-semibold text-muted">Số đơn vị cung cấp</span>
                                <div class="text-xl font-bold text-ms-dark mt-1">{{ $quotes->count() }} nhà cung cấp</div>
                            </div>
                            <div class="flex-1 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span class="text-xs font-semibold text-muted">Chênh lệch giá max-min</span>
                                <div class="text-xl font-bold text-amber-600 mt-1">
                                    @if($quotes->count() >= 2)
                                        {{ number_format($quotes->last()->don_gia_chao - $quotes->first()->don_gia_chao) }}đ
                                    @else
                                        0đ
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-gray-100 text-uppercase text-xs font-semibold text-gray-600">
                            <tr>
                                <th>Nhà Cung Cấp</th>
                                <th>Đơn Giá Chào</th>
                                <th>Đặt Tối Thiểu (MOQ)</th>
                                <th>Giao Hàng (Lead Time)</th>
                                <th>Đánh Giá Uy Tín</th>
                                <th>Đánh Giá Giá Cả</th>
                                <th class="text-end">Nguồn Dữ Liệu & Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($quotes as $index => $q)
                                <tr class="{{ $index == 0 ? 'table-success bg-opacity-25' : '' }}">
                                    <td>
                                        <div class="fw-bold text-ms-dark">{{ $q->nhaCungCap->ten }}</div>
                                        <small class="text-muted">{{ $q->nhaCungCap->sdt }} | {{ $q->nhaCungCap->dia_chi }}</small>
                                    </td>
                                    <td>
                                        <span class="fs-5 fw-extrabold {{ $index == 0 ? 'text-success' : 'text-ms-dark' }}">
                                            {{ number_format($q->don_gia_chao) }}đ
                                        </span>
                                        <span class="text-muted text-xs">/{{ $q->don_vi_tinh }}</span>
                                    </td>
                                    <td><span class="badge bg-light text-dark font-mono fs-6">{{ $q->moq }} {{ $q->don_vi_tinh }}</span></td>
                                    <td>
                                        <i class="bi bi-truck text-muted me-1"></i>{{ $q->lead_time_days }} ngày
                                    </td>
                                    <td>
                                        <div class="text-warning">
                                            @for($i=1; $i<=5; $i++)
                                                <i class="bi bi-star-fill {{ $i <= $q->danh_gia_star ? 'text-amber-400' : 'text-gray-300' }}"></i>
                                            @endfor
                                            <span class="text-xs text-dark ms-1 font-bold">({{ number_format($q->danh_gia_star, 1) }})</span>
                                        </div>
                                    </td>
                                    <td>
                                        @if($index == 0)
                                            <span class="badge bg-success rounded-pill px-3 py-2"><i class="bi bi-trophy-fill me-1"></i> Rẻ Nhất NÊN CHỌN</span>
                                        @elseif($index == $quotes->count() - 1)
                                            <span class="badge bg-danger rounded-pill px-3 py-2">Giá Cao Nhất</span>
                                        @else
                                            <span class="badge bg-secondary rounded-pill px-3 py-2">Giá Trung Bình</span>
                                        @endif
                                    </td>
                                    <td class="text-end">
                                        <div class="d-flex align-items-center justify-content-end gap-2">
                                            <span class="badge bg-light text-secondary border px-2.5 py-1.5 text-xs font-semibold" title="Báo giá nhận trực tiếp từ nguồn Web Nhà cung cấp">
                                                <i class="bi bi-globe text-primary me-1"></i>Trích xuất Web
                                            </span>
                                            <form method="POST" action="{{ route('nguyen_lieu.tao_po') }}" class="d-inline">
                                                @csrf
                                                <input type="hidden" name="nha_cung_cap_id" value="{{ $q->nha_cung_cap_id }}">
                                                <input type="hidden" name="che_do_toi_uu" value="{{ $cheDoToiUu }}">
                                                <input type="hidden" name="items[0][nguyen_lieu_id]" value="{{ $q->nguyen_lieu_id }}">
                                                <input type="hidden" name="items[0][so_luong]" value="{{ max(10 - ($selectedNguyenLieu->so_luong_ton ?? 0), $q->moq) }}">
                                                <input type="hidden" name="items[0][don_gia]" value="{{ $q->don_gia_chao }}">
                                                <button type="submit" class="btn btn-sm btn-ms-primary rounded-pill px-3 font-semibold">
                                                    <i class="bi bi-cart-plus me-1"></i>Chọn mua PO
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center py-5 text-muted">
                                        <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                                        Chưa có báo giá từ Nhà cung cấp nào cho nguyên liệu này. Hãy bấm "Thêm Báo Giá NCC" ở trên!
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </div>

    <!-- Section 2: Thuật toán Gợi ý Giỏ Hàng Mua Hàng Tối Ưu (Smart Procurement Optimizer) -->
    <div class="card card-premium">
        <div class="card-premium-header bg-linear-to-r from-amber-500 to-ms-primary text-white">
            <h2 class="card-premium-title text-white">
                <i class="bi bi-cpu-fill text-warning me-2"></i>Thuật toán Gợi ý Giỏ hàng Tự động mua Nguyên liệu
            </h2>
            <form method="GET" action="{{ route('nguyen_lieu.so_sanh_gia') }}" class="d-flex align-items-center gap-2">
                <input type="hidden" name="nguyen_lieu_id" value="{{ $selectedNguyenLieuId ?? $selectedNguyenLieu?->id }}">
                <span class="text-xs text-white opacity-90 me-2 font-semibold">Chế độ tối ưu:</span>
                <select name="che_do" class="form-select form-select-sm rounded-pill text-xs font-bold" onchange="this.form.submit()">
                    <option value="lowest_cost" {{ $cheDoToiUu == 'lowest_cost' ? 'selected' : '' }}>Chế độ 1: Tổng Chi Phí Thấp Nhất (Lowest Cost)</option>
                    <option value="lead_time" {{ $cheDoToiUu == 'lead_time' ? 'selected' : '' }}>Chế độ 2: Uy Tín & Giao Nhanh Nhất (High Trust & Fast)</option>
                </select>
            </form>
        </div>
        <div class="card-body p-4">
            <div class="alert alert-info border-0 rounded-2xl bg-blue-50 text-blue-900 mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <i class="bi bi-lightbulb-fill text-amber-500 me-2 fs-5"></i>
                    <strong>Hệ thống đề xuất gom mua các nguyên liệu dưới ngưỡng an toàn (Tồn < 10):</strong> 
                    Đã chọn NCC ưu đãi nhất, tự động tính tổng tiền theo MOQ.
                </div>
                <div class="text-end">
                    <span class="text-xs text-muted text-uppercase d-block">Tổng chi phí dự kiến</span>
                    <span class="text-2xl font-extrabold text-ms-primary">{{ number_format($totalEstimatedCost) }}đ</span>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-gray-100 text-uppercase text-xs font-semibold">
                        <tr>
                            <th>Nguyên liệu</th>
                            <th>Tồn hiện tại</th>
                            <th>Nhà cung cấp được chọn</th>
                            <th>Đơn giá chào</th>
                            <th>Số lượng cần mua</th>
                            <th>Thành tiền</th>
                            <th class="text-end">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($suggestedCart as $item)
                            <tr>
                                <td class="fw-bold text-ms-dark">{{ $item['nguyen_lieu']->ten }}</td>
                                <td><span class="badge bg-danger rounded-pill">{{ $item['nguyen_lieu']->so_luong_ton }} {{ $item['nguyen_lieu']->don_vi }}</span></td>
                                <td>
                                    <div class="fw-bold text-success"><i class="bi bi-building me-1"></i>{{ $item['nha_cung_cap']->ten }}</div>
                                    <small class="text-muted">Lead time: {{ $item['best_quote']->lead_time_days }} ngày | Rating: {{ $item['best_quote']->danh_gia_star }}★</small>
                                </td>
                                <td>{{ number_format($item['don_gia']) }}đ/{{ $item['best_quote']->don_vi_tinh }}</td>
                                <td><span class="fw-bold fs-6">{{ $item['so_luong_can_mua'] }} {{ $item['best_quote']->don_vi_tinh }}</span></td>
                                <td class="fw-extrabold text-ms-primary fs-5">{{ number_format($item['thanh_tien']) }}đ</td>
                                <td class="text-end">
                                    <form method="POST" action="{{ route('nguyen_lieu.tao_po') }}" class="d-inline">
                                        @csrf
                                        <input type="hidden" name="nha_cung_cap_id" value="{{ $item['nha_cung_cap']->id }}">
                                        <input type="hidden" name="che_do_toi_uu" value="{{ $cheDoToiUu }}">
                                        <input type="hidden" name="items[0][nguyen_lieu_id]" value="{{ $item['nguyen_lieu']->id }}">
                                        <input type="hidden" name="items[0][so_luong]" value="{{ $item['so_luong_can_mua'] }}">
                                        <input type="hidden" name="items[0][don_gia]" value="{{ $item['don_gia'] }}">
                                        <button type="submit" class="btn btn-sm btn-ms-primary rounded-pill px-3 font-semibold">
                                            <i class="bi bi-cart-plus me-1"></i>Tạo Đơn PO Ngay
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">
                                    Tất cả nguyên liệu trong kho hiện tại đều đạt mức tồn kho an toàn (> 10 kg/lít)!
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal Thêm Báo Giá Nhà Cung Cấp -->
<div class="modal fade" id="modalAddQuote" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-2xl border-0">
            <div class="modal-header bg-ms-primary text-white">
                <h5 class="modal-title font-bold"><i class="bi bi-cloud-arrow-down-fill me-2"></i>Nạp Dữ Liệu Báo Giá Nhận Từ Web Nhà Cung Cấp</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="{{ route('nguyen_lieu.save_quote') }}">
                @csrf
                <div class="modal-body p-4">
                    <!-- URL Auto Fetch Section -->
                    <div class="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                        <label class="form-label font-bold text-amber-900 text-sm mb-1 d-block">
                            <i class="bi bi-link-45deg fs-5 me-1 text-amber-600"></i>Dán Link Website Báo Giá NCC để Nạp Tự Động:
                        </label>
                        <div class="input-group">
                            <input type="url" id="web_quote_url" class="form-control rounded-l-xl border-amber-300" placeholder="VD: https://globalfood.vn/product/thit-bo-uc-nhap-khau">
                            <button class="btn btn-warning font-bold text-slate-900 px-3 rounded-r-xl" type="button" onclick="fetchWebQuoteData()">
                                <i class="bi bi-magic me-1"></i>Trích Xuất Link Web
                            </button>
                        </div>
                        <div id="fetch_status_msg" class="text-xs text-amber-800 mt-2 font-semibold d-none"></div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label font-semibold">Nhà Cung Cấp</label>
                        <select name="nha_cung_cap_id" id="quote_ncc_id" class="form-select rounded-xl" required>
                            @foreach($nhaCungCaps as $ncc)
                                <option value="{{ $ncc->id }}">{{ $ncc->ten }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label font-semibold">Nguyên Liệu Thực Phẩm</label>
                        <select name="nguyen_lieu_id" id="quote_nl_id" class="form-select rounded-xl" required>
                            @foreach($nguyenLieus as $nl)
                                <option value="{{ $nl->id }}">{{ $nl->ten }} ({{ $nl->don_vi }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Đơn Giá Báo (VND)</label>
                            <input type="number" step="0.01" name="don_gia_chao" id="quote_gia" class="form-control rounded-xl" placeholder="VD: 180000" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Đơn Vị Tính</label>
                            <input type="text" name="don_vi_tinh" id="quote_don_vi" class="form-control rounded-xl" value="kg" required>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Đặt Tối Thiểu (MOQ)</label>
                            <input type="number" step="0.1" name="moq" id="quote_moq" class="form-control rounded-xl" value="1" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label font-semibold">Thời Gian Giao (Ngày)</label>
                            <input type="number" name="lead_time_days" id="quote_lead_time" class="form-control rounded-xl" value="1" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label font-semibold">Đánh Giá Uy Tín (1 - 5 Sao)</label>
                        <select name="danh_gia_star" id="quote_star" class="form-select rounded-xl">
                            <option value="5.0">5.0 ★★★★★ (Rất uy tín)</option>
                            <option value="4.0">4.0 ★★★★☆ (Khá tốt)</option>
                            <option value="3.0">3.0 ★★★☆☆ (Trung bình)</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
                    <button type="submit" class="btn btn-ms-primary rounded-pill px-4 font-semibold">Lưu Báo Giá</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function fetchWebQuoteData() {
    const url = document.getElementById('web_quote_url').value;
    const msgDiv = document.getElementById('fetch_status_msg');
    if (!url) {
        alert('Vui lòng nhập hoặc dán đường link website báo giá!');
        return;
    }

    msgDiv.classList.remove('d-none');
    msgDiv.className = 'text-xs text-amber-800 mt-2 font-semibold d-block';
    msgDiv.innerHTML = '<i class="bi bi-arrow-repeat me-1 animate-spin"></i>Đang bóc tách & nạp tự động dữ liệu từ link web...';

    fetch('{{ route("nguyen_lieu.parse_url_quote") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({ url: url })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            msgDiv.className = 'text-xs text-emerald-700 mt-2 font-bold d-block';
            msgDiv.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i>' + data.message;

            if (data.data.nha_cung_cap_id) document.getElementById('quote_ncc_id').value = data.data.nha_cung_cap_id;
            if (data.data.nguyen_lieu_id) document.getElementById('quote_nl_id').value = data.data.nguyen_lieu_id;
            if (data.data.don_gia_chao) document.getElementById('quote_gia').value = data.data.don_gia_chao;
            if (data.data.don_vi_tinh) document.getElementById('quote_don_vi').value = data.data.don_vi_tinh;
            if (data.data.moq) document.getElementById('quote_moq').value = data.data.moq;
            if (data.data.lead_time_days) document.getElementById('quote_lead_time').value = data.data.lead_time_days;
            if (data.data.danh_gia_star) document.getElementById('quote_star').value = data.data.danh_gia_star;
        } else {
            msgDiv.className = 'text-xs text-rose-700 mt-2 font-bold d-block';
            msgDiv.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i>' + data.message;
        }
    })
    .catch(err => {
        msgDiv.className = 'text-xs text-rose-700 mt-2 font-bold d-block';
        msgDiv.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i>Lỗi kết nối đến link web!';
    });
}
</script>
@endsection
