# cPanel Deployment Guide

This project is deployable on cPanel, but a few production steps still need to happen.

## Server requirements

- PHP `8.2` or newer
- MySQL or MariaDB database
- PHP extensions commonly required by Laravel: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`
- Apache `mod_rewrite`

## Important app notes

- The frontend builds successfully with `npm run build`.
- The app includes root and `public/` `.htaccess` files for Apache hosting.
- The app uses the database queue for background work and database notifications.
- The app now includes the missing `notifications` table migration required by Laravel's database notification channel.
- Returns/refunds, shipment tracking, and stock movement logs are now part of the operational workflow.

## Before uploading

1. Build production assets locally:

```bash
npm install
npm run build
```

2. Make sure `public/hot` is not uploaded to production.

Laravel uses `public/hot` to detect the Vite dev server. If that file exists on cPanel, production may try to load assets from a local development URL instead of `public/build`.

3. Prepare production environment values:

- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain`
- `APP_KEY`
- MySQL database credentials
- SMTP mail credentials
- Google/Facebook OAuth credentials if social login should be enabled

## Upload structure

Use one of these layouts:

### Option 1: Preferred

Point the domain document root directly to the project's `public/` folder.

### Option 2: Shared-hosting fallback

Upload the whole project above `public_html`, then place the contents of `public/` inside `public_html`.

If you use the fallback layout, update `public_html/index.php` so its paths point to the real app location.

## Required post-upload commands

Run these after the files are on the server:

```bash
php artisan key:generate
php artisan migrate --force
php artisan optimize
```

If the app stores any files on the `public` disk, also run:

```bash
php artisan storage:link
```

## Writable paths

Make sure these are writable by PHP:

- `storage/`
- `bootstrap/cache/`
- `public/uploads/` if admins will upload product, banner, or footer images

## Queue setup

Production currently uses `QUEUE_CONNECTION=database`.

That means you still need one of these:

1. A persistent worker, if your host allows it:

```bash
php artisan queue:work --tries=3 --timeout=90
```

2. A cron-based worker approach, if persistent processes are not allowed.

3. Change production to `QUEUE_CONNECTION=sync` if you want to avoid worker setup and can accept slower request handling for emails/notifications.

Without a worker, order notification emails will stay in the `jobs` table and will not be sent.

If your host supports Supervisor or a similar process manager, a sample worker config is included in `deploy/supervisor/laravel-worker.conf`.

## Recommended production env values

- `SESSION_DRIVER=database`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_HTTP_ONLY=true`
- `SESSION_SAME_SITE=lax`
- `FILESYSTEM_DISK=public`
- `MAIL_MAILER=failover`
- `MAIL_EHLO_DOMAIN=yourdomain.com`

## Final deployment checklist

- `APP_KEY` generated
- `APP_URL` set to the real HTTPS domain
- Database created and migrations run
- Frontend built and `public/build` uploaded
- `public/hot` not uploaded
- `storage/` and `bootstrap/cache/` writable
- Queue strategy chosen
- SMTP configured
- OAuth callback URLs updated if using Google/Facebook login
