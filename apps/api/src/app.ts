import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { health } from './routes/health.js';
import { stripeWebhook } from './routes/stripeWebhook.js';
import { auth } from './routes/auth.js';
import { catalog } from './routes/catalog.js';
import { bookings } from './routes/bookings.js';
import { pro } from './routes/pro.js';
import { admin } from './routes/admin.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
  app.use(pinoHttp({ logger }));

  app.use(health);
  app.use(stripeWebhook); // before express.json(): needs the raw body

  app.use(express.json({ limit: '100kb' }));
  app.use('/api', apiLimiter, auth, catalog, bookings, pro, admin);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
