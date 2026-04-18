<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasStringPrimaryKey;

class FooterSetting extends Model
{
    use HasFactory, HasStringPrimaryKey;

    protected $fillable = [
        'logo_path',
        'logo_text',
        'description',
        'address',
        'phone',
        'email',
        'facebook_url',
        'youtube_url',
        'facebook_pixel_id',
        'copyright',
        'payment_methods',
        'social_links',
    ];

    protected $casts = [
        'payment_methods' => 'array',
        'social_links' => 'array',
    ];
}
