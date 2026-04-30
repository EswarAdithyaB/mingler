# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Start Commands

### Backend (Node.js + Express + Socket.io)
```bash
cd backend
npm install
npm run dev                    # Start with nodemon (watches changes, http://localhost:3000)
npm run test                   # Run tests with Jest
npm start                      # Start in production mode
```

### Frontend (Angular 17)
```bash
cd frontend
npm install
npm start                      # Dev server on http://localhost:4200 with proxy to backend
npm run build                  # Production build to dist/minglr
npm run test                   # Run Jasmine tests with Karma
npm run watch                  # Build in watch mode (development)
```

### Health Check
Navigate to `http://localhost:3000/health` to verify the backend is running.

---

## Architecture Overview

### Backend Architecture

**Core Stack:**
- **Express.js** — REST API server
- **Socket.io** — Real-time bidirectional events (WebSocket + polling fallback)
- **Supabase (PostgreSQL)** — Database
- **JWT** — Authentication token-based
- **Nodemon** — Development hot-reload

**Request Flow:**
1. Client sends HTTP requests to `/api/*` endpoints or WebSocket events via Socket.io
2. CORS middleware validates origin (env-based for prod, localhost:* for dev)
3. Request logger logs all hits with method, path, origin, body
4. Routes process request and interact with Supabase
5. Socket.io auth middleware validates JWT on connection
6. Real-time events broadcast to rooms (zone-specific or direct user-to-user)

