require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

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
╚══════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
