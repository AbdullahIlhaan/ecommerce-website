<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;

class OrderUpdated extends Notification
{
    use Queueable;

    public function __construct(public Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return Schema::hasTable('notifications') ? ['mail', 'database'] : ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $viewUrl = URL::signedRoute('orders.invoice', ['order' => $this->order]);

        return (new MailMessage)
                    ->subject('Order Status Update - #' . strtoupper(substr($this->order->id, 0, 8)))
                    ->greeting('Hello, ' . $this->order->customer->name . '!')
                    ->line('The status of your order has been updated to: ' . strtoupper($this->order->status))
                    ->line('Order ID: #' . strtoupper(substr($this->order->id, 0, 8)))
                    ->line('Total: BDT ' . number_format($this->order->total, 2))
                    ->action('View My Orders', $viewUrl)
                    ->line('If you have any questions, please contact our support.');
    }

    public function toSms(object $notifiable): void
    {
        $message = "Order Update: Your Order #" . strtoupper(substr($this->order->id, 0, 8)) . " is now " . strtoupper($this->order->status) . ". Check here: " . URL::signedRoute('orders.invoice', ['order' => $this->order]);
        
        // Placeholder for real SSLWireless / Infobip API
        Log::info("SMS notification to " . $this->order->customer->phone . ": " . $message);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'status' => $this->order->status,
        ];
    }
}
