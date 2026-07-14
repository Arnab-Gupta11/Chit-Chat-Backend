import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { getLandingPageHtml } from './lib/landingPage';
import { logger } from './lib/logger';
import { swaggerSpec } from './lib/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { healthRouter } from './modules/health/health.routes';
import { userRouter } from './modules/user/user.routes';

export function createApp(): express.Application {
  const app = express();

  // ── Security ──────────────────────────────────────────
  // Swagger UI এর জন্য CSP relax করতে হবে
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'unpkg.com', 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'unpkg.com', 'cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // ── Rate Limiting ─────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' },
    }),
  );

  // ── Parsing & Compression ─────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // ── HTTP Logging ──────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger: logger.child({ component: 'http' }) }));
  }

  const apiPrefix = `/api/${env.API_VERSION}`;

  // ── Landing Page ──────────────────────────────────────
  app.get('/', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getLandingPageHtml());
  });

  // ── Base Url response ──────────────────────────────────────
  app.get(apiPrefix, (_req, res) => {
    res.json({
      success: true,
      message: `Welcome to API v${env.API_VERSION} 🚀`,
      'base-url': `http://localhost:${env.PORT}${apiPrefix}`,
    });
  });

  // ── Swagger UI ────────────────────────────────────────
  app.use(
    `${apiPrefix}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'API Docs',
      customCss: `
        .swagger-ui .topbar { background: #0f1117; border-bottom: 1px solid #2a3347; }
        .swagger-ui .topbar-wrapper img { display: none; }
        .swagger-ui .topbar-wrapper::before { content: '⚡ API Docs'; color: #e2e8f0; font-size: 1.1rem; font-weight: 600; }
        .swagger-ui { background: #0f1117; }
        .swagger-ui .info .title { color: #e2e8f0; }
      `,
    }),
  );

  // OpenAPI JSON spec endpoint
  app.get(`${apiPrefix}/docs-json`, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ── API Routes ────────────────────────────────────────
  app.use(`${apiPrefix}/health`, healthRouter);
  app.use(`${apiPrefix}/users`, userRouter);

  // ── Error Handling (must be last) ─────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
