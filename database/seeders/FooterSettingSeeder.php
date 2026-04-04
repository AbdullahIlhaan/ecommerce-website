<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FooterSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (\App\Models\FooterSetting::query()->exists()) {
            return;
        }

        \App\Models\FooterSetting::query()->create([
            'logo_text' => 'FutureBD',
            'description' => 'The platform to get products from global marketplaces to Bangladesh. You can pay product price in Bangladeshi Taka (BDT).',
            'address' => 'Plot 1020, Mirpur DOHS, Dhaka.',
            'phone' => '+88 09666 78 3333',
            'email' => 'support@futurebd.com', 
            'copyright' => '© 2018-2026 FutureBD. All rights reserved.',
            'payment_methods' => [
                ['name' => 'bKash', 'image_path' => null],
                ['name' => 'VISA', 'image_path' => null],
            ],
            'social_links' => [
                ['platform' => 'Facebook', 'url' => 'https://facebook.com/futurebd'],
            ],
        ]);
    }
}
