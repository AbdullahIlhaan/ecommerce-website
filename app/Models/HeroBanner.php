<?php

namespace App\Models;

use App\Models\Concerns\HasStringPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroBanner extends Model
{
    use HasFactory;
    use HasStringPrimaryKey;

    protected $fillable = [
        'title',
        'subtitle',
        'button_label',
        'button_url',
        'image_path',
        'image_paths',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'image_paths' => 'array',
    ];
}
