<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'code',
        'type',
        'value',
        'start_date',
        'end_date',
        'usage_limit',
        'usage_count',
        'status',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
