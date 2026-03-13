<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_the_dashboard(): void
    {
        $this->get('/dashboard')
            ->assertRedirect('/login');
    }

    public function test_super_admin_can_access_user_management(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::SuperAdmin->value,
        ]);

        $this->actingAs($user)
            ->get('/users')
            ->assertOk();
    }

    public function test_customer_cannot_access_dashboard_routes(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Customer->value,
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertForbidden();
    }
}
