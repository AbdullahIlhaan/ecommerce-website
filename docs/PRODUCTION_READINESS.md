# Production Readiness Checklist

This file focuses on the non-payment, non-courier launch work for the project.

## Environment

- Use `.env.production` as the deployment baseline.
- Keep `APP_ENV=production`.
- Keep `APP_DEBUG=false`.
- Set a real `APP_URL` using HTTPS.
- Generate and store a real `APP_KEY`.
- Use `SESSION_DRIVER=database` in production.
- Use `SESSION_SECURE_COOKIE=true`.
- Set `SESSION_DOMAIN=.yourdomain.com` if the site uses subdomains.

## Mail

- Set real SMTP credentials:
  - `MAIL_HOST`
  - `MAIL_PORT`
  - `MAIL_USERNAME`
  - `MAIL_PASSWORD`
  - `MAIL_FROM_ADDRESS`
  - `MAIL_FROM_NAME`
- Production now defaults to `MAIL_MAILER=failover`, which tries SMTP first and falls back to logging if SMTP fails.
- Verify outbound mail with:

```bash
php artisan tinker
```

Then send a quick mail notification or password reset in staging before launch.

## Queue

- Production uses `QUEUE_CONNECTION=database`.
- Run migrations so `jobs`, `failed_jobs`, and `notifications` tables exist.
- Start a worker with a process manager.

Recommended worker command:

```bash
php artisan queue:work --queue=default --tries=3 --timeout=90 --sleep=3
```

## Storage

- Production is prepared for `FILESYSTEM_DISK=public`.
- Run:

```bash
php artisan storage:link
```

- Confirm these writable paths:
  - `storage/`
  - `bootstrap/cache/`
  - `public/uploads/`

## Operations QA

- Place a real test order.
- Confirm stock deduction.
- Open the invoice page.
- Update the order from admin.
- Add shipment carrier and tracking number.
- Submit a return/refund request from the customer-facing side.
- Approve or reject the return request from admin.
- Confirm restock movement is logged when enabled.

## Launch QA

- Test on mobile storefront.
- Test on desktop storefront.
- Test admin image uploads.
- Test login, register, email verification, and phone auth.
- Test footer settings, content pages, and notification bell.
