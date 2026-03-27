# Quickstart: Reprise MVP

**Feature Branch**: `001-show-browse-favorites`

## Prerequisites

- Node.js 20+
- Yarn 4 (Berry) — already configured via `packageManager` in package.json
- PostgreSQL (local instance or Railway)

## Setup

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/reprise"
SESSION_SECRET="your-secret-here"
```

### 3. Initialize database

```bash
yarn prisma generate    # Generate Prisma Client
yarn prisma db push     # Create tables (or: yarn prisma migrate dev)
```

### 4. Seed show data

```bash
yarn prisma db seed
```

This imports ~2,000 shows from the Phish.in API. Takes 15-30 minutes due to
rate-limited API calls for track/setlist data.

### 5. Run development server

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) — redirects to `/shows`.

## Verify It Works

1. **Browse**: `/shows` displays a paginated list of Phish shows
2. **Search**: Enter "Madison Square Garden" in the search field, submit → filtered results
3. **Detail**: Click any show → see full setlist grouped by set
4. **Login**: Navigate to `/login`, enter any username → account created
5. **Favorite**: Click the heart icon on a show → saved to favorites
6. **Favorites**: Navigate to `/favorites` → see your saved shows

## Key Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn start` | Serve production build |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn prisma studio` | Open Prisma database GUI |
| `yarn prisma db seed` | Re-run data seed (idempotent) |

## Project Structure

```
app/
├── components/
│   └── ui/              # shadcn/ui components (pre-installed)
├── lib/
│   └── utils.ts         # cn() utility
├── routes/
│   ├── home.tsx         # / → redirect to /shows
│   ├── login.tsx        # Username-only login
│   ├── shows.tsx        # Show list + search
│   ├── shows.$showDate.tsx  # Show detail + favorite toggle
│   ├── favorites.tsx    # User's favorited shows
│   └── api.logout.tsx   # Logout action
├── services/
│   ├── show.server.ts   # Show queries (list, search, detail)
│   ├── favorite.server.ts  # Favorite CRUD
│   └── phishin.server.ts   # Phish.in API adapter (seed only)
├── utils/
│   └── auth.server.ts   # Session management, requireAuth
├── root.tsx
├── routes.ts
└── app.css

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Phish.in data import script
```
