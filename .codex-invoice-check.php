<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$order = App\Models\Order::query()->where('id', '319d8980-bb6f-4640-9589-725545fab141')->first();
$footer = App\Support\DashboardData::footerSetting(App\Models\FooterSetting::first());
echo ($order?->invoice_number ?? 'not-found') . PHP_EOL;
echo ($footer['address'] ?? '') . PHP_EOL;
echo ($footer['phone'] ?? '') . PHP_EOL;
echo ($footer['email'] ?? '') . PHP_EOL;
