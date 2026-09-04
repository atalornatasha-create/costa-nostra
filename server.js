/* Cosa Nostra - optional multiplayer relay
 *
 * Real multiplayer cannot live inside a single HTML file: browsers cannot
 * accept incoming connections, so a shared room needs a process that both
 * players can reach. This is that process, kept deliberately small.
 *
 * Run it:
 *     npm init -y && npm install ws@8.18.0
 *     node server.js            # listens on port 8787
 *
 * The game file stays fully playable offline against the house AI. This
 * relay only matters if you want several humans at the same table.
 *
 * SECURITY NOTES - read before putting this on the open internet:
 *   - Traffic is plain ws:// here. Put it behind a TLS terminator
 *     (nginx / Caddy) and use wss:// for anything public.
 *   - The only door check is the invitation code, and codes are handed out
 *     by whoever runs the server. There is no account system, no password,
 *     no rate limiting beyond the basics below.
 *   - Anything a client sends is untrusted. This relay never evaluates it;
 *     it forwards text fields only, capped in length.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8787);
const MAX_ROOM = 14;
const MAX_TEXT = 400;
const MAX_MSGS_PER_10S = 25;

/** roomId -> { code, players: Map<id, {ws, name, alive}> } */
const rooms = new Map();
let nextId = 1;

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').slice(0, max || MAX_TEXT);
}

function send(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function broadcast(room, obj, exceptId) {
  for (const [id, p] of room.players) if (id !== exceptId) send(p.ws, obj);
}

function roster(room) {
  return [...room.players].map(([id, p]) => ({ id, name: p.name, alive: p.alive }));
}

/* The relay also serves the game itself, so one deployment gives you one URL:
   the page loads over https and the room connects back over wss on the same
   host. Nothing else is served - only this single file. */
const GAME_FILE = path.join(__dirname, 'mafia-simulator.html');

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok\n');
    return;
  }
  if (url !== '/' && url !== '/index.html') {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found\n');
    return;
  }
  fs.readFile(GAME_FILE, (err, body) => {
    if (err) {
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end('mafia-simulator.html is missing next to server.js\n');
      return;
    }
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    });
    res.end(body);
  });
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const me = { id: nextId++, room: null, window: [], joined: false };

  ws.on('message', (raw) => {
    // crude flood guard
    const now = Date.now();
    me.window = me.window.filter((t) => now - t < 10000);
    me.window.push(now);
    if (me.window.length > MAX_MSGS_PER_10S) { ws.close(1008, 'too chatty'); return; }

    let msg;
    try { msg = JSON.parse(String(raw).slice(0, 4000)); } catch (e) { return; }
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'join') {
      if (me.joined) return;
      const roomId = clean(msg.room, 40) || 'table';
      const code = clean(msg.code, 40);
      if (!code) { send(ws, { type: 'refused', why: 'An invitation code is required.' }); return; }

      let room = rooms.get(roomId);
      if (!room) { room = { code, players: new Map() }; rooms.set(roomId, room); }
      if (room.code !== code) { send(ws, { type: 'refused', why: 'That code does not open this table.' }); return; }
      if (room.players.size >= MAX_ROOM) { send(ws, { type: 'refused', why: 'The table is full.' }); return; }

      me.room = roomId;
      me.joined = true;
      room.players.set(me.id, { ws, name: clean(msg.name, 24) || ('Guest ' + me.id), alive: true });
      send(ws, { type: 'welcome', you: me.id, room: roomId, players: roster(room) });
      broadcast(room, { type: 'players', players: roster(room) }, null);
      return;
    }

    const room = me.joined && rooms.get(me.room);
    if (!room) return;

    switch (msg.type) {
      case 'say':
        broadcast(room, { type: 'say', from: me.id, text: clean(msg.text) }, null);
        break;
      case 'vote':
        broadcast(room, { type: 'vote', from: me.id, target: Number(msg.target) || 0 }, null);
        break;
      case 'night':
        // private move: only the sender's own client and the host tally see it
        broadcast(room, { type: 'night', from: me.id, act: clean(msg.act, 16), target: Number(msg.target) || 0 }, me.id);
        break;
      case 'state':
        // the host client mirrors authoritative state to everyone else
        broadcast(room, { type: 'state', payload: msg.payload }, me.id);
        break;
      case 'dead':
        {
          const p = room.players.get(me.id);
          if (p) p.alive = false;
          broadcast(room, { type: 'players', players: roster(room) }, null);
        }
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    const room = rooms.get(me.room);
    if (!room) return;
    room.players.delete(me.id);
    if (!room.players.size) rooms.delete(me.room);
    else broadcast(room, { type: 'players', players: roster(room) }, null);
  });
});

server.listen(PORT, () => {
  console.log('Cosa Nostra relay listening on ws://localhost:' + PORT);
});
