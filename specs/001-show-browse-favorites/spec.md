# Feature Specification: Reprise MVP: Show Browser & Favorites

**Feature Branch**: `001-show-browse-favorites`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Build the first MVP slice for Reprise. Users can browse a list of Phish shows, search shows by date or venue, view a show detail page, and save a show to favorites."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Shows List (Priority: P1)

A Phish fan opens Reprise and sees a paginated list of shows. Each entry
displays the date, venue name, and city/state. The list loads quickly and
is sorted by date descending (most recent first). The user can scroll or
page through the full catalog of shows. No authentication is required to
browse.

**Why this priority**: Browsing is the foundational interaction — without
a show list, no other feature (search, detail, favorites) has an entry
point. This story alone delivers value by letting fans explore the catalog.

**Independent Test**: Can be fully tested by loading the shows page and
verifying a paginated list of shows renders with correct date, venue, and
location information.

**Acceptance Scenarios**:

1. **Given** the user navigates to the shows page, **When** the page loads, **Then** a list of shows is displayed sorted by date descending with date, venue name, and city/state visible for each entry.
2. **Given** the shows list is displayed, **When** the user reaches the end of the current page, **Then** pagination controls allow navigating to the next page of results.
3. **Given** the shows list is displayed, **When** viewed on a mobile device (375px viewport), **Then** each show entry remains readable and the layout adapts without horizontal scrolling.

---

### User Story 2 - Search Shows by Date or Venue (Priority: P2)

