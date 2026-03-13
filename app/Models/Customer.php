<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'status',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
