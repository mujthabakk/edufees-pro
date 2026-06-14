# EduFees Pro

Monorepo for the EduFees fee management platform.

## Structure

- `apps/web` — Next.js frontend
- `apps/api` — NestJS backend
- `packages/shared-types` — shared TypeScript types

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (local install via Homebrew: `brew install postgresql@16`)
- Redis (local install via Homebrew: `brew install redis`)

## Setup

```bash
# Install dependencies (single root node_modules for all workspaces)
npm install

# Build shared types
npm run build:shared

# Configure API env
cp apps/api/.env.example apps/api/.env

# Create DB user/database (first time only, with Postgres running)
createuser edufees -P   # password: edufees
createdb -O edufees edufees

# Migrate and seed
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Development

```bash
# Terminal 1 — API (http://localhost:4000, docs at /docs)
npm run dev:api

# Terminal 2 — Web (http://localhost:3000)
npm run dev:web
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start Next.js dev server |
| `npm run dev:api` | Start NestJS dev server |
| `npm run build` | Build all packages |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
