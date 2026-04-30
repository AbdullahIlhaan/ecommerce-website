<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'subtotal',
        'tax',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'shipping_carrier',
        'tracking_number',
        'estimated_delivery_at',
        'shipped_at',
        'delivered_at',
        'internal_notes',
        'delivery_zone',
        'delivery_charge',
        'delivery_city',
        'delivery_address',
        'delivery_location_label',
        'delivery_latitude',
        'delivery_longitude',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'estimated_delivery_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'delivery_latitude' => 'decimal:7',
        'delivery_longitude' => 'decimal:7',
    ];

    protected static function booted(): void
    {
        static::created(function (self $order): void {
            if (blank($order->invoice_number)) {
                $order->forceFill([
                    'invoice_number' => $order->buildInvoiceNumber(),
                ])->saveQuietly();
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function returnRequests(): HasMany
    {
        return $this->hasMany(ReturnRequest::class);
    }

    public function buildInvoiceNumber(): string
    {
        return sprintf(
            'INV-%s-%s',
            $this->created_at?->format('Ymd') ?? now()->format('Ymd'),
            strtoupper(substr($this->id, 0, 8)),
        );
    }
}
