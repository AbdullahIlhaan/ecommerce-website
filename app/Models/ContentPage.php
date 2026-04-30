<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentPage extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
