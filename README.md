# Reprise

A Phish show discovery app for browsing, searching, and saving your favorite concerts and tracks. Show data is sourced from the [Phish.in](https://phish.in/) API.

## Features

- Browse a paginated list of Phish shows
- Search shows by song, venue, date, or city
- View show detail pages with full setlists and track info
- Save favorite shows and tracks (requires login)
- Username-only authentication

## Tech Stack

- React 19 + React Router 7 (SSR)
- PostgreSQL + Prisma ORM
- Tailwind CSS v4 + shadcn/ui
- Vite 7
- Yarn 4

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Enable Corepack (required for Yarn 4):

   ```bash
   corepack enable
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — PostgreSQL connection string
   - `SESSION_SECRET` — a random string for signing cookies

4. Set up the database:

   ```bash
   yarn prisma:generate
   yarn migrate:latest
   npx prisma db seed
   ```

   The seed script fetches all shows, venues, songs, and tracks from Phish.in. This takes a while on first run.

5. Start the dev server:

   ```bash
   yarn dev
   ```

   The app will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with HMR |
| `yarn build` | Production build |
| `yarn start` | Run production server |
| `yarn typecheck` | Type-check with `tsc` |
| `yarn prisma:generate` | Generate Prisma client |
| `yarn db:push` | Push schema to database |
| `yarn migrate:new` | Create a new migration |
| `yarn migrate:latest` | Run pending migrations |
| `npx prisma db seed` | Seed data from Phish.in |
| `npx prisma studio` | Open database GUI |
