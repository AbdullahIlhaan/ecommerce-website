<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Schema;

class AdminOrderNotification extends Notification
{
    public function __construct(
        public Order $order,
        public string $event,
    ) {
    }

    public function via(object $notifiable): array
    {
        return Schema::hasTable('notifications') ? ['database'] : [];
    }

    public function toArray(object $notifiable): array
    {
        $invoiceNumber = $this->order->invoice_number ?: $this->order->buildInvoiceNumber();
        $customerName = $this->order->customer?->name ?: 'Customer';

        return [
            'title' => $this->event === 'placed' ? 'New order placed' : 'Order updated',
            'message' => $this->event === 'placed'
                ? sprintf('%s placed %s for BDT %s.', $customerName, $invoiceNumber, number_format((float) $this->order->total, 2))
                : sprintf('%s is now %s.', $invoiceNumber, strtoupper((string) $this->order->status)),
            'href' => route('orders.index'),
            'order_id' => $this->order->id,
            'invoice_number' => $invoiceNumber,
            'status' => $this->order->status,
            'payment_status' => $this->order->payment_status,
            'total' => (float) $this->order->total,
            'event' => $this->event,
        ];
    }
}
