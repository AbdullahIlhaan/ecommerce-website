<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialAuthController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['google', 'facebook'];

    public function redirect(string $provider): RedirectResponse
    {
        return $this->driver($provider)->redirect();
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        try {
            $providerUser = $this->driver($provider)->user();
        } catch (Throwable) {
            return to_route('login')->with('error', 'Unable to authenticate with '.ucfirst($provider).'.');
        }

        $account = SocialAccount::query()
            ->where('provider_name', $provider)
            ->where('provider_user_id', $providerUser->getId())
            ->first();

        if ($account !== null) {
            Auth::login($account->user);
            $request->session()->regenerate();

            return to_route($account->user->canAccessAdminPanel() ? 'dashboard' : 'account');
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

        return to_route($user->canAccessAdminPanel() ? 'dashboard' : 'account');
    }

    private function driver(string $provider)
    {
        abort_unless(in_array($provider, self::SUPPORTED_PROVIDERS, true), 404);

        $driver = Socialite::driver($provider);

        if ($provider === 'google') {
            return $driver->scopes(['openid', 'profile', 'email']);
        }

        return $driver->scopes(['email']);
    }
}
