import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ms }) => {
              return `[NestWinston] ${timestamp} ${level}: ${message} ${ms}`;
            }),
          ),
        }),
        // In production, we would add File or Datadog transports here
      ],
    }),
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, Postman, server-side)
      if (!origin) return callback(null, true);
      // Allow any localhost port during development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      // Allow configured production frontend URL
      const allowed = process.env.FRONTEND_URL || '';
      if (allowed && origin === allowed) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Explicitly bind to 3001 to avoid clashing with Next.js on 3000
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
