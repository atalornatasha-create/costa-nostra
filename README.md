# COSA NOSTRA — Worldwide Multiplayer (Hardened)

A cinematic, server-authoritative Mafia game built for Node.js + WebSockets.

## Included
- 4–14 player rooms
- Single-use invitation codes (persistent when PostgreSQL is configured)
- Exactly 1 Mafia, 1 Nurse, rest Civilians
- Roles are private; public player cards never expose roles or profile details
- Server-controlled night actions, day voting, timers, eliminations and win conditions
- Live chat with input sanitization and bounded room history
- PostgreSQL persistence for invitation codes and completed-game history when `DATABASE_URL` is provided
- Graceful fallback if PostgreSQL is temporarily unavailable at startup
- WebSocket payload limits, HTTP timeouts, message flood protection and stale-room cleanup
- Graceful shutdown handling for hosting restarts
- Cinematic overlays, animated rain/stars/moon/skyline and procedural browser audio
- Sound fallback for browsers without Web Audio support
- Responsive mobile UI and reduced-risk client message parsing
- Render-ready `render.yaml`

## Local
```bash
npm install
npm start
```
Open `http://localhost:8787`.

## Environment
- `PORT` — supplied by hosting; defaults to 8787 locally.
- `PHASE_MS` — phase duration in milliseconds; safely clamped to 15 seconds–30 minutes.
- `INVITE_CODES` — comma-separated initial invitation codes.
- `ADMIN_KEY` — key for `POST /api/admin/invites`.
- `DATABASE_URL` — optional PostgreSQL connection string.

## Render
Use the included `render.yaml` or create a Node web service. The service runs `npm start`, listens on the injected `PORT`, and exposes `/health`. PostgreSQL is optional; if you want persistent invitations/history, attach a PostgreSQL database and provide `DATABASE_URL`.

## Replit
Import the project, run `npm install`, then `npm start`. Use the app's public URL for players.

## Important behavior
Active rooms are kept in server memory, so an ordinary process restart ends live rooms. Persistent invitation records and completed history survive when PostgreSQL is configured. A room with fewer than 4 players after a disconnect is closed safely rather than continuing in an invalid state.

## Administrator accounts

The `/admin` portal supports:
- administrator email + password login
- email password-reset links (SMTP required)
- Google OAuth sign-in and Google-account linking
- administrator social-profile links (Instagram, Facebook, TikTok, X)
- database-backed sessions and one-time reset tokens

Social profile links are profile/contact links only; they are intentionally **not** accepted as password-reset credentials. Google and verified email are the recovery methods.

### Required environment variables

For email recovery configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `APP_URL`.

For Google sign-in configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` (for example `https://YOUR-DOMAIN/auth/google/callback`). The Google OAuth consent screen should use the same authorized redirect URI.

For the first administrator, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` plus the `ADMIN_*` social fields. Never commit real secrets to GitHub.
