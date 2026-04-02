<?php

namespace App\Support;

class SocialAuth
{
    private const PROVIDERS = [
        'google' => [
            'label' => 'Google',
        ],
        'facebook' => [
            'label' => 'Facebook',
        ],
    ];

    /**
     * @return array{enabled: bool, providers: array<int, array{key: string, label: string, redirectUrl: string}>}
     */
    public static function share(): array
    {
        $providers = self::availableProviders();

        return [
            'enabled' => $providers !== [],
            'providers' => $providers,
        ];
    }

    public static function supports(string $provider): bool
    {
        return array_key_exists($provider, self::PROVIDERS);
    }

    public static function label(string $provider): string
    {
        return self::PROVIDERS[$provider]['label'] ?? ucfirst($provider);
    }

    public static function providerAvailable(string $provider): bool
    {
        if (! self::supports($provider) || ! self::socialiteAvailable()) {
            return false;
        }

        $config = config("services.{$provider}");

        return is_array($config)
            && filled($config['client_id'] ?? null)
            && filled($config['client_secret'] ?? null)
            && filled($config['redirect'] ?? null);
    }

    public static function unavailableMessage(string $provider): string
    {
        return self::label($provider).' sign-in is not available right now.';
    }

    /**
     * @return array<int, array{key: string, label: string, redirectUrl: string}>
     */
    private static function availableProviders(): array
    {
        $providers = [];

        foreach (array_keys(self::PROVIDERS) as $provider) {
            if (! self::providerAvailable($provider)) {
                continue;
            }

            $providers[] = [
                'key' => $provider,
                'label' => self::label($provider),
                'redirectUrl' => route('social.redirect', ['provider' => $provider]),
            ];
        }

        return $providers;
    }

    private static function socialiteAvailable(): bool
    {
        return class_exists(\Laravel\Socialite\Facades\Socialite::class);
    }
}
