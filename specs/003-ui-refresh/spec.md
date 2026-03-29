# Feature Specification: UI Refresh

**Feature Branch**: `003-ui-refresh`
**Created**: 2026-03-28
**Status**: Draft
**Input**: User description: "Refresh and elevate the Reprise UI for the existing MVP functionality. Improve the visual design, layout, spacing, typography hierarchy, responsive behavior, and interaction polish across the core authenticated and public routes without changing the underlying product scope."

## Clarifications

### Session 2026-03-28

- Q: How should image data be sourced for US7/FR-015, given the current schema has no image fields? → A: Add an optional `albumCoverUrl` field to Show, populated during seed from Phish.in's `album_cover_url`. When the field is null, display a default fallback image so the layout always includes a visual element.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browsing Shows with Improved Visual Hierarchy (Priority: P1)

A user visits the shows list to find a specific concert. The refreshed layout presents each show as a well-structured card with clear date prominence, venue details, and location metadata arranged in a scannable visual hierarchy. The user can quickly distinguish dates, venues, and cities at a glance without reading full lines. On mobile, the cards stack cleanly with adequate touch targets and spacing. Pagination controls are obvious and easy to reach.

**Why this priority**: The shows list is the primary entry point and most-visited page. If browsing feels fast and scannable, the entire product feels polished.

**Independent Test**: Can be fully tested by loading `/shows` on mobile and desktop viewports, verifying that show cards are visually distinct, dates are prominent, venue metadata is scannable, and pagination controls are reachable and clear.

**Acceptance Scenarios**:

1. **Given** a user on the shows list page on a 375px viewport, **When** the page loads, **Then** each show card displays date, venue name, and location in a clear hierarchy with no horizontal overflow or truncation of critical information.
2. **Given** a user on the shows list on desktop, **When** they scan the page, **Then** dates are visually dominant (largest/boldest text), venue names are secondary, and location metadata is tertiary, enabling rapid vertical scanning.
3. **Given** a user performing a search, **When** results appear, **Then** the search input, result count feedback, and show cards maintain consistent spacing and alignment with the non-search view.
4. **Given** a user on the shows list, **When** they hover over a show card on desktop, **Then** a subtle interactive state change (elevation, border, or background shift) indicates the card is clickable.

---

### User Story 2 - Viewing a Show Detail Page with Polished Setlist Layout (Priority: P1)

A user navigates to a show detail page to view the full setlist. The page presents the show date, venue, and metadata prominently at the top, followed by setlist sections (Set I, Set II, Encore) with clear visual separation. Track rows are easy to scan with song titles, durations, and cover song indicators. The favorite button and back navigation are immediately visible. If album art or show images were available, they would appear in the header area, but the layout remains complete and attractive without them.

**Why this priority**: The show detail page is where users spend the most time reading setlists and playing audio. Layout quality directly impacts usability and perceived product quality.

**Independent Test**: Can be fully tested by navigating to any show detail page and verifying setlist readability, set grouping clarity, track interaction states, and metadata visibility across viewports.

**Acceptance Scenarios**:

1. **Given** a user on a show detail page, **When** the page loads, **Then** the show date is the most prominent element, venue and location are clearly visible, and set sections are visually distinct from one another.
2. **Given** a show with multiple sets, **When** the user scrolls through the setlist, **Then** each set is clearly labeled and visually separated, with tracks numbered and aligned consistently.
3. **Given** a user on mobile, **When** viewing a show detail, **Then** the back button, favorite toggle, and track rows are all reachable with comfortable touch targets (minimum 44px).
4. **Given** a track with a cover song badge, **When** displayed in the setlist, **Then** the badge is visually distinct but does not disrupt the scan rhythm of song titles and durations.

---

### User Story 3 - Navigating the App Shell and Header (Priority: P1)

A user navigates between shows, favorites, and login across the app. The header/navigation bar is refined with clear branding, consistent spacing, and obvious interactive elements. On mobile, navigation elements are accessible without a hamburger menu (the current nav is compact enough). The active page is indicated. Authentication state (logged in vs. logged out) is immediately clear from the header.

**Why this priority**: The app shell wraps every page. Navigation clarity and header polish create the baseline impression of quality.

**Independent Test**: Can be fully tested by navigating between all routes and verifying header consistency, active state indication, and auth-state visibility on mobile and desktop.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they view any page, **Then** the header displays the Reprise brand, a favorites link, the username, and a logout control in a clean, balanced layout.
2. **Given** a logged-out user, **When** they view any page, **Then** the header shows the Reprise brand and a login link, with no orphaned or misaligned elements.
3. **Given** a user on mobile, **When** they view the header, **Then** all navigation elements are visible without horizontal scrolling, and touch targets meet minimum size guidelines.
4. **Given** a user navigating between pages, **When** they arrive at a new route, **Then** there is a smooth, non-jarring transition with consistent layout structure.

