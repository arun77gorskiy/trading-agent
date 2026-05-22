# PaydMap Backend

This directory contains the server‑side portion of the PaydMap project. It exposes a RESTful API used by the mobile client to retrieve places, search, get nearby recommendations, and post reviews. The server is written in TypeScript on top of Express and uses Supabase as its database layer.

## Getting started

1. Install dependencies:

   ```bash
   cd paydmap/backend
   npm install
   ```

2. Configure environment variables in a `.env` file. At minimum you need to define:

   ```env
   SUPABASE_URL=<your Supabase project URL>
   SUPABASE_ANON_KEY=<the anon or service role key>
   PORT=4000
   ```

3. Start the development server with live reload:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:4000/api`.

4. To build and run the compiled server:

   ```bash
   npm run build
   npm start
   ```

## Available endpoints

| Method | Path                  | Description                                                |
|-------:|----------------------|------------------------------------------------------------|
|  GET   | `/api/places`        | Retrieve all places, sorted by rating                     |
|  GET   | `/api/places/:id`    | Retrieve a single place with its reviews and category      |
|  GET   | `/api/nearby`        | Retrieve places near a given lat/lng within a radius       |
|  GET   | `/api/search`        | Full‑text search on places with optional filters           |
|  POST  | `/api/reviews`       | Submit a new review (authenticated user required)          |

### Future improvements

- Authentication: integrate Supabase Auth to secure review creation and personal resources such as favourites.
- Advanced geospatial queries using PostGIS functions for accurate distance calculations.
- Pagination and advanced filtering on listing endpoints.
- Automated API documentation (e.g., Swagger/OpenAPI).