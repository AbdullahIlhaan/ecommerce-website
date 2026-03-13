<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Moderator = 'moderator';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::Moderator => 'Moderator',
            self::Customer => 'Customer',
        };
    }

    public function canAccessAdminPanel(): bool
    {
        return match ($this) {
            self::SuperAdmin, self::Admin, self::Moderator => true,
            self::Customer => false,
        };
    }

    public static function values(): array
    {
        return array_map(
            static fn (self $role) => $role->value,
            self::cases(),
        );
    }

    public static function options(): array
    {
        return array_map(
            static fn (self $role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ],
            self::cases(),
        );
    }
}
