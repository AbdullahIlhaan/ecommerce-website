<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Support\SocialAuth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class SocialAuthController extends Controller
{
    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(SocialAuth::supports($provider), 404);

        if (! SocialAuth::providerAvailable($provider)) {
            return $this->unavailableProviderResponse($provider);
        }

        return $this->driver($provider)->redirect();
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        abort_unless(SocialAuth::supports($provider), 404);

        if (! SocialAuth::providerAvailable($provider)) {
            return $this->unavailableProviderResponse($provider);
        }

        try {
            $providerUser = $this->driver($provider)->user();
        } catch (Throwable) {
            return to_route('login')->with('error', 'Unable to authenticate with '.SocialAuth::label($provider).'.');
        }

        $account = SocialAccount::query()
            ->where('provider_name', $provider)
            ->where('provider_user_id', $providerUser->getId())
            ->first();

        if ($account !== null) {
            Auth::login($account->user);
            $request->session()->regenerate();

            return to_route('home');
        }

        $email = $providerUser->getEmail() ?: sprintf('%s_%s@example.invalid', $provider, $providerUser->getId());

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $providerUser->getName() ?: ucfirst($provider).' User',
                'role' => UserRole::Customer->value,
                'password' => bin2hex(random_bytes(20)),
                'email_verified_at' => $providerUser->getEmail() ? now() : null,
            ],
        );

        $user->socialAccounts()->updateOrCreate(
            [
                'provider_name' => $provider,
                'provider_user_id' => $providerUser->getId(),
            ],
            [
                'avatar' => $providerUser->getAvatar(),
            ],
        );

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('home');
    }

    private function driver(string $provider)
    {
        abort_unless(SocialAuth::supports($provider), 404);

        $driver = \Laravel\Socialite\Facades\Socialite::driver($provider);

        if ($provider === 'google') {
            return $driver->scopes(['openid', 'profile', 'email']);
        }

        if ($provider === 'facebook') {
            // public_profile is required by Meta Graph API to get name & avatar.
            // stateless() avoids OAuth state/session mismatch errors with Facebook.
            return $driver->scopes(['public_profile', 'email'])->stateless();
        }

        return $driver;
    }

    private function unavailableProviderResponse(string $provider): RedirectResponse
    {
        return to_route('login')->with('error', SocialAuth::unavailableMessage($provider));
    }
}
