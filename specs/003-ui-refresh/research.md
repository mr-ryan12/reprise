# Research: UI Refresh

**Date**: 2026-03-28
**Feature**: 003-ui-refresh

## R1: Album Cover Image Source

**Decision**: Add optional `albumCoverUrl String?` field to the Show model in Prisma, populated during seed from Phish.in API's `album_cover_url` property on the `/shows` endpoint response.

**Rationale**: The Phish.in API already returns `album_cover_url` on show objects. The current `PhishinShowSummary` type and seed script simply don't capture it. A single optional field addition and seed update is the lowest-risk path — no runtime API calls, no new external dependencies.

**Alternatives considered**:
- Runtime fetch from Phish.in on page load: Rejected — adds latency, rate limiting concerns, and external dependency at render time.
- Separate image service/CDN: Rejected — over-engineered for MVP; the API URLs are already CDN-hosted.
- Drop images entirely: Rejected — user confirmed they want album covers with a default fallback.

## R2: Default Fallback Image Strategy

**Decision**: Use a locally-hosted static SVG or lightweight image in `public/` as the default fallback when `albumCoverUrl` is null. Render via `<img>` tag with the same dimensions as a real album cover. Use `loading="lazy"` on all album cover images.

**Rationale**: A local static asset loads instantly, avoids external dependency for the fallback case, and can be styled to match the app's design language (e.g., a subtle Phish/music-themed placeholder). Using consistent `<img>` dimensions prevents layout shift regardless of source.

**Alternatives considered**:
- CSS background gradient as placeholder: Rejected — harder to maintain consistent aspect ratio with `<img>` elements.
- No image when null (empty space): Rejected — user explicitly requested a default image always be shown.

## R3: Content Width Decision

**Decision**: Keep `max-w-3xl` (768px) as the primary content constraint. This width works well for the list-based, text-heavy content (show cards, setlists) and maintains readability. The show detail page may use a slightly wider header area for album art placement, but the setlist content itself stays at 768px.

**Rationale**: The current 768px width is optimal for scanning dates, venue names, and track listings. Wider layouts would create excessive line lengths for metadata and require multi-column approaches that add complexity without clear benefit for this content type.

**Alternatives considered**:
- `max-w-4xl` (896px): Considered — would allow more breathing room for show cards with album art thumbnails, but 768px is sufficient with a compact image size.
- `max-w-5xl` (1024px): Rejected — too wide for single-column text content.

## R4: Typography Scale Refinements

**Decision**: Refine the existing Inter-based type scale with clearer size differentiation between hierarchy levels. Use weight and size together to create three distinct tiers:
- **Tier 1 (primary)**: Dates, page titles — `text-xl` to `text-2xl`, `font-semibold` or `font-bold`
- **Tier 2 (secondary)**: Venue names, set labels, song titles — `text-base`, `font-medium`
- **Tier 3 (tertiary)**: Location, metadata, durations — `text-sm`, `font-normal`, `text-muted-foreground`

**Rationale**: The current UI uses `text-2xl` for titles and `text-sm` for most other content, creating a binary hierarchy. Adding a clear middle tier (venue names at `text-base font-medium`) improves scannability without changing the typeface.

**Alternatives considered**:
- Introducing a display font for titles: Rejected — constitution and frontend-design skill specify Inter as primary, with no novelty fonts.
- Using letter-spacing variations: Considered as accent — `tracking-tight` on dates, `tracking-wide uppercase text-xs` for set labels could add distinction.

## R5: Color Palette Refinements

**Decision**: Maintain the monochrome OKLCH palette as the foundation. Introduce one subtle warm accent for interactive/active states (e.g., a muted amber or warm gray) to replace the current pure neutral hover states. Keep the red heart color for favorites. Adjust dark mode card/border contrast for better visual separation.

**Rationale**: The current palette is entirely achromatic (zero chroma in all tokens). A single warm accent adds personality and visual warmth appropriate for a music app without breaking the understated tone. The frontend-design skill calls for "restrained color intentionally."

**Alternatives considered**:
- Full color overhaul with multiple accent colors: Rejected — conflicts with "understated, premium" direction.
- Keep purely monochrome: Considered — functional but lacks the "memorable" quality the frontend-design skill encourages.

## R6: Show Card Layout with Album Art

**Decision**: Show cards on the list page include a small album cover thumbnail (48-56px square, rounded) on the left side of the card. Date, venue, and location stack vertically to the right. Favorite indicator remains on the far right. On mobile, the thumbnail scales slightly smaller but remains visible.

**Rationale**: A small thumbnail adds visual richness without dominating the text-first scanning pattern. The fixed square size prevents layout shift. The default fallback image maintains consistent card dimensions.

**Alternatives considered**:
- Large card images (full-width or half-card): Rejected — reduces information density, makes scanning slower.
- Images only on detail pages, not list: Considered — viable alternative, but thumbnails on cards significantly elevate the browsing experience.
- No images on list, only on detail: Lower risk but misses the opportunity to make the list feel premium.

## R7: Show Detail Album Art Placement

**Decision**: On the show detail page, display the album cover at a larger size (120-160px on desktop, 80-100px on mobile) alongside the show metadata header. The image sits to the left of the date/venue/metadata stack, creating a visual anchor. On mobile, the image may appear above the metadata or inline at a smaller size.

**Rationale**: The detail page has more vertical space and benefits from a prominent visual element. Placing it in the header associates it with the show context without interfering with the setlist below.

**Alternatives considered**:
- Full-width banner image: Rejected — too dominant for shows without art (fallback would look odd at full width).
- Background image with overlay: Rejected — adds complexity, potential readability issues, and the fallback case would look empty.

## R8: Loading State Approach

**Decision**: Use subtle opacity transitions and the existing Loader2 spinner for async states. Avoid skeleton screens — the pages load fast enough via SSR that skeletons would flash. The search input already has a spinner; extend this pattern to other async indicators (favorite toggle, navigation).

**Rationale**: React Router with SSR means most page content is available on first paint. Skeleton screens are appropriate for client-fetched content but would be premature for server-rendered pages. The spinner pattern is already established and works well.

**Alternatives considered**:
- Full skeleton screen system: Rejected — SSR makes initial content available immediately; skeletons would flash briefly and add visual noise.
- No loading indicators: Rejected — search and favorite actions need feedback.
