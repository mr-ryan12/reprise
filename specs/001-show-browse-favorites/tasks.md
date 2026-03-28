# Tasks: Reprise MVP: Show Browser & Favorites

**Input**: Design documents from `/specs/001-show-browse-favorites/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/routes.md, research.md, quickstart.md

**Tests**: Not requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration and database schema foundation

- [x] T001 Create `.env.example` with DATABASE_URL and SESSION_SECRET variables
- [x] T002 Define Prisma schema with all 6 models (Venue, Show, Song, Track, User, Favorite) in `prisma/schema.prisma`
- [x] T003 Run Prisma migration to create database tables via `yarn prisma migrate dev`
- [x] T004 [P] Configure route definitions for all 6 routes in `app/routes.ts`

**Checkpoint**: Database schema exists, routes are configured, environment template is ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Warning**: No user story work can begin until this phase is complete.

- [x] T005 Implement Phish.in API adapter service in `app/services/phishin.server.ts` (Axios client with pagination helpers and rate limiting)
- [x] T006 Create seed script in `prisma/seed.ts` to import venues, shows, songs, and tracks from Phish.in API v2
- [x] T007 Configure seed command in `package.json` and run `yarn prisma db seed` to populate data
- [x] T008 [P] Implement auth utilities in `app/utils/auth.server.ts` (createCookieSessionStorage, requireAuth, getOptionalUser, findOrCreateUser, createUserSession, logout)
- [x] T009 [P] Implement show service in `app/services/show.server.ts` (getShows with pagination, getShowByDate with tracks, searchShows)
- [x] T010 [P] Implement favorite service in `app/services/favorite.server.ts` (toggleFavorite, getUserFavorites, isShowFavorited, getUserFavoriteShowIds)

**Checkpoint**: Foundation ready — database is seeded, auth is wired, services are available. User story implementation can now begin.

---

## Phase 3: User Story 1 — Browse Shows List (Priority: P1)

**Goal**: A fan opens Reprise and sees a paginated list of shows sorted by date descending, with date, venue name, and city/state for each entry.

**Independent Test**: Load `/shows` and verify a paginated list renders with correct show data and working pagination controls.

### Implementation for User Story 1

- [x] T011 [US1] Replace default home route with redirect to `/shows` in `app/routes/home.tsx`
- [x] T012 [US1] Implement shows list loader (paginated, date descending) and page component in `app/routes/shows.tsx`
- [x] T013 [US1] Style show list cards (date, venue name, city/state) with responsive layout (375px–1440px+) in `app/routes/shows.tsx`
- [x] T014 [US1] Add pagination controls (previous/next, page indicator) to `app/routes/shows.tsx`

**Checkpoint**: User Story 1 is fully functional. Fans can browse the full show catalog with pagination. Stop and validate.

---

## Phase 4: User Story 2 — Search Shows by Date or Venue (Priority: P2)

**Goal**: A fan can type a date or venue name into a search field and submit to filter the shows list. Results are reflected in URL query params and are shareable.

**Independent Test**: Enter a known date or venue name in the search field, submit, and verify filtered results appear with the query in the URL. Clear search to restore full list.

### Implementation for User Story 2

- [x] T015 [US2] Add search form (submit-based, `<Form>` with GET method) to `app/routes/shows.tsx`
- [x] T016 [US2] Update shows loader to read `q` search param and filter via show service in `app/routes/shows.tsx`
- [x] T017 [US2] Add empty-state message when no shows match the search query in `app/routes/shows.tsx`
- [x] T018 [US2] Ensure pagination resets to page 1 on new search and preserves query across pages in `app/routes/shows.tsx`

**Checkpoint**: User Story 2 is fully functional. Search works with URL params, empty state displays, and pagination integrates with search.

---

## Phase 5: User Story 3 — View Show Detail Page (Priority: P3)

**Goal**: A fan clicks a show and sees a detail page with full date, venue, city/state, and the complete setlist organized by set.

**Independent Test**: Navigate to `/shows/YYYY-MM-DD` and verify all show metadata and the full setlist are displayed, grouped by set (Set 1, Set 2, Encore, etc.) in performance order.

### Implementation for User Story 3

- [x] T019 [US3] Implement show detail loader (show metadata + tracks with songs) in `app/routes/shows.$showDate.tsx`
- [x] T020 [US3] Build show detail page component with venue info and setlist grouped by set in `app/routes/shows.$showDate.tsx`
- [x] T021 [US3] Add back navigation link that preserves previous search/pagination state in `app/routes/shows.$showDate.tsx`
- [x] T022 [US3] Handle 404 for invalid show dates and empty setlist edge case in `app/routes/shows.$showDate.tsx`
- [x] T023 [US3] Make show list entries clickable links to detail pages in `app/routes/shows.tsx`

**Checkpoint**: User Story 3 is fully functional. Fans can click into any show and see the full setlist organized by set.

---

## Phase 6: User Story 4 — Save a Show to Favorites (Priority: P4)

**Goal**: A fan can favorite/unfavorite shows, view their favorites list, and authenticate when needed. Favorites persist across sessions.

**Independent Test**: Log in, favorite a show from the detail page, verify it appears in `/favorites`, unfavorite it, verify removal. Test unauthenticated redirect flow.

### Implementation for User Story 4

- [x] T024 [US4] Implement login page with username form, loader (redirect if authed, read redirectTo), and action (validate, findOrCreateUser, createSession) in `app/routes/login.tsx`
- [x] T025 [US4] Implement logout action-only route in `app/routes/api.logout.tsx`
- [x] T026 [US4] Add favorite toggle action (POST with intent="favorite") to show detail page in `app/routes/shows.$showDate.tsx`
- [x] T027 [US4] Update show detail loader to check favorite status for authenticated users and render favorite button in `app/routes/shows.$showDate.tsx`
- [x] T028 [US4] Implement favorites list page with loader (requireAuth, getUserFavorites) and show cards in `app/routes/favorites.tsx`
- [x] T029 [US4] Add auth-aware navigation (login/logout links, username display) to root layout in `app/root.tsx`
- [x] T030 [US4] Optionally show favorite indicators on the shows list for authenticated users in `app/routes/shows.tsx`

**Checkpoint**: User Story 4 is fully functional. Full auth flow, favorite toggling, favorites list, and unauthenticated redirect all work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Add loading states and error boundaries to all route modules
- [ ] T032 [P] Verify responsive layout across all pages at 375px, 768px, and 1440px+ breakpoints
- [ ] T033 [P] Add `prefers-reduced-motion` respect to any animations or transitions
- [ ] T034 Run `yarn typecheck` and fix any TypeScript errors across all files
- [ ] T035 Run full quickstart.md validation (all 6 verification steps)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (schema must exist for seed, routes for services)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs seeded data + show service)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (search extends the existing shows page)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (detail page needs show list for navigation)
- **User Story 4 (Phase 6)**: Depends on Phase 2 (needs auth utils + favorite service); can run in parallel with US2/US3 but integrates with detail page
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Browse)**: First story — no dependencies on other stories
- **US2 (Search)**: Extends US1's shows page — depends on US1
- **US3 (Detail)**: Navigated to from US1's list — depends on US1
- **US4 (Favorites)**: Integrates with US3's detail page — best done after US3. Auth (T024, T025) could start after Phase 2.

### Within Each User Story

- Services before route loaders (services built in Phase 2)
- Loaders before components
- Core display before interactive features
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T004 can run in parallel with T001–T003
- **Phase 2**: T008, T009, T010 can all run in parallel (different files). T005 → T006 → T007 must be sequential.
- **Phase 3**: T011 is independent of T012–T014
- **Phase 6**: T024, T025 can run in parallel (different files)
- **Phase 7**: T031, T032, T033 can all run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Sequential: Phish.in adapter → seed script → run seed
Task T005: "Implement Phish.in API adapter in app/services/phishin.server.ts"
Task T006: "Create seed script in prisma/seed.ts"
Task T007: "Run seed to populate data"

# Parallel: All three services (different files, no cross-dependencies)
Task T008: "Implement auth utilities in app/utils/auth.server.ts"
Task T009: "Implement show service in app/services/show.server.ts"
Task T010: "Implement favorite service in app/services/favorite.server.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Browse Shows List
4. **STOP and VALIDATE**: Load `/shows`, verify paginated list with correct data
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Browse) → Test independently → **MVP!**
3. Add US2 (Search) → Test independently → Deploy
4. Add US3 (Detail) → Test independently → Deploy
5. Add US4 (Favorites) → Test independently → Deploy
6. Polish → Final validation → Production-ready

### Recommended Sequential Order (Solo Developer)

Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7

This order maximizes value at each checkpoint and avoids cross-story conflicts in shared files like `shows.tsx`.
