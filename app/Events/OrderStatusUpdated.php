<?php

namespace App\Events;

use App\Models\DatMon;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    /**
     * Create a new event instance.
     */
    public function __construct(DatMon $order)
    {
        $this->order = $order;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
        ];
    }

    /**
     * Broadcast with custom data
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'ban_id' => $this->order->ban_id,
            'ban_ten' => $this->order->ban->ten ?? 'Bàn',
            'ten_mon' => $this->order->ten_mon,
            'so_luong' => $this->order->so_luong,
            'don_gia' => $this->order->don_gia,
            'trang_thai' => $this->order->trang_thai,
            'thoi_gian_uoc_tinh' => $this->order->thoi_gian_uoc_tinh,
            'thu_tu_uu_tien' => $this->order->thu_tu_uu_tien,
            'ghi_chu' => $this->order->ghi_chu,
            'created_at' => $this->order->created_at->toIso8601String(),
        ];
    }
}
