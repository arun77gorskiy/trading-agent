import express from 'express';
import { supabase } from '../lib/supabaseClient';
import { ApiError } from '../lib/errorHandler';

const router = express.Router();

/**
 * GET /api/places
 * Returns a list of all places. Supports optional pagination via query params
 * ?limit=10&offset=20. In future can be extended with filtering by category,
 * price, etc.
 */
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('rating', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/places/:id
 * Returns details for a single place by id. Includes associated reviews and
 * category info via RPC or join. If not found returns 404.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const placeId = req.params.id;
    const { data, error } = await supabase
      .from('places')
      .select(
        `*,
        reviews(id, user_id, rating, comment, created_at),
        categories(id, name)`
      )
      .eq('id', placeId)
      .single();
    if (error) throw error;
    if (!data) {
      const notFound: ApiError = new Error('Place not found');
      notFound.status = 404;
      return next(notFound);
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;