<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flash_deals', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('flash_deal_product', function (Blueprint $table) {
            $table->string('flash_deal_id');
            $table->string('product_id');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->primary(['flash_deal_id', 'product_id']);
            $table->foreign('flash_deal_id')->references('id')->on('flash_deals')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_deal_product');
        Schema::dropIfExists('flash_deals');
    }
};
