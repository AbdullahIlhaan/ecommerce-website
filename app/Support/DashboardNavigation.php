<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class DashboardNavigation
{
    public static function forUser(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        return collect(self::groups())
            ->map(function (array $group) use ($user) {
                $items = collect($group['items'])
                    ->filter(fn (array $item) => $user->hasRole(...$item['roles']))
                    ->map(fn (array $item) => [
                        'title' => $item['title'],
                        'url' => $item['url'],
                        'icon' => $item['icon'],
                        'exact' => $item['exact'],
                    ])
                    ->values()
                    ->all();

                return [
                    'label' => $group['label'],
                    'items' => $items,
                ];
            })
            ->filter(fn (array $group) => ! empty($group['items']))
            ->values()
            ->all();
    }

    private static function groups(): Collection
    {
        return collect([
            [
                'label' => 'Overview',
                'items' => [
                    self::item(
                        title: 'Dashboard',
                        routeName: 'dashboard',
                        icon: 'LayoutDashboard',
                        roles: [UserRole::SuperAdmin, UserRole::Admin, UserRole::Moderator],
                        exact: true,
                    ),
                ],
            ],
            [
                'label' => 'Catalog',
                'items' => [
                    self::item('Products', 'products.index', 'Package', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Categories', 'categories.index', 'FolderTree', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Hero Banners', 'hero-banners.index', 'Images', [UserRole::SuperAdmin, UserRole::Admin]),
                    ...self::flashDealItems(),
                    self::item('Brands', 'brands.index', 'Award', [UserRole::SuperAdmin, UserRole::Admin]),
                ],
            ],
            [
                'label' => 'Commerce',
                'items' => [
                    self::item('Customers', 'customers.index', 'Users', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Orders', 'orders.index', 'ShoppingCart', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Returns', 'return-requests.index', 'RotateCcw', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Coupons', 'coupons.index', 'Ticket', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Reviews', 'reviews.index', 'Star', [UserRole::SuperAdmin, UserRole::Admin, UserRole::Moderator]),
                ],
            ],
            [
                'label' => 'Access',
                'items' => [
                    self::item('Users', 'users.index', 'Shield', [UserRole::SuperAdmin]),
                    self::item('Account', 'account', 'User', [UserRole::SuperAdmin, UserRole::Admin, UserRole::Moderator, UserRole::Customer], exact: true),
                ],
            ],
            [
                'label' => 'Settings',
                'items' => [
                    self::item('Footer Settings', 'footer-settings.index', 'Settings', [UserRole::SuperAdmin, UserRole::Admin]),
                    self::item('Content Pages', 'content-pages.index', 'FileText', [UserRole::SuperAdmin, UserRole::Admin]),
                    ...self::translationItems(),
                ],
            ],
        ]);
    }

    /**
     * @param  array<int, UserRole|string>  $roles
     * @return array{title: string, url: string, icon: string, roles: array<int, UserRole|string>, exact: bool}
     */
    private static function item(string $title, string $routeName, string $icon, array $roles, bool $exact = false): array
    {
        return [
            'title' => $title,
            'url' => route($routeName, absolute: false),
            'icon' => $icon,
            'roles' => $roles,
            'exact' => $exact,
        ];
    }

    /**
     * @return array<int, array{title: string, url: string, icon: string, roles: array<int, UserRole|string>, exact: bool}>
     */
    private static function translationItems(): array
    {
        if (! Schema::hasTable('translations')) {
            return [];
        }

        return [
            self::item('Translations', 'translations.index', 'Languages', [UserRole::SuperAdmin, UserRole::Admin]),
        ];
    }

    /**
     * @return array<int, array{title: string, url: string, icon: string, roles: array<int, UserRole|string>, exact: bool}>
     */
    private static function flashDealItems(): array
    {
        if (! Schema::hasTable('flash_deals')) {
            return [];
        }

        return [
            self::item('Flash Deals', 'flash-deals.index', 'Zap', [UserRole::SuperAdmin, UserRole::Admin]),
        ];
    }
}
