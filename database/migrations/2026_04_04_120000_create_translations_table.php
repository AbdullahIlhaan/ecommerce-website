<?php

use App\Support\TranslationCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('translation_key')->unique();
            $table->string('group_name')->nullable()->index();
            $table->text('english_text');
            $table->text('bangla_text')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        $timestamp = now();

        DB::table('translations')->insert(array_map(
            static fn (array $translation) => [
                ...$translation,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            TranslationCatalog::defaults(),
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
