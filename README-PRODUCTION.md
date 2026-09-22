# COSA NOSTRA — production-oriented backend setup

## Recommended free database for testing
Use Neon PostgreSQL: https://neon.com/

1. Create a free Neon account.
2. Create a PostgreSQL project named `cosa-nostra`.
3. Open **Connect** in the Neon console.
4. Copy the PostgreSQL connection string.
5. It will look like:
   `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`
6. Put that value into Render as the secret environment variable `DATABASE_URL`.

Do not put the URL in GitHub. It contains database credentials.

## Important free-tier limitation
A free database is suitable for development/testing, not a production SLA. Render's free Postgres currently expires after 30 days and has no backups. Neon has a free Postgres plan, but its free resources are limited. For a real public launch with paid tokens, use a paid database tier with backups/recovery and monitor usage.

## Render variables
Set:
- `DATABASE_URL` — Neon connection string
- `REQUIRE_DATABASE=true`
- `APP_URL=https://YOUR-SERVICE.onrender.com`
- Natasha/Peace admin emails and passwords
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CURRENCY`
- Google OAuth variables if used

## Stripe webhook
Configure Stripe to POST to:
`https://YOUR-SERVICE.onrender.com/api/payments/stripe-webhook`

Keep the Stripe secret and webhook signing secret only in Render environment variables.

## Health check
Render should use `/health`. It returns HTTP 200 only when PostgreSQL is reachable.

## Security changes in this build
- Database is required by default; the app fails startup if it is missing.
- Passwords are hashed with scrypt.
- Session tokens are stored as hashes in PostgreSQL.
- Secure, HttpOnly, SameSite cookies are used.
- Security response headers are enabled.
- Origin checks protect cookie-authenticated state-changing API calls.
- Authentication endpoints have per-IP rate limits.
- Stripe fulfillment is transactionally locked and idempotent.
- Moderation reports are stored in PostgreSQL for admin review.
- Admin seed passwords are only used to create missing admin accounts; they do not overwrite existing passwords on every restart.
