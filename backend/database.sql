-- ============================================================
-- MINGLR — Supabase (PostgreSQL) Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable PostGIS for geo-fencing (nearby zones)
create extension if not exists postgis;

-- ── USERS ────────────────────────────────────────────────
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  username        text unique not null,
  display_name    text not null,
  email           text unique not null,
  password_hash   text not null,
  bio             text default '',
  vibe            text default 'chill' check (vibe in ('chill','social','creative','gamer','mysterious')),
  is_anonymous    boolean default false,
  current_zone_id uuid,
  is_online       boolean default false,
  socket_id       text,
  settings        jsonb default '{
    "anonymousMode":   false,
    "locationSharing": true,
    "vibeVisibility":  "Everyone",
    "zoneAlerts":      true,
    "gameInvites":     true,
    "newConfessions":  false,
    "nearbyPlayers":   true,
    "detectionRadius": 200
  }'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── CONNECTIONS (friend list) ─────────────────────────────
create table if not exists connections (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references users(id) on delete cascade,
  connected_user_id uuid references users(id) on delete cascade,
  created_at        timestamptz default now(),
  unique (user_id, connected_user_id)
);

-- ── ZONES ────────────────────────────────────────────────
create table if not exists zones (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  cover_emoji text default '✨',
  type        text default 'cafe' check (type in ('cafe','bar','park','custom')),
  location    geography(Point, 4326) not null,
  radius      integer default 100,
  created_by  uuid references users(id) on delete set null,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Spatial index for fast nearby queries
create index if not exists zones_location_idx on zones using gist(location);

-- ── ZONE ACTIVE USERS ─────────────────────────────────────
create table if not exists zone_users (
  zone_id   uuid references zones(id) on delete cascade,
  user_id   uuid references users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (zone_id, user_id)
);

-- ── VIBES (confession wall) ───────────────────────────────
create table if not exists vibes (
  id          uuid primary key default gen_random_uuid(),
  zone_id     uuid references zones(id) on delete cascade,
  user_id     uuid references users(id) on delete set null,
  username    text not null,
  is_anonymous boolean default false,
  content     text not null check (char_length(content) <= 280),
  type        text default 'vibe' check (type in ('vibe','confession','shoutout','question')),
  reactions   jsonb default '{"❤️":0,"😂":0,"👀":0,"🔥":0,"💜":0}'::jsonb,
  reacted_by  jsonb default '[]'::jsonb,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create index if not exists vibes_zone_id_idx on vibes(zone_id);
create index if not exists vibes_created_at_idx on vibes(created_at desc);

-- ── GAMES ─────────────────────────────────────────────────
create table if not exists games (
  id          uuid primary key default gen_random_uuid(),
  zone_id     uuid references zones(id) on delete cascade,
  type        text not null check (type in ('ludo','truth-or-dare','quiz','word-chain')),
  host_id     uuid references users(id) on delete set null,
  host_name   text not null,
  players     jsonb default '[]'::jsonb,
  max_players integer default 4 check (max_players between 2 and 8),
  status      text default 'waiting' check (status in ('waiting','playing','finished')),
  game_data   jsonb default '{}'::jsonb,
  winner      text,
  created_at  timestamptz default now()
);

create index if not exists games_zone_id_idx on games(zone_id);

-- ============================================================
-- RPC FUNCTION — get_nearby_zones
-- Called by: GET /api/zones/nearby?lat=&lng=&radius=
-- ============================================================
create or replace function get_nearby_zones(
  user_lat      float,
  user_lng      float,
  radius_meters int default 500
)
returns table (
  id          uuid,
  name        text,
  description text,
  cover_emoji text,
  type        text,
  radius      integer,
  is_active   boolean,
  created_at  timestamptz,
  active_user_count bigint,
  distance_meters   float
)
language sql
stable
as $$
  select
    z.id,
    z.name,
    z.description,
    z.cover_emoji,
    z.type,
    z.radius,
    z.is_active,
    z.created_at,
    count(zu.user_id) as active_user_count,
    st_distance(z.location, st_point(user_lng, user_lat)::geography) as distance_meters
  from zones z
  left join zone_users zu on zu.zone_id = z.id
  where
    z.is_active = true
    and st_dwithin(
      z.location,
      st_point(user_lng, user_lat)::geography,
      radius_meters
    )
  group by z.id
  order by distance_meters asc;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — basic policies
-- ============================================================
alter table users      enable row level security;
alter table zones      enable row level security;
alter table vibes      enable row level security;
alter table games      enable row level security;
alter table zone_users enable row level security;
alter table connections enable row level security;

-- Users can read all public user info, but only update their own
create policy "users_read_all"   on users for select using (true);
create policy "users_update_own" on users for update using (auth.uid()::text = id::text);

-- Zones are publicly readable
create policy "zones_read_all"   on zones for select using (true);
create policy "zones_insert_auth" on zones for insert with check (true);

-- Vibes in active zones are readable by all
create policy "vibes_read_all"   on vibes for select using (is_active = true);
create policy "vibes_insert_auth" on vibes for insert with check (true);
create policy "vibes_update_own" on vibes for update using (true);

-- Games readable by all in zone
create policy "games_read_all"    on games for select using (true);
create policy "games_insert_auth" on games for insert with check (true);
create policy "games_update_auth" on games for update using (true);

-- Zone users
create policy "zone_users_all" on zone_users for all using (true);

-- Connections
create policy "connections_read_own" on connections for select using (true);
create policy "connections_insert"   on connections for insert with check (true);

-- ============================================================
-- UPDATED_AT trigger for users
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at
  before update on users
  for each row execute procedure update_updated_at();
