<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_carrier')->nullable()->after('payment_method');
            $table->string('tracking_number')->nullable()->after('shipping_carrier');
            $table->timestamp('estimated_delivery_at')->nullable()->after('tracking_number');
            $table->timestamp('shipped_at')->nullable()->after('estimated_delivery_at');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->text('internal_notes')->nullable()->after('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_carrier',
                'tracking_number',
                'estimated_delivery_at',
                'shipped_at',
                'delivered_at',
                'internal_notes',
            ]);
        });
    }
};
