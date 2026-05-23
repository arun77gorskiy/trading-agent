import express from 'express';
import places from './places';
import nearby from './nearby';
import search from './search';
import reviews from './reviews';

const router = express.Router();

// Mount individual resource routers
router.use('/places', places);
router.use('/nearby', nearby);
router.use('/search', search);
router.use('/reviews', reviews);

export default router;