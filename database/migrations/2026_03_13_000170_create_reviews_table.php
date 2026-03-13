<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('product_id')->nullable();
            $table->string('product_name');
            $table->string('customer_name');
            $table->unsignedTinyInteger('rating');
            $table->text('comment');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
