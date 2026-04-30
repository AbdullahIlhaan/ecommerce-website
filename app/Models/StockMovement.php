<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'product_id',
        'order_id',
        'return_request_id',
        'user_id',
        'type',
        'quantity_change',
        'stock_before',
        'stock_after',
        'reference',
        'notes',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function returnRequest(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
