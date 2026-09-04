# Hosting Cosa Nostra

## Use Railway, and use it for everything

One host, one URL, no split setup. `server.js` now serves the game page as
well as the multiplayer relay, so a single Railway deployment gives you
`https://your-app.up.railway.app` for the game and `wss://` back to the same
host for the room.

Netlify cannot do this on its own. It serves static files beautifully, but it
has no long-running process, so it cannot hold a WebSocket open. If you deploy
to Netlify you get the single-player game and nothing else, and you would still
need Railway alongside it for multiplayer. Two hosts, two dashboards, one
extra cross-origin problem to debug — no reason for it here.

If you genuinely never want multiplayer, Netlify is the simpler answer: drag
`mafia-simulator.html` onto the Netlify drop page, rename it `index.html`,
done in thirty seconds. Everything below assumes you do want multiplayer.

## Deploying to Railway

What goes in the repository: `server.js`, `package.json`,
`mafia-simulator.html`. Not `node_modules`.

1. Push those three files to a GitHub repository.
2. On railway.app: New Project, then Deploy from GitHub repo, and pick it.
3. Nothing to configure. Railway reads `package.json`, runs `npm install`,
   then `npm start`, and injects the port through the environment — the
   server already reads it.
4. Settings, then Networking, then Generate Domain. That URL is your game.

To deploy without GitHub, install the Railway CLI, run `railway login`,
`railway init`, then `railway up` from the folder holding the three files.

`/health` returns `ok` if you want a monitor to poll something cheap.

## Local run

```
npm install
npm start        # http://localhost:8787
```

## Cost and limits

Railway's free trial credit runs a project this small for a while; after that
it is usage-based and a relay that idles most of the day costs very little.
Railway sleeps inactive projects on the lower plans — the first visit after a
quiet spell takes a few seconds to wake, which players will notice as a slow
first load, not as a broken game.

## What I could not verify

The sandbox I built this in does not allow opening a listening port, so I
confirmed the code parses, the `ws` dependency installs and resolves, and the
game file sits where the server expects it — but I could not boot the server
and load the page myself. Run it locally once before you deploy.

## Security, still worth knowing

- Railway terminates TLS for you, so the page is https and the socket is wss.
  Running `server.js` directly on a public IP would be plain http/ws instead.
- The only door check is the invitation code. No accounts, no passwords — just
  a length cap, a flood guard, and a 14-seat limit per table.
- The server serves exactly one file and nothing else; any other path 404s.
- Everything clients send is treated as text and stripped of control characters
  and angle brackets before being forwarded.

## Two limits hosting does not fix

- The invitation ledger and the admin check live in browser storage. Anyone
  with developer tools can edit their own copy. Real enforcement needs the
  server to own the ledger.
- The game history archive keeps roles and secrets in plain browser storage on
  whichever machine played. On a shared computer, burn it from the admin screen.
