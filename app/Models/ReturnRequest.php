<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnRequest extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'order_id',
        'customer_id',
        'type',
        'status',
        'refund_amount',
        'restock_items',
        'reason',
        'details',
        'resolution_notes',
        'requested_at',
        'reviewed_at',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'restock_items' => 'boolean',
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
