<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_zone')->nullable()->after('payment_status');
            $table->decimal('delivery_charge', 10, 2)->default(0)->after('delivery_zone');
            $table->string('delivery_city')->nullable()->after('delivery_charge');
            $table->text('delivery_address')->nullable()->after('delivery_city');
            $table->string('delivery_location_label')->nullable()->after('delivery_address');
            $table->decimal('delivery_latitude', 10, 7)->nullable()->after('delivery_location_label');
            $table->decimal('delivery_longitude', 10, 7)->nullable()->after('delivery_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_zone',
                'delivery_charge',
                'delivery_city',
                'delivery_address',
                'delivery_location_label',
                'delivery_latitude',
                'delivery_longitude',
            ]);
        });
    }
};
