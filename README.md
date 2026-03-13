# Ecommerce Dashboard

Laravel 12 + Inertia + React admin dashboard with seeded ecommerce data.

## Stack

- PHP 8.2+
- Composer
- Node.js 20+
- Vite
- SQLite by default for local development

## Local Setup

```sh
composer setup
```

That command will:

- install PHP dependencies
- create `.env` if needed
- generate the app key
- create `database/database.sqlite`
- run migrations
- install Node dependencies
- build frontend assets

## Run The App

Use the full development stack:

```sh
composer dev
```

Or run the services separately:

```sh
php artisan serve
npm run dev
```

Open `http://127.0.0.1:8000`.

## Database

The default local setup uses SQLite at `database/database.sqlite`.

To reset and reseed sample dashboard data:

```sh
php artisan migrate:fresh --seed
```

## Useful Commands

```sh
npm run build
npm test
npm run lint
```

## Troubleshooting

- If `php artisan ...` fails before Laravel boots, check that `php -v` points to a working PHP 8.2+ install.
- If you want PostgreSQL instead of SQLite, update `.env` with the correct `DB_*` values and rerun migrations.