---

### User Story 4 - Using the Login Page (Priority: P2)

A user arrives at the login page to authenticate. The page presents a clean, centered form with clear branding continuity from the main app. The username input is prominent, the submit button is obvious, and error states (e.g., empty username) are displayed inline with clear visual feedback. The page feels intentional rather than like a developer placeholder.

**Why this priority**: The login page is a user's first impression when authenticating. A polished login reinforces product quality, but it's visited less frequently than browse/detail pages.

**Independent Test**: Can be fully tested by visiting `/login`, submitting empty and valid usernames, and verifying form layout, error display, and successful redirect.

**Acceptance Scenarios**:

1. **Given** a user on the login page, **When** the page loads, **Then** the form is vertically centered, the Reprise brand is visible, and the username input is the clear focal point.
2. **Given** a user who submits an empty username, **When** the error is displayed, **Then** the error message appears near the input with a distinct visual treatment (color, icon, or border change) that does not shift the layout.
3. **Given** a user on a mobile device, **When** they focus the input field, **Then** the form remains visible and usable with the software keyboard open.

---

### User Story 5 - Viewing the Favorites Page (Priority: P2)

An authenticated user visits their favorites page. The page displays their saved shows using the same refined card pattern as the shows list, providing visual consistency. The empty state (no favorites yet) is warm and encouraging rather than stark, guiding the user to browse shows.

**Why this priority**: Favorites is a key engagement feature but used less frequently than browsing. Visual consistency with the shows list is more important than unique design.

**Independent Test**: Can be fully tested by viewing `/favorites` with and without saved shows, verifying card consistency with the shows list and empty state messaging.

**Acceptance Scenarios**:

1. **Given** a user with favorites, **When** they view the favorites page, **Then** show cards match the visual style of the main shows list (same hierarchy, spacing, hover states).
2. **Given** a user with no favorites, **When** they view the favorites page, **Then** an empty state displays with a clear message and a visual element (icon or illustration) that encourages browsing.
3. **Given** a user on mobile, **When** they view favorites, **Then** the layout is consistent with the mobile shows list experience.

---

### User Story 6 - Interacting with Shared UI Patterns (Priority: P2)

Across all pages, shared patterns like buttons, search inputs, cards, pagination controls, empty states, loading states, and error states use consistent, polished styling. Hover and focus states are visible. Loading spinners or skeleton indicators communicate async activity. Error boundaries display friendly messages with visual hierarchy.

**Why this priority**: Consistent shared patterns build trust and reduce cognitive load. Inconsistent button styles or spacing between pages undermines the polish of individual page improvements.

**Independent Test**: Can be fully tested by triggering loading states (slow network), error states (invalid routes), and interacting with all button variants, inputs, and pagination controls across pages.

**Acceptance Scenarios**:

1. **Given** any page in a loading state, **When** data is being fetched, **Then** a loading indicator appears that is visually consistent with the app's design language.
2. **Given** a user navigating to an invalid route, **When** the error boundary renders, **Then** a friendly error page displays with the app header intact, a clear message, and a link back to the shows list.
3. **Given** a user interacting with any button, **When** they hover and focus the button, **Then** distinct visual feedback appears for each state (hover, focus, active, disabled).

---

### User Story 7 - Incorporating Album Cover Art (Priority: P3)

Shows display album cover artwork sourced from Phish.in's `album_cover_url` field, stored as an optional `albumCoverUrl` on the Show model and populated during seed. Images appear in show detail headers and optionally as card accents on the shows list. When a show has no album cover URL, a default fallback image is displayed so the layout always includes a visual element. Images load progressively without layout shifts.

**Why this priority**: Visual content enhances the browsing experience and gives the app a premium, media-rich feel. A default fallback ensures consistent layout whether or not specific show artwork exists.

**Independent Test**: Can be fully tested by viewing show detail pages for shows with and without `albumCoverUrl` values, verifying the correct image or default fallback renders, and checking for no layout shift.

**Acceptance Scenarios**:

1. **Given** a show with an `albumCoverUrl` value, **When** the show detail page loads, **Then** the album cover image appears in the header or metadata area at an appropriate size without pushing content below the fold on mobile.
2. **Given** a show without an `albumCoverUrl` value (null), **When** the show detail page loads, **Then** a default fallback image is displayed in the same position and at the same size as a real album cover, maintaining identical layout.
3. **Given** a slow network connection, **When** an album cover image is loading, **Then** the surrounding content is immediately visible and the image loads in without causing layout shift.
4. **Given** the shows list page, **When** cards are displayed, **Then** album covers or the default fallback appear consistently across all cards regardless of data availability.

---

### Edge Cases

