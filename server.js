import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from './middleware/mongoSanitize.js';
import compression from 'compression';
import morgan from 'morgan';

import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import { ensureSeedData } from './seed.js';
import { loadEnvironment } from './config/env.js';
import globalErrorHandler from './middleware/errorHandler.js';
import AppError from './utils/appError.js';
import { initSocketIO } from './services/socketService.js';
import { startTrafficGenerator } from './services/trafficGenerator.js';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDefinition } from './swaggerDefs.js';
import swaggerJSDoc from 'swagger-jsdoc';
import { authLimiter, analyticsLimiter, writeLimiter } from './middleware/rateLimiter.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  if (server) {
    server.close(() => {
      mongoose.connection.close(false).then(() => process.exit(1));
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnvironment(__dirname);

const app = express();
const port = Number(process.env.PORT);
const publicDir = path.resolve(__dirname, 'public');

// ── PRODUCTION SECURITY & PERFORMANCE MIDDLEWARES ──

// 1. Helmet for secure HTTP headers (configured to allow external CDNs like Chart.js and Google Fonts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://i.pravatar.cc", "https://images.unsplash.com"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);

// 2. Per-endpoint rate limiting
// Auth endpoints: stricter (10 req/15min)
// Analytics read: generous (200 req/15min)
// Write endpoints: moderate (50 req/15min)
// Derived routes inherit parent limit if not overridden

// 3. CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : 'http://localhost:3000',
    credentials: true,
  })
);

// 4. Request logging (Morgan) + Winston
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 5. Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 6. Data sanitization against NoSQL query injection
app.use(mongoSanitize);

// 7. Gzip compression for response bodies
app.use(compression());

// Serve static files
app.use(express.static(publicDir));

// ── ROUTES ──
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.get(['/', '/dashboard', '/index.html'], (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
});

// Per-endpoint rate limiting
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/analytics', analyticsLimiter, analyticsRouter);

// ── SWAGGER / OpenAPI docs ──
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js'], // scan route/controller files for JSDoc comments
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handle unhandled routes
app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

let server;

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from your .env file.');
  }
  await mongoose.connect(process.env.MONGO_URI);
  await ensureSeedData();

  server = app.listen(port, () => {
    logger.info(`Insights API listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);

    // Initialize Socket.IO for real-time communication
    initSocketIO(server);

    // Start real-time traffic event generator
    startTrafficGenerator();
  });
}

startServer().catch((error) => {
  logger.error(`Server failed: ${error.message}`);
});


// Handle SIGTERM and SIGINT signals for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('Process terminated!');
      mongoose.connection.close(false, () => {
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT RECEIVED. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      mongoose.connection.close(false, () => {
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
});


