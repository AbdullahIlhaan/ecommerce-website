<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'role' => UserRole::SuperAdmin->value,
        ]);
    }

    public function test_super_admin_can_perform_user_crud(): void
    {
        $this->actingAs($this->superAdmin)->post('/users', [
            'name' => 'Module Admin',
            'email' => 'module-admin@example.com',
            'phone' => '+8801711111111',
            'role' => UserRole::Admin->value,
            'password' => 'password123',
        ])->assertRedirect(route('users.index'));

        $user = User::query()->where('email', 'module-admin@example.com')->firstOrFail();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => UserRole::Admin->value]);

        $this->actingAs($this->superAdmin)->put("/users/{$user->id}", [
            'name' => 'Module Moderator',
            'email' => 'module-admin@example.com',
            'phone' => '+8801711111111',
            'role' => UserRole::Moderator->value,
            'password' => '',
        ])->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Module Moderator', 'role' => UserRole::Moderator->value]);

        $this->actingAs($this->superAdmin)->delete("/users/{$user->id}")
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_super_admin_cannot_delete_own_account(): void
    {
        $this->actingAs($this->superAdmin)->delete("/users/{$this->superAdmin->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $this->superAdmin->id]);
    }
}
