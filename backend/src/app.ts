import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  // Disable etag headers so the API always responds with fresh payloads (avoids 304 for client fetches)
  app.set('etag', false);

  // Allow both localhost and 127.0.0.1 for development
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-side Next.js fetch, mobile apps, or curl requests)
      if (!origin) {
        if (env.NODE_ENV === 'development') {
          console.log('✅ Allowing request with no origin (server-side fetch)');
        }
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        if (env.NODE_ENV === 'development') {
          console.log(`✅ Allowing CORS request from: ${origin}`);
        }
        callback(null, true);
      } else {
        // In development, log the origin for debugging
        if (env.NODE_ENV === 'development') {
          console.warn(`❌ CORS blocked origin: ${origin}`);
          console.warn(`   Allowed origins:`, allowedOrigins);
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static('public/uploads'));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
