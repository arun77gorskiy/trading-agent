-- PaydMap database schema
-- This file defines the tables and policies required by the PaydMap application.
-- It is intended to be executed in a Supabase Postgres environment. Adjust
-- types and policies accordingly if you are running in a different setup.

-- Enable useful extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- Users table. Authentication is handled by Supabase Auth; this table stores
-- additional profile information. The primary key aligns with auth.users.id.
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Categories table defines high‑level types for places (e.g. cafe, hostel, auto service).
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Places table stores the core location entities in PaydMap. It contains basic
-- information, geospatial coordinates, pricing and rating metrics.
create table if not exists places (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category_id uuid references categories(id),
  address text,
  latitude double precision not null,
  longitude double precision not null,
  price_level numeric(10,2),
  rating numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  owner_id uuid references users(id) -- optional owner of the listing
);

-- Reviews table stores user reviews for places. Rating is between 1 and 5.
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique (user_id, place_id) -- one review per user per place
);

-- Favourites table allows users to mark places as favourites for quick access.
create table if not exists favourites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (user_id, place_id)
);

-- Hidden places table allows users to hide specific places from their feed.
create table if not exists hidden_places (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (user_id, place_id)
);

-- Reports table records user‑submitted reports about incorrect or inappropriate
-- information. The reason can be free form or structured in future.
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  reason text not null,
  created_at timestamp with time zone default now()
);

-- Index for fast geospatial queries on places. PostGIS will create a GIST
-- index on the latitude/longitude point when using the geography type; here
-- we create a composite index on latitude and longitude for bounding box searches.
create index if not exists places_lat_lng_idx on places (latitude, longitude);

-- Basic row level security (RLS) policies. Enable RLS by default on tables that
-- store user specific data. For demonstration we allow public read access and
-- restrict write access to the owner or authenticated user.

alter table users enable row level security;
create policy "Users are owners of their profile" on users
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can view profiles" on users for select using (true);

alter table reviews enable row level security;
create policy "Authenticated users can insert reviews" on reviews
  for insert with check (auth.uid() = user_id);
create policy "Users can update or delete their own reviews" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Anyone can read reviews" on reviews for select using (true);

alter table favourites enable row level security;
create policy "Authenticated users can manage their favourites" on favourites
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table hidden_places enable row level security;
create policy "Authenticated users can manage their hidden places" on hidden_places
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table reports enable row level security;
create policy "Authenticated users can create reports" on reports
  for insert with check (auth.uid() = user_id);
create policy "Admins can view all reports" on reports for select using (auth.role() = 'service_role');

-- Additional indexes for performance
create index if not exists reviews_place_idx on reviews (place_id);
create index if not exists favourites_user_idx on favourites (user_id);
create index if not exists hidden_places_user_idx on hidden_places (user_id);