A fan is looking for a specific show they attended. They type a date
(e.g., "12/31/1995" or "1995") or a venue name (e.g., "Madison Square
Garden") into a search field on the shows page and submit the search.
The page reloads with filtered results reflected in the URL as query
parameters (e.g., `/shows?q=madison`), making search results shareable
and bookmarkable. If no results match, a clear empty-state message is
shown. No authentication is required to search.

**Why this priority**: Search transforms passive browsing into active
discovery. Once the list exists (P1), search makes it useful for fans
who know what they're looking for.

**Independent Test**: Can be tested by entering a known date or venue
into the search field and verifying the results narrow to matching shows
only.

**Acceptance Scenarios**:

1. **Given** the shows list is displayed, **When** the user types a full date (e.g., "12/31/1995") into the search field and submits, **Then** only shows matching that date are displayed and the query is reflected in the URL.
2. **Given** the shows list is displayed, **When** the user types a partial year (e.g., "1995") into the search field and submits, **Then** all shows from that year are displayed.
3. **Given** the shows list is displayed, **When** the user types a venue name (e.g., "Madison Square Garden") into the search field and submits, **Then** only shows at matching venues are displayed.
4. **Given** the user has submitted a search query, **When** no shows match the query, **Then** an empty-state message is displayed (e.g., "No shows found for your search").
5. **Given** the user has an active search, **When** the user clears the search field and submits, **Then** the full shows list is restored.

---

### User Story 3 - View Show Detail Page (Priority: P3)

A fan clicks on a show from the list (or search results) and is taken to
a detail page for that specific show. The detail page displays the full
date, venue, city/state, and the complete setlist organized by set
(Set 1, Set 2, Encore, etc.). Each song in the setlist is listed in
performance order. No authentication is required to view show details.

**Why this priority**: The detail page is where the core content lives —
setlists are what Phish fans care about most. It depends on P1 (list) for
navigation but delivers standalone value once reached.

**Independent Test**: Can be tested by navigating to a specific show's
detail page and verifying all show metadata and the full setlist are
displayed correctly, organized by set.

**Acceptance Scenarios**:

1. **Given** the user is on the shows list, **When** they click on a specific show, **Then** they are navigated to that show's detail page.
2. **Given** the show detail page loads, **When** the show data is available, **Then** the full date, venue name, city, state, and setlist are displayed.
3. **Given** the show detail page loads, **When** the show has multiple sets, **Then** songs are grouped by set (Set 1, Set 2, Encore, etc.) in performance order.
4. **Given** the show detail page, **When** the user wants to return to the list, **Then** a clear navigation path (back link or breadcrumb) returns them to the shows list preserving their previous search/pagination state.

---

### User Story 4 - Save a Show to Favorites (Priority: P4)

A fan finds a show they love and wants to save it for quick access later.
They click a "favorite" button (heart icon or similar) on either the show
list or the show detail page. If the user is not logged in, they are
redirected to the login page and returned to the originating page after
authenticating. The show is persisted as a favorite and the button
reflects the favorited state. The user can view all their favorited shows
in a dedicated favorites view and can remove a show from favorites.

**Why this priority**: Favorites add personalization and return-visit value,
but require the browse (P1) and detail (P3) experiences to exist first.
This is the first feature that introduces user-specific persisted state.

**Independent Test**: Can be tested by favoriting a show, verifying the
favorite state persists across page reloads, viewing the favorites list,
and unfavoriting a show.

**Acceptance Scenarios**:

1. **Given** a show is displayed (in list or detail view), **When** the user clicks the favorite button, **Then** the show is saved to their favorites and the button visually indicates the favorited state.
2. **Given** a show is already favorited, **When** the user clicks the favorite button again, **Then** the show is removed from favorites and the button returns to its default state.
3. **Given** the user has favorited one or more shows, **When** they navigate to the favorites view, **Then** all their favorited shows are listed.
4. **Given** the user favorites a show, **When** they reload the page or return later, **Then** the favorited state is persisted and still reflected in the UI.
5. **Given** the user is not logged in, **When** they click the favorite button on a show, **Then** they are redirected to the login page and returned to the originating page after authenticating.

---

### Edge Cases

- What happens when the external show data source is temporarily unavailable? The system displays a user-friendly error message and does not crash.
- What happens when a show has no setlist data? The detail page displays the show metadata with a message indicating the setlist is not yet available.
- What happens when a user favorites a show and the data for that show is later updated upstream? The favorite link remains valid and displays the updated show information.
- What happens when the search query contains special characters? The system handles them gracefully without errors.
- What happens when the shows database is empty (initial state before data is seeded)? The list page displays a meaningful empty state rather than a blank page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of Phish shows sorted by date descending.
- **FR-002**: Each show list entry MUST display the show date, venue name, and city/state.
- **FR-003**: System MUST provide a submit-based search field that filters shows by date (full date or year) or venue name. Search queries MUST be reflected in URL query parameters.
- **FR-004**: Search results MUST update the displayed list via server-side filtering and show an empty-state message when no results match.
- **FR-005**: System MUST provide a show detail page accessible by clicking a show in the list.
- **FR-006**: The show detail page MUST display full date, venue, city/state, and the complete setlist organized by set.
- **FR-007**: System MUST allow users to save a show as a favorite via a toggle button.
- **FR-008**: System MUST persist favorites so they survive page reloads and return visits.
- **FR-009**: System MUST provide a favorites view listing all favorited shows.
- **FR-010**: System MUST allow users to remove a show from favorites.
- **FR-011**: Pagination MUST support navigating forward and backward through the shows list.
- **FR-012**: All pages MUST be responsive from 375px to 1440px+ viewports.
- **FR-013**: System MUST handle external data source unavailability gracefully with user-facing error messages.
- **FR-014**: System MUST authenticate users via a username-only login page. Users enter a username to log in; if the username does not exist, the system automatically creates the account. No email or password is required.
- **FR-015**: Browse, search, and show detail pages MUST be publicly accessible without authentication. Only favorites-related actions and the favorites view MUST require authentication.
- **FR-016**: Unauthenticated users attempting to favorite a show MUST be redirected to the login page and returned to the originating page after authenticating.
- **FR-017**: System MUST provide a logout mechanism that ends the user's session.

### Key Entities

- **Show**: A single Phish concert. Key attributes: date, venue, city, state, tour name (if applicable), show notes.
- **Venue**: A location where a show took place. Key attributes: name, city, state, country.
- **Setlist**: The ordered list of songs performed at a show, grouped by set. Key attributes: set number/label (Set 1, Set 2, Encore), song order within set.
- **Song**: An individual track in the Phish catalog. Key attributes: name, original artist (if a cover).
- **User**: An authenticated user of the system. Key attributes: unique username, date created. No email or password — username is the sole identifier.
- **Favorite**: A user's saved reference to a show. Key attributes: user reference, show reference, date favorited.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find a specific show by date or venue within 10 seconds of reaching the shows page.
- **SC-002**: The shows list page loads and displays results within 2 seconds on a standard broadband connection.
- **SC-003**: Users can navigate from the shows list to a show detail page and view the full setlist in under 3 seconds.
- **SC-004**: Users can favorite a show and see the updated state reflected immediately (under 1 second perceived latency).
- **SC-005**: The shows list supports browsing a catalog of 2,000+ shows without performance degradation.
- **SC-006**: All pages are fully usable on mobile (375px) and desktop (1440px+) without horizontal scrolling or unreadable content.

## Assumptions

- Show and setlist data will be sourced from the Phish.in API and stored locally in PostgreSQL for fast querying. The system will not serve data directly from the external API on every request.
- The initial data set covers the full Phish catalog (~2,000 shows spanning 1983–present).
- Search is text-based (no fuzzy matching or full-text search engine required for MVP). Simple case-insensitive substring matching is sufficient.
- Pagination uses a fixed page size (e.g., 25 shows per page) for MVP.
- AI and MCP features are explicitly excluded from this slice per the MVP Scope Guard (Constitution Principle IX).
- Mobile-responsive design is required but a dedicated native mobile app is not in scope.
- Show data is read-only from the user's perspective — users cannot edit show or setlist information.
- Authentication uses a username-only model (no password, no email) following the same pattern as the ThreadMind project. Accounts are auto-created on first login.
- User sessions are stored in signed HTTP-only cookies with a long expiry (1 year). A SESSION_SECRET environment variable is required.
- Expected routes: `/login`, `/shows` (list + search), `/shows/:showId` (detail), `/favorites` (authenticated).
