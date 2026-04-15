# Minglr 🌐

> **Your Zone. Your Vibe. Your World.**
> A café-bound social app for connecting strangers in the same space.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Standalone components, Signals) |
| Backend | Node.js + Express.js |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Styling | SCSS with CSS Variables |

---

## Features

- **🗺️ Geo-fenced Zones** — Discover and join zones within your radius
- **🌌 Virtual Lounge** — See who's in your zone with interactive avatars
- **💬 Vibe Feed / Confession Wall** — Post vibes, confessions, shoutouts, questions
- **🎮 Games Lobby** — Ludo, Truth or Dare, Quiz, Word Chain
- **👥 Connections** — Connect with people nearby based on vibe match
- **⚙️ Settings** — Anonymous mode, detection radius, notification controls

---

## Project Structure

```
mingler/
├── frontend/               # Angular 17 app (mobile-first)
│   └── src/
│       ├── app/
│       │   ├── core/       # Services, models
│       │   └── features/   # Auth, Map, Zone, Vibes, Games, Connections, Settings
│       └── styles/         # Global SCSS theme
└── backend/                # Node.js + Express API
    ├── server.js            # Entry point
    └── src/
        ├── models/          # Mongoose schemas
        ├── routes/          # REST API routes
        ├── middleware/      # JWT auth
        └── sockets/         # Socket.io events
```

---

## Getting Started

### Backend

```bash
cd backend
cp .env .env      # Fill in your values
npm install
npm run dev               # Starts on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm start                 # Starts on http://localhost:4200
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/zones/nearby?lat=&lng=&radius=` | Find nearby zones |
| POST | `/api/zones` | Create a zone |
| POST | `/api/zones/:id/join` | Join a zone |
| POST | `/api/zones/:id/leave` | Leave a zone |
| GET | `/api/vibes/:zoneId` | Get zone vibes |
| POST | `/api/vibes/:zoneId` | Post a vibe |
| POST | `/api/vibes/:id/react` | React to a vibe |
| GET | `/api/games/:zoneId` | Get zone games |
| POST | `/api/games/:zoneId` | Create a game |
| POST | `/api/games/:id/join` | Join a game |

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `zone:join` | Client → Server | Join a zone room |
| `zone:user_joined` | Server → Client | User joined broadcast |
| `vibe:post` | Client → Server | Post a vibe |
| `vibe:new` | Server → Client | New vibe broadcast |
| `game:invite` | Client → Server | Invite player to game |
| `game:invite_received` | Server → Client | Game invite notification |
| `connect_request` | Client → Server | Send connection request |
