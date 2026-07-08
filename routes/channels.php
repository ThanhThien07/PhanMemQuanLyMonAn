<?php

use Illuminate\Support\Facades\Broadcast;

// =========================================================================
// KHAI BÁO KÊNH BROADCASTING (REAL-TIME WEBSOCKET CHANNELS)
// =========================================================================
// Định nghĩa kênh xác thực quyền riêng tư cho các sự kiện truyền hình trực tiếp (Private Channels).
// Kênh mặc định kiểm tra xem người dùng đăng nhập hiện tại có trùng khớp với ID người dùng nhận tin hay không.
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
