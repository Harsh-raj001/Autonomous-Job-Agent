import { PrismaClient } from '@prisma/client';

// Global singleton — prevents connection pool exhaustion when multiple modules
// instantiate PrismaClient independently on every request.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        // Uses Transaction Pooler (port 6543) to avoid exhausting Supabase nano-plan connections.
        // The ?pgbouncer=true param tells Prisma it's behind PgBouncer.
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Reconnect middleware — Supabase serverless pooler drops idle connections.
  // On any connection error, log it and let Prisma auto-reconnect on the next query.
  client.$on('error' as never, (e: any) => {
    console.error('[Prisma] Connection error (will auto-reconnect):', e?.message ?? e);
  });

  return client;
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

// In development, store on global so hot-reloads don't create new connections
if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
