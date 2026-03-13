<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_super_admin_sees_users_menu_item_in_dashboard_navigation(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::SuperAdmin->value,
        ]);

        $this->actingAs($user)
            ->get('/account')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account')
                ->where('navigation.dashboard.3.label', 'Access')
                ->where('navigation.dashboard.3.items.0.title', 'Users')
                ->where('navigation.dashboard.3.items.0.url', '/users')
                ->where('navigation.dashboard.3.items.1.title', 'Account'));
    }

    public function test_admin_dashboard_navigation_does_not_include_users_menu_item(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Admin->value,
        ]);

        $this->actingAs($user)
            ->get('/account')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account')
                ->where('navigation.dashboard.3.label', 'Access')
                ->has('navigation.dashboard.3.items', 1)
                ->where('navigation.dashboard.3.items.0.title', 'Account')
                ->missing('navigation.dashboard.3.items.1'));
    }
}
