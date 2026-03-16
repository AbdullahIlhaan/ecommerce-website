<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_banners', function (Blueprint $table) {
            $table->json('image_paths')->nullable()->after('image_path');
        });

        DB::table('hero_banners')
            ->whereNotNull('image_path')
            ->orderBy('created_at')
            ->lazy()
            ->each(function (object $banner): void {
                DB::table('hero_banners')
                    ->where('id', $banner->id)
                    ->update(['image_paths' => json_encode([$banner->image_path])]);
            });
    }

    public function down(): void
    {
        Schema::table('hero_banners', function (Blueprint $table) {
            $table->dropColumn('image_paths');
        });
    }
};
