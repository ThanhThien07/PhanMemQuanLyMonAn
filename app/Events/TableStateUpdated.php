<?php

namespace App\Events;

use App\Models\Ban;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TableStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ban;
    public $action; // 'update', 'checkout', 'request_checkout', 'confirm_paid', etc.

    /**
     * Create a new event instance.
     */
    public function __construct(Ban $ban, string $action = 'update')
    {
        $this->ban = $ban;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('tables'),
        ];
    }

    /**
     * Broadcast with custom data
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->ban->id,
            'ten' => $this->ban->ten,
            'trang_thai' => $this->ban->trang_thai,
            'so_luong_khach' => $this->ban->so_luong_khach,
            'yeu_cau_thanh_toan' => $this->ban->yeu_cau_thanh_toan,
            'action' => $this->action,
            'tong_tien' => $this->ban->activeDatMons->sum(function($item) {
                return $item->so_luong * $item->don_gia;
            }),
        ];
    }
}
