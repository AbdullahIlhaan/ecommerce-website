<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SocialAuthAvailabilityTest extends TestCase
{
    public function test_login_page_only_shares_available_social_providers(): void
    {
        $this->disableSocialProviders();

        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Login')
                ->where('socialAuth.enabled', false)
                ->has('socialAuth.providers', 0));
    }

    public function test_register_page_only_shares_available_social_providers(): void
    {
        $this->disableSocialProviders();

        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Register')
                ->where('socialAuth.enabled', false)
                ->has('socialAuth.providers', 0));
    }

    public function test_unavailable_social_provider_redirects_back_to_login(): void
    {
        $this->disableSocialProviders();

        $this->get('/auth/google/redirect')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Google sign-in is not available right now.');
    }

    private function disableSocialProviders(): void
    {
        foreach (['google', 'facebook'] as $provider) {
            config()->set("services.{$provider}.client_id", null);
            config()->set("services.{$provider}.client_secret", null);
            config()->set("services.{$provider}.redirect", null);
        }
    }
}
