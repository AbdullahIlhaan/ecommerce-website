<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->after('id')->unique();
        });

        DB::table('orders')
            ->select(['id', 'created_at'])
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->each(function (object $order): void {
                $dateSegment = $order->created_at
                    ? Carbon::parse($order->created_at)->format('Ymd')
                    : now()->format('Ymd');

                DB::table('orders')
                    ->where('id', $order->id)
                    ->update([
                        'invoice_number' => sprintf(
                            'INV-%s-%s',
                            $dateSegment,
                            strtoupper(substr((string) $order->id, 0, 8)),
                        ),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn('invoice_number');
        });
    }
};
