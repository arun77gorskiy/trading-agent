# PaydMap

PaydMap is a mobile‑first, AI‑powered discovery platform for cheap food,
hidden gems, hostels, hotels, auto services and local attractions across Russia
and beyond.  This repository contains both the backend (Express API) and
frontend (Expo React Native app) components for the PaydMap MVP.  The
architecture is designed to be scalable and maintainable, with a clean
folder structure, TypeScript throughout, and environment‑driven
configuration.

## Project structure

The project is divided into two main subdirectories:

| Path          | Description                              |
|---------------|------------------------------------------|
| **`backend`** | Express + TypeScript REST API that reads data from Supabase and exposes endpoints for places, search, nearby queries and reviews. |
| **`frontend`** | Expo Router based React Native application that renders a premium dark UI with bottom navigation, maps, search and place details. |
| `schema.sql`  | SQL file defining the Supabase database schema, including users, places, categories, reviews, favourites, hidden places and reports. |
| `seed.ts`     | Seed script generating example data across Russian cities. |

Each subproject has its own `README.md` with detailed setup instructions.

## Getting started

1. **Clone this repository** and install dependencies for each subproject.

   ```bash
   git clone <this-repo>
   cd paydmap
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment variables.**  Copy the `.env.example` files in
   `backend` and `frontend` to `.env` and replace the placeholder values
   with your Supabase project URL and anon key.  For the backend you can
   also specify a custom port.  For the frontend set `API_BASE_URL` to
   point at your running backend.

3. **Run the backend.**  From the `backend` directory:

   ```bash
   npm run dev
   ```

   This starts an Express server on the configured `PORT` (defaults to 4000)
   exposing the API at `/api`.

4. **Run the frontend.**  From the `frontend` directory:

   ```bash
   npm start
   ```

   Use the Expo CLI to launch the app on your iOS or Android device or in a
   simulator/emulator.  The app will connect to your backend and Supabase
   instance using the configuration in `.env`.

## Database

The `schema.sql` file defines a robust PostgreSQL schema with the
following tables:

* `users` – authenticated users of the app.
* `categories` – categories for places (e.g., food, hostel, auto services).
* `places` – locations with coordinates, ratings and category references.
* `reviews` – user submitted reviews of places.
* `favourites` – user favourites for personalized recommendations.
* `hidden_places` – hidden gems curated for unique experiences.
* `reports` – user reports of issues with places.

Row‑level security (RLS) policies ensure proper access control.  Indexes
support geospatial queries and text search.  See `schema.sql` for the
complete schema and `seed.ts` for seed data generation.

## Roadmap

This MVP lays the groundwork for future AI‑powered features such as:

* Personalized recommendations based on user preferences and
  geographic proximity.
* Smart ranking algorithms to surface the best cheap places and hidden
  locals.
* Advanced search and filtering using natural language queries.

Contributions and feedback are welcome!
