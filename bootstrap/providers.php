<?php

use App\Providers\AppServiceProvider;

return array_values(array_filter([
    AppServiceProvider::class,
    class_exists(\Laravel\Socialite\SocialiteServiceProvider::class)
        ? \Laravel\Socialite\SocialiteServiceProvider::class
        : null,
]));
