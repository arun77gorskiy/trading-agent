import express from 'express';
import { supabase } from '../lib/supabaseClient';
import { ApiError } from '../lib/errorHandler';

const router = express.Router();

/**
 * GET /api/nearby
 * Returns places near a given latitude/longitude within a radius in kilometres.
 * Query parameters:
 *  - lat: latitude (required)
 *  - lng: longitude (required)
 *  - radius: search radius in kilometres (optional, default 5km)
 *
 * Note: This implementation approximates a bounding box filter and then
 * computes approximate distances client‑side. For accurate geospatial
 * operations consider enabling PostGIS and using ST_DWithin in Supabase.
 */
router.get('/', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 5;

    if (isNaN(lat) || isNaN(lng)) {
      const err: ApiError = new Error('Latitude and longitude are required');
      err.status = 400;
      return next(err);
    }

    // Convert radius to approximate degrees. 1 degree latitude ≈ 111 km.
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // Fetch candidate places within bounding box.
    const { data: places, error } = await supabase
      .from('places')
      .select('*')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng);
    if (error) throw error;

    // Compute distance using Haversine formula and filter results.
    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const results = (places || [])
      .map((p) => {
        const distanceKm = haversine(lat, lng, p.latitude, p.longitude);
        return { ...p, distanceKm };
      })
      .filter((p) => p.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});

export default router;