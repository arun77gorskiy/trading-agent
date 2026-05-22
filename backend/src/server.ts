import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './lib/errorHandler';

// Load environment variables from .env file when present.
dotenv.config();

// Initialise Express application.
const app = express();

// Global middleware.
app.use(cors());
app.use(express.json());

// Mount API routes under /api prefix.
app.use('/api', routes);

// Central error handler must be last after all other middleware and routes.
app.use(errorHandler);

// Determine port from environment or fallback to 3000.
const PORT = process.env.PORT || 3000;

// Start the server only if invoked directly (not during tests).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PaydMap API listening on port ${PORT}`);
  });
}

export default app;