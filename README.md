# COSA NOSTRA — Universal Token App

COSA NOSTRA is a worldwide cinematic Mafia game delivered as an installable PWA-style app.

## Player access
- Players create an account with email, password, private real name, and game username.
- New accounts receive exactly 3 free universal game tokens.
- One universal token is consumed when entering a game table.
- No invitation codes are required for player access.
- Real names stay private from other players; players see game usernames only.
- Players can request additional tokens from the administrators.

## Admin token controls
- Natasha and Peace have separate administrator accounts.
- Each administrator can set the universal token price.
- Administrators can review pending token requests and grant tokens.
- The current build intentionally does not process card/mobile-money payments itself. Token purchases are manually approved by the administrators. A payment provider can be integrated later.

## App installation
The public game includes a web-app manifest and service worker. On a supported phone/browser, use the browser's **Add to Home Screen / Install App** action.

## Production requirements
- Node.js 18+
- PostgreSQL via `DATABASE_URL`
- HTTPS is required for secure player/admin cookies and production WebSockets.

## Run
```bash
npm install
npm start
```


## Online token payments
The app supports Stripe Checkout for automatic token purchases. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`, and `APP_URL`. Create a Stripe webhook for `/api/payments/stripe-webhook` and subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. The server creates the checkout session, stores a pending purchase, verifies the returning session, and fulfills the purchase idempotently from the webhook/verification path. Never put the Stripe secret key in frontend code.

Stripe availability and merchant eligibility vary by country and business model; COSA NOSTRA must be approved by the chosen payment provider before live payments are enabled.
