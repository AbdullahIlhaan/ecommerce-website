<?php

namespace App\Http\Middleware;

use App\Support\DashboardNavigation;
use App\Support\SocialAuth;
use App\Support\TranslationDictionary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'role' => $request->user()->role,
                    'emailVerifiedAt' => $request->user()->email_verified_at?->toDateTimeString(),
                    'phoneVerifiedAt' => $request->user()->phone_verified_at?->toDateTimeString(),
                    'canAccessAdminPanel' => $request->user()->canAccessAdminPanel(),
                    'isSuperAdmin' => $request->user()->isSuperAdmin(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'socialAuth' => fn () => SocialAuth::share(),
            'navigation' => [
                'dashboard' => fn () => \App\Support\DashboardNavigation::forUser($request->user()),
            ],
            'footerSetting' => \App\Support\DashboardData::footerSetting(\App\Models\FooterSetting::first()),
            'localization' => fn () => [
                'defaultLocale' => config('app.locale', 'en'),
                'availableLocales' => [
                    ['code' => 'en', 'label' => 'English', 'nativeLabel' => 'English'],
                    ['code' => 'bn', 'label' => 'Bangla', 'nativeLabel' => 'বাংলা'],
                ],
                'translations' => Schema::hasTable('translations') ? TranslationDictionary::shared() : [],
            ],
        ];
    }
}
