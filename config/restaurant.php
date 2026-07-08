<?php

/*
|--------------------------------------------------------------------------
| Cấu hình nghiệp vụ nhà hàng M&S Cuisine
|--------------------------------------------------------------------------
|
| File này chứa các hằng số nghiệp vụ quan trọng của nhà hàng.
| Thay vì hardcode trực tiếp trong Controller, tập trung tại đây
| giúp dễ dàng điều chỉnh mà không cần sửa code logic.
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Ngưỡng cảnh báo tồn kho thấp
    |--------------------------------------------------------------------------
    | Khi số lượng tồn kho của một nguyên liệu xuống dưới ngưỡng này,
    | hệ thống sẽ hiển thị cảnh báo đỏ trên dashboard và màn hình quản lý.
    */
    'low_stock_threshold' => env('LOW_STOCK_THRESHOLD', 5),

    /*
    |--------------------------------------------------------------------------
    | Tỷ lệ lợi nhuận ước tính (Gross Profit Margin)
    |--------------------------------------------------------------------------
    | Phần trăm lợi nhuận gộp ước tính trên doanh thu thuần.
    | Dùng để tính chỉ số ROI ước lượng trên Dashboard Admin.
    | Mặc định: 40% (0.40)
    */
    'profit_margin' => env('PROFIT_MARGIN', 0.40),

    /*
    |--------------------------------------------------------------------------
    | Tỷ lệ tiết kiệm hao hụt kho
    |--------------------------------------------------------------------------
    | Tỷ lệ ước tính giá trị tiết kiệm được nhờ quản lý kho FEFO.
    | Mặc định: 15% (0.15)
    */
    'saved_from_loss_rate' => env('SAVED_FROM_LOSS_RATE', 0.15),

    /*
    |--------------------------------------------------------------------------
    | Tỷ lệ tích điểm CRM
    |--------------------------------------------------------------------------
    | Số tiền (VND) cần chi tiêu để được 1 điểm tích lũy CRM.
    | Mặc định: 10.000 VND = 1 điểm
    */
    'crm_points_per_vnd' => env('CRM_POINTS_PER_VND', 10000),

    /*
    |--------------------------------------------------------------------------
    | Phân phối thanh toán giả lập theo phương thức
    |--------------------------------------------------------------------------
    | Tỷ lệ phân bổ doanh thu theo phương thức thanh toán (dùng trong báo cáo ca).
    | Đây là giá trị ước lượng để tạo báo cáo nhanh.
    | Tổng phải bằng 1.0
    */
    'payment_split' => [
        'qr'       => env('PAYMENT_SPLIT_QR', 0.65),   // Chuyển khoản QR
        'tien_mat' => env('PAYMENT_SPLIT_CASH', 0.35), // Tiền mặt
    ],

];
