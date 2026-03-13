<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(DashboardSeeder::class);

        User::query()->updateOrCreate(
            ['email' => 'ilhaanazra@gmail.com'],
            [
                'name' => 'Ilhaan Siddique',
                'phone' => '01731492117',
                'role' => UserRole::SuperAdmin->value,
                'password' => 'password',
                'email_verified_at' => null,
                'phone_verified_at' => null,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'phone' => '+1555000101',
                'role' => UserRole::Admin->value,
                'password' => 'password',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'moderator@example.com'],
            [
                'name' => 'Moderator User',
                'phone' => '+1555000102',
                'role' => UserRole::Moderator->value,
                'password' => 'password',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Customer User',
                'phone' => '+1555000103',
                'role' => UserRole::Customer->value,
                'password' => 'password',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
        );
    }
}
