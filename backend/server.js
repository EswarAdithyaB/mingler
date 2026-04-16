require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// cors origin function — MUST call callback(err, allowed) — never return a value
const allowedOrigin = (origin, callback) => {
  // no origin = same-origin request or curl
  if (!origin) return callback(null, true);

  // production: only the explicit domain
  if (process.env.CORS_ORIGIN) {
    return callback(null, origin === process.env.CORS_ORIGIN);
  }

  // development: accept any localhost port
  const ok = /^http:\/\/localhost(:\d+)?$/.test(origin);
  return callback(null, ok);
};

// ── Socket.io ────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (every hit, before routes) ────────────
app.use((req, _res, next) => {
  console.log(`\n➡️  ${req.method} ${req.path}  origin="${req.headers.origin || 'none'}"  body=${JSON.stringify(req.body)}`);
  next();
});

// ── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Minglr API',
    version: '1.0.0',
    db: 'Supabase (PostgreSQL)',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',  require('./src/routes/auth.routes'));
app.use('/api/zones', require('./src/routes/zone.routes'));
app.use('/api/vibes', require('./src/routes/vibe.routes'));
app.use('/api/games', require('./src/routes/game.routes'));

// ── Socket Events ────────────────────────────────────────
require('./src/sockets')(io);

// ── Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🌐 Minglr API running on :${PORT}      ║
║   📡 Socket.io ready                 ║
║   🗄️  Supabase (PostgreSQL)          ║
╚══════════════════════════════════════╝`);

  // Confirm env vars are present
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwtSec = process.env.JWT_SECRET;
  console.log(`🔑 ENV check:`);
  console.log(`   SUPABASE_URL             = ${sbUrl   ? sbUrl   : '❌ MISSING'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY = ${sbKey  ? '✅ set (' + sbKey.slice(0,12) + '…)' : '❌ MISSING'}`);
  console.log(`   JWT_SECRET                = ${jwtSec ? '✅ set'  : '❌ MISSING'}`);
});

module.exports = { app, server, io };
