import express from 'express';
import Joi from 'joi';
import { supabase } from '../lib/supabaseClient';
import { validate } from '../lib/validate';

const router = express.Router();

// Schema for review creation
const reviewSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  place_id: Joi.string().uuid().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('', null)
});

/**
 * POST /api/reviews
 * Submits a new review. Requires user authentication via Supabase row‑level
 * security (not yet implemented here). Responds with created review.
 */
router.post('/', validate(reviewSchema), async (req, res, next) => {
  try {
    const { user_id, place_id, rating, comment } = req.body;
    const { data, error } = await supabase
      .from('reviews')
      .insert({ user_id, place_id, rating, comment })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;