import express from 'express';
import { supabase } from '../lib/supabaseClient';
import { ApiError } from '../lib/errorHandler';

const router = express.Router();

/**
 * GET /api/search
 * Performs a full‑text search across places by name and description. Supports
 * optional filtering by category and price range.
 * Query parameters:
 *  - q: search term (string)
 *  - categories: comma‑separated list of category IDs (optional)
 *  - min_price, max_price: numeric price bounds (optional)
 */
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const categories = (req.query.categories as string | undefined)
      ?.split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price as string) : undefined;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined;

    let query = supabase.from('places').select('*');
    if (q) {
      // Perform ilike on name and description. Use or to search multiple fields.
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (categories && categories.length > 0) {
      query = query.in('category_id', categories);
    }
    if (minPrice !== undefined) {
      query = query.gte('price_level', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('price_level', maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;