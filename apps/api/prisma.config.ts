import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 centralizes CLI/migration configuration here. The runtime client
// connects via the PrismaPg driver adapter (see src/prisma/prisma.service.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    // Used by the Prisma CLI for migrate/introspect. Locally this is the same
    // as DATABASE_URL; for pooled providers (Neon) supply the direct URL.
    url: env('DIRECT_URL'),
  },
});
