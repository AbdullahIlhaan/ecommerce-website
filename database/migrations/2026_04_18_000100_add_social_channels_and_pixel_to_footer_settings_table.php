<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('footer_settings', function (Blueprint $table) {
            $table->string('facebook_url')->nullable()->after('email');
            $table->string('youtube_url')->nullable()->after('facebook_url');
            $table->string('facebook_pixel_id')->nullable()->after('youtube_url');
        });
    }

    public function down(): void
    {
        Schema::table('footer_settings', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_url',
                'youtube_url',
                'facebook_pixel_id',
            ]);
        });
    }
};

