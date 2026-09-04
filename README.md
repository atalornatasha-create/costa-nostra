# COSA NOSTRA — Render Ready

A server-authoritative multiplayer Mafia game for Render.

## Included
- Custom COSA NOSTRA homepage
- Invitation-only rooms with one-use invite codes
- Worldwide real-time multiplayer through WebSockets
- Server-side Mafia/Nurse/Civilian role assignment
- Night actions, day voting, win conditions and live chat
- Render `render.yaml` with a managed PostgreSQL database
- Persistent invitation codes and completed-game history
- `/health` endpoint for Render health checks

## Deploy on Render
1. Put this folder in a GitHub repository.
2. In Render choose **New → Blueprint**.
3. Select the repository.
4. Render reads `render.yaml` and creates the web service and PostgreSQL database.
5. Set `INVITE_CODES` if you want initial invitation codes, separated by commas.
6. Deploy.

The generated `ADMIN_KEY` is stored as a Render secret. Use it with `POST /api/admin/invites` to create more one-use invitation codes.

## Local run
Requires PostgreSQL and `DATABASE_URL`.

```bash
npm install
npm start
```

Open `http://localhost:8787`.

## Important
Live rooms are intentionally kept in memory for fast WebSocket gameplay. PostgreSQL persists invitation codes and completed-game history. If the web service restarts, active rooms end; players can start a new room with unused invitations.