**Supabase Integration:**
- Database client configured in `src/config/supabase.js`
- No Mongoose (uses Supabase SDK directly)
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CORS_ORIGIN`

**Socket.io Architecture:**
- Socket rooms by zone: `zone:${zoneId}` for zone-specific broadcasts
- Socket rooms by game: `game:${gameId}` for game state
- Socket stores authenticated user data: `socket.user` (id, username, display_name, vibe, settings, current_zone_id)
- Events handle: zone joins/leaves, vibe posting/reactions, game invites, connection requests
- User presence tracked: `is_online`, `socket_id` stored in users table

**Key Middleware & Patterns:**
- CORS: Dynamic origin validation (callback-based, no return value)
- JWT: `socket.handshake.auth?.token` or `socket.handshake.query?.token`
- Request limit: 5MB JSON payload
- Error handler: Catches all errors, logs, responds with status code + message

**Route Organization:**
- `/api/auth` — Register, login, get current user
- `/api/zones` — Find nearby, create, join, leave
- `/api/vibes` — Get zone vibes, post, react
- `/api/games` — Get games, create, join
- `/api/avatar` — Avatar generation

### Frontend Architecture

**Core Stack:**
- **Angular 17** — Standalone components (no NgModules)
- **RxJS** — Reactive programming for async operations
- **Socket.io-client** — Real-time communication
- **SCSS** — Component-scoped and global styles with CSS variables
- **Karma + Jasmine** — Testing framework

**Component Structure:**
- `app/core/` — Services, models, guards, interceptors (shared, non-UI logic)
- `app/features/` — Feature modules (Auth, Map, Zone, Vibes, Games, Connections, Settings, Profile, Notifications, AvatarGen)
- `app/shell/` — Main layout/container component for authenticated routes
- Lazy-loaded routes via `loadComponent()` for each feature

**Key Concepts:**
- **Standalone Components**: All components use `standalone: true`, no NgModule dependency
- **Signals**: Angular 17 reactive data management (more details in specific components)
- **Auth Flow**: 
  - `authGuard` protects authenticated routes (`/app/*`)
  - `guestGuard` protects public routes (login, register)
  - `authInterceptor` injects JWT token into every HTTP request
- **Routing**: Uses `withHashLocation()` for hash-based routing (mobile-friendly)
- **Zone Guard**: `zoneGuard` ensures user is in a zone before accessing zone-specific features (vibes, games)

**Socket.io Integration:**
- Client connects with JWT token: `socket.auth = { token: jwt }`
- Listens for zone events: `zone:user_joined`, `zone:user_left`
- Listens for vibe events: `vibe:new`, `vibe:reaction_update`
- Listens for game events: `game:invite_received`, `game:state_update`
- Emits: `zone:join`, `zone:leave`, `vibe:post`, `vibe:react`, `game:update`, `connect_request`

**Styling:**
- Global theme in `src/styles/main.scss` with CSS variables
- Components use scoped SCSS (defined in component metadata)
- Mobile-first approach (responsive design)

**Build Output:**
- Production: `ng build` outputs to `dist/minglr/`
- Angular CLI handles bundling, optimization, source maps
- Proxy config (`proxy.conf.json`) routes `/api/*` to backend during dev

---

## Full-Stack Data Flow Example: User Posts a Vibe

1. **Frontend**: User types in vibe-feed component, clicks "Post"
2. **Frontend**: Component emits Socket.io event: `socket.emit('vibe:post', { zoneId, content, type, isAnonymous })`
3. **Backend**: Socket listener in `src/sockets/index.js` receives event
4. **Backend**: Validates token (already verified at handshake), checks anonymous setting
5. **Backend**: Inserts vibe record to Supabase `vibes` table with reactions/reacted_by tracking
6. **Backend**: Broadcasts to zone room: `io.to('zone:${zoneId}').emit('vibe:new', vibe)`
7. **Frontend**: All connected clients in that zone receive `vibe:new` and update the feed UI

---

## Key Dependencies & Versions

**Backend:**
- express: 4.19.2
- socket.io: 4.7.5
- @supabase/supabase-js: 2.43.4
- jsonwebtoken: 9.0.2
- bcryptjs: 2.4.3
- nodemon: 3.1.0 (dev)

**Frontend:**
- @angular/core: 17.3.0
- socket.io-client: 4.7.4
- typescript: 5.4.2
- rxjs: 7.8.0

---

## Environment Variables

**Backend (.env):**
```
SUPABASE_URL=<your_supabase_project_url>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
JWT_SECRET=<your_secret_key>
PORT=3000
CORS_ORIGIN=http://localhost:4200  # Production: set to frontend domain
```

**Frontend:**
- Configured in `proxy.conf.json` for dev (proxies to `http://localhost:3000`)
- No .env needed; API base is `/api` (relative)

---

## Testing

**Backend:**
```bash
npm run test                   # Runs Jest tests
```

**Frontend:**
```bash
npm run test                   # Runs Karma + Jasmine tests
```
Tests are configured in `karma.conf.js` (Frontend) and `jest.config.js` (Backend).

---

## Common Development Scenarios

### Adding a New Zone Feature
1. Create new route handler in `backend/src/routes/zone.routes.js`
2. Add Supabase query to fetch/update zone data
3. Create Angular feature component in `frontend/src/app/features/zones/`
4. Wire HTTP service to call new endpoint
5. Update Socket.io if real-time sync needed

### Adding a Socket.io Event
1. Define listener in `backend/src/sockets/index.js` (after connection auth)
2. Validate user + data
3. Update Supabase (if needed)
4. Emit event back to client(s) using `socket.emit()` or `io.to(room).emit()`
5. On frontend, listen in the appropriate service/component using Socket.io client

### Debugging Socket.io Issues
- Backend logs socket connections with username and socket ID
- Check `socket.user` is properly set after auth middleware
- Verify room names match: `zone:${zoneId}` must be exact
- Frontend: Check browser Network > WS tab for WebSocket frames
- Use browser DevTools → Application → Storage for JWT token validity

---

## Important Files & Responsibilities

| File | Purpose |
|------|---------|
| `backend/server.js` | Entry point; CORS, middleware, routes, Socket.io setup |
| `backend/src/sockets/index.js` | All Socket.io event listeners (zones, vibes, games, connections) |
| `backend/src/routes/*.routes.js` | REST API endpoints for each feature |
| `backend/src/config/supabase.js` | Supabase client initialization |
| `frontend/src/app/app.routes.ts` | Route definitions with lazy loading |
| `frontend/src/app/app.config.ts` | Angular providers (router, HTTP interceptor, animations) |
| `frontend/src/app/core/interceptors/auth.interceptor.ts` | JWT injection into HTTP requests |
| `frontend/src/app/core/guards/auth.guard.ts` | Route protection (auth/guest guards) |
| `frontend/src/styles/main.scss` | Global theme and CSS variables |

---

## Deployment Notes

**Backend:**
- Set `CORS_ORIGIN` to frontend domain in production
- Use `npm start` (not `npm run dev`)
- Ensure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` are in environment
- Supabase PostgreSQL tables must exist with proper schema

**Frontend:**
- Run `npm run build` to create production bundle
- Update API base URL if not using relative paths
- Deploy `dist/minglr/` to static hosting (Vercel, Netlify, etc.)
- Ensure backend is reachable at configured API domain
