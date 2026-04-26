<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('translations')) {
            return;
        }

        DB::table('translations')
            ->where('translation_key', 'home.highlight_easy_title')
            ->update([
                'english_text' => 'Easy to Use',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('translations')) {
            return;
        }

        DB::table('translations')
            ->where('translation_key', 'home.highlight_easy_title')
            ->update([
                'english_text' => 'Easy to use test test test',
                'updated_at' => now(),
            ]);
    }
};
