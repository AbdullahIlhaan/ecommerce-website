<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#c32c30">
        <meta name="background-color" content="#f7f8fb">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Future-BD">
        <meta name="format-detection" content="telephone=no">
        <link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png">
        <link rel="icon" href="/images/logofbd.jpeg">
        <link rel="shortcut icon" href="/images/logofbd.jpeg">
        <title inertia>{{ config('app.name', 'Future-BD') }}</title>
        <script>
            (() => {
                const saved = localStorage.getItem('dashboard-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.dataset.theme = theme;
            })();
        </script>
        @viteReactRefresh
        @vite(['src/index.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="min-h-screen bg-background text-foreground">
        @inertia
    </body>
    </html>