- What happens when a show card has an extremely long venue name? Text should truncate gracefully without breaking the card layout.
- How does the UI handle a very long setlist (20+ tracks in a single set)? The list should remain scannable without excessive vertical space.
- What happens when the shows list returns zero results from a search? A clear, styled empty state should appear with guidance to modify the search query.
- How does the layout behave when the audio player is open at the bottom and the user is on a short-content page (e.g., empty favorites)? The page content should not be obscured by the player.
- What happens on a very wide viewport (2560px+)? Content should remain centered and readable, not stretch to full width.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app shell header MUST display the Reprise brand, navigation links, and authentication state in a visually balanced layout across all viewports from 375px to 1440px+.
- **FR-002**: Show cards on the shows list and favorites pages MUST display date, venue name, and location in a clear three-level typographic hierarchy optimized for vertical scanning.
- **FR-003**: The shows list search input MUST have visible focus and filled states, with clear iconography and a result count or feedback indicator when search is active.
- **FR-004**: Pagination controls MUST be clearly styled, indicate the current page context, and be comfortably tappable on touch devices.
- **FR-005**: The show detail page MUST display the show date as the most prominent element, with venue, location, tour name, and duration as supporting metadata.
- **FR-006**: Set sections on the show detail page MUST be visually distinct from one another with clear labels and consistent track row formatting.
- **FR-007**: Track rows MUST display position, song title, cover badge (when applicable), and duration in a consistent, scannable layout with interactive hover/focus states for playable tracks.
- **FR-008**: The login page MUST present a centered, branded form with clear input styling, visible error states, and consistent spacing.
- **FR-009**: Empty states (no search results, no favorites) MUST display a styled message with visual context (icon or illustration) and a suggested next action.
- **FR-010**: Loading states MUST display a visually consistent indicator that matches the app's design language.
- **FR-011**: Error boundary pages MUST maintain the app header, display a friendly message, and provide navigation back to the shows list.
- **FR-012**: All interactive elements (buttons, links, cards, inputs) MUST display distinct hover, focus, and active states.
- **FR-013**: The audio player (both expanded and minimized states) MUST visually integrate with the refreshed design language, maintaining consistent typography, spacing, and color usage.
- **FR-014**: All pages MUST render without horizontal overflow on viewports from 375px to 1440px+, with content centered and constrained at large viewports.
- **FR-015**: Show detail pages and show cards MUST display album cover artwork from the Show's `albumCoverUrl` field when available. When `albumCoverUrl` is null, a default fallback image MUST be displayed in the same position and size. The layout MUST be identical regardless of whether the real or fallback image is shown.
- **FR-016**: The favorite toggle button MUST have clearly distinct filled (favorited) and outlined (unfavorited) states with smooth transition between them.

### Key Entities

- **Show**: Primary content entity. Displays date, venue (name, city, state, country), tour name, duration, and album cover image (with default fallback). Contains tracks organized by set.
- **Track**: Individual song performance within a show. Displays position, song title, duration, cover artist attribution, and playable state.
- **Venue**: Location context for shows. Displays name, city, state, country.
- **User**: Authenticated identity. Displays username in header. Determines favorite access.
- **Favorite**: Relationship between user and show. Drives heart icon state on show cards and detail pages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the date, venue, and location of any show within 2 seconds of the shows list loading, without needing to read full card text.
- **SC-002**: All pages score 90+ on Lighthouse accessibility audit with no critical violations.
- **SC-003**: All pages are fully usable on viewports from 375px to 1440px+ with no horizontal scroll, overlapping elements, or truncated critical content.
- **SC-004**: Interactive elements (buttons, links, card clicks) provide visible feedback within 100ms of user interaction.
- **SC-005**: Page layouts do not shift when content loads (Cumulative Layout Shift score below 0.1).
- **SC-006**: Users can navigate from the shows list to a show detail and back to the shows list within 3 taps/clicks.
- **SC-007**: Empty states and error states communicate the situation and next action clearly enough that users do not need external help to proceed.
- **SC-008**: The visual design is consistent across all pages — shared elements (cards, buttons, typography scale, spacing, colors) are uniform throughout.

## Assumptions

- The existing React Router v7, TypeScript, Tailwind CSS, and shadcn/ui architecture is preserved. No framework or library changes are required.
- Inter remains the primary typeface. Typography improvements focus on sizing, weight, and spacing hierarchy rather than font changes.
- One small schema addition is required: an optional `albumCoverUrl` field on the Show model, populated from Phish.in's `album_cover_url` during seed. No other data model changes are needed.
- Image availability from the Phish.in API or existing data model is limited. The design must work fully without images and treat them as optional enhancements.
- The current monochrome/neutral OKLCH color palette is the baseline. Refinements may adjust specific token values but should maintain the understated, premium tone.
- The audio player's functionality is unchanged. Only its visual styling is refined to match the updated design language.
- No new routes or pages are introduced. The refresh applies to the existing six routes and shared components.
- The current max-width constraint (max-w-3xl) may be adjusted if a wider content area improves readability, but the centered layout approach is preserved.
