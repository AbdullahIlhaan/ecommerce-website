<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;

class OrderPlaced extends Notification
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
                    ->subject('Order Confirmation - #' . strtoupper(substr($this->order->id, 0, 8)))
                    ->greeting('Hello, ' . $this->order->customer->name . '!')
                    ->line('Your order has been successfully placed. We are currently processing it.')
                    ->line('Order ID: #' . strtoupper(substr($this->order->id, 0, 8)))
                    ->line('Total Amount: BDT ' . number_format($this->order->total, 2))
                    ->action('Track Order', $viewUrl)
                    ->line('Thank you for shopping with FutureBD!');
    }

    public function toSms(object $notifiable): void
    {
        $message = "Your Order #" . strtoupper(substr($this->order->id, 0, 8)) . " of BDT " . $this->order->total . " has been placed. Track update: " . URL::signedRoute('orders.invoice', ['order' => $this->order]);
        
        // Placeholder for real SSLWireless / Infobip API
        Log::info("SMS notification to " . $this->order->customer->phone . ": " . $message);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'total' => $this->order->total,
            'status' => $this->order->status,
        ];
    }
}
