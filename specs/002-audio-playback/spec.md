# Feature Specification: Audio Playback

**Feature Branch**: `002-audio-playback`
**Created**: 2026-03-27
**Status**: Draft (Clarified)
**Input**: User description: "Add audio playback to Reprise. Users can play individual tracks from the show detail page. A persistent audio player in the root layout continues playback across page navigation. Support play/pause, next/previous track, progress scrubbing, and sequential set playback. Audio URLs come from the Phish.in API v2 mp3_url field (already available, no API key needed). Track mp3 URLs should be stored during seeding."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Track from the Show Detail Page (Priority: P1)

A fan is browsing a show's setlist and wants to hear a specific song. They
click on any track row in the setlist. A persistent audio player appears
at the bottom of the screen (overlaying page content) and begins playing
the selected track. The player shows the song title, show date, venue,
and a progress bar. The fan can pause and resume playback. The player
includes a close button to dismiss it and a minimize option. The audio
continues playing even as the fan navigates to other pages (shows list,
favorites, another show detail).

**Why this priority**: Playing a single track is the foundational interaction.
Without this, no other audio feature (next/previous, sequential playback)
has a reason to exist. This story alone transforms Reprise from a reference
tool into a listening experience.

**Independent Test**: Can be fully tested by navigating to a show detail page,
clicking play on a track, verifying audio begins, then navigating to `/shows`
and confirming audio continues playing.

**Acceptance Scenarios**:

1. **Given** a show detail page with a setlist, **When** the user clicks on a track row, **Then** the persistent player appears at the bottom of the screen (overlaying content) and begins playing that track's audio. The track number column shows a playing indicator.
2. **Given** a track is playing, **When** the user clicks on the currently playing track row, **Then** playback pauses and the playing indicator changes to a paused state. Clicking again resumes from the same position.
3. **Given** a track row in the setlist, **When** the user hovers over it, **Then** the track number column shows a play icon to indicate it is clickable.
4. **Given** a track is playing, **When** the user navigates to a different page (shows list, another show, favorites), **Then** the audio continues playing without interruption and the player remains visible.
5. **Given** the persistent player is showing, **When** the user clicks the close (X) button, **Then** playback stops and the player is dismissed.
6. **Given** the persistent player is showing, **When** the user clicks the minimize button, **Then** the player collapses to a compact bar showing only essential controls (play/pause, track title).

---

### User Story 2 - Progress Scrubbing and Track Info (Priority: P2)

A fan wants to skip to a specific part of a song — maybe the jam section
starts 8 minutes in. They click or drag on the progress bar in the persistent
player to seek to any position in the track. The player displays the current
time and total duration. The currently playing track is visually highlighted
in the setlist when the user is on that show's detail page.

**Why this priority**: Scrubbing turns passive listening into active
exploration. Phish fans specifically care about finding jam sections, and
without seek capability the player is frustrating for long tracks (10-30+
minutes).

**Independent Test**: Can be tested by playing a track, clicking on the
progress bar at various positions, and verifying the audio jumps to the
correct time. Verify the time display updates in real time.

**Acceptance Scenarios**:

1. **Given** a track is playing, **When** the user clicks on the progress bar at the 50% mark, **Then** playback jumps to the midpoint of the track.
2. **Given** a track is playing, **When** the user drags the progress scrubber, **Then** the current time updates in real time and playback resumes from the released position.
3. **Given** a track is playing, **When** the player is visible, **Then** the current elapsed time and total duration are displayed (e.g., "3:42 / 12:05").
4. **Given** a track is playing on a show, **When** the user is viewing that show's detail page, **Then** the currently playing track is visually highlighted in the setlist.

---

### User Story 3 - Sequential Set Playback with Next/Previous (Priority: P3)

A fan wants to listen to an entire set (or the whole show) without
clicking each track individually. When a track finishes, the next track
in the set plays automatically. The player provides next and previous
buttons to skip between tracks. When the last track in a set finishes,
playback stops (does not auto-advance to the next set).

**Why this priority**: Sequential playback is what makes this a real music
player rather than a track previewer. It depends on P1 (single track
playback) being solid first, but delivers the "put on a show and listen"
experience that Phish fans want.

**Independent Test**: Can be tested by playing the first track in a set and
verifying that subsequent tracks auto-play in order. Test next/previous
buttons skip correctly. Verify playback stops at end of set.

**Acceptance Scenarios**:

1. **Given** a track is playing, **When** it finishes, **Then** the next track in the same set automatically begins playing.
2. **Given** a track is playing, **When** the user clicks the next button, **Then** the next track in the set begins playing. If it is the last track in the set, the next button is disabled.
3. **Given** a track is playing and the user is less than 5 seconds into the track, **When** the user clicks the previous button, **Then** the previous track in the set begins playing. If it is the first track in the set, the previous button restarts the current track.
4. **Given** a track is playing and the user is 5 or more seconds into the track, **When** the user clicks the previous button, **Then** the current track restarts from the beginning.
5. **Given** the last track in a set finishes, **When** there are additional sets in the show, **Then** playback stops and does not auto-advance to the next set.
6. **Given** a track is playing from a specific show, **When** the user navigates away and then returns to that show's detail page, **Then** the currently playing track is still highlighted in the setlist.

---

### Edge Cases

- What happens when a track has no audio URL (mp3_url is null)? The play button is hidden or disabled for that track, and the track is skipped during sequential playback.
- What happens when an audio stream fails to load (network error, 404)? The player shows an error message and auto-advances to the next track if in sequential mode.
- What happens when the user starts playing a track from a different show while one is already playing? The currently playing track stops and the new track begins.
- What happens on mobile (375px) with the persistent player? The player is compact, showing only essential controls (play/pause, track title) with the progress bar, and does not obscure page content.
- What happens when the browser tab is backgrounded? Audio continues playing (standard browser audio behavior).

## Clarifications

### Session 2026-03-27

- Q: Should the player have a close/dismiss button? → A: Yes, an X icon to stop playback and dismiss. Also a minimize option to collapse to a compact bar.
- Q: What happens with "previous" partway through a track? → A: If <5 seconds in, go to previous track. If >=5 seconds in, restart current track.
- Q: Should the player show set name alongside track info? → A: Show song title, show date, and venue. Set name not needed. Cover art may be added during polish phase.
- Q: Fixed bar or overlay? → A: Overlay — the player sits on top of page content, no padding adjustment needed.
- Q: Play buttons per track or clickable rows? → A: Clickable track rows. Track number shows play icon on hover, playing/paused indicator for active track. Clicking the active track toggles pause.

### Session 2026-03-27 (Round 2)

- Q: Show date format in the player? → A: MM/DD/YYYY format.
- Q: Player z-index and interaction with nav sheet on mobile? → A: Player remains visible while sheet is open. The sheet won't have enough links to overlap the player area.
- Q: What happens when clicking a track from a different show while one is playing? → A: Queue resets to the new show's set. The user has navigated to a different show detail page, so the queue should pick up from there.
- Q: Error message display when audio fails? → A: Brief inline message in the player itself (e.g., "Track unavailable"). If one track fails, the others likely will too.
- Q: Duration display for tracks with unknown duration? → A: Show "--:--" until `loadedmetadata` fires with the actual duration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store audio URLs (`mp3_url`) for each track in the database, populated during the seeding process.
- **FR-002**: Track rows on the show detail page MUST be clickable to initiate playback. The track number column MUST show a play icon on hover and a playing/paused indicator for the active track.
- **FR-003**: System MUST provide a persistent audio player rendered in the root layout that overlays page content and survives page navigation.
- **FR-004**: The audio player MUST support play and pause controls. Clicking the currently playing track row MUST toggle pause.
- **FR-005**: The audio player MUST display the currently playing track's song title, show date, and venue name.
- **FR-006**: The audio player MUST provide a progress bar that displays elapsed time and total duration.
- **FR-007**: The audio player MUST support seeking by clicking or dragging on the progress bar.
- **FR-008**: System MUST auto-advance to the next track in the same set when the current track finishes.
- **FR-009**: The audio player MUST provide next and previous track buttons for within-set navigation. The previous button MUST restart the current track if 5+ seconds in, otherwise go to the previous track.
- **FR-010**: System MUST visually highlight the currently playing track on the show detail page.
- **FR-011**: The audio player MUST be responsive, adapting from mobile (375px) to desktop (1440px+).
- **FR-012**: System MUST handle missing audio URLs gracefully (no play affordance on track row, skip during sequential playback).
- **FR-013**: System MUST handle audio loading errors with a user-visible error state and auto-advance.
- **FR-014**: The audio player MUST provide a close button (X) that stops playback and dismisses the player entirely.
- **FR-015**: The audio player MUST provide a minimize option that collapses it to a compact bar showing play/pause and track title only.

### Key Entities

- **Track** (existing, modified): Add `mp3Url` field — the Phish.in audio stream URL for this track performance. Nullable (some tracks may not have audio).
- **Player State** (client-only): The currently playing track, playback status (playing/paused), current time, duration, and the ordered list of tracks in the current set for sequential navigation. Not persisted to the database.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can begin audio playback of a track within 1 second of clicking the play button.
- **SC-002**: Audio playback continues uninterrupted through at least 3 page navigations.
- **SC-003**: Seeking to a position on the progress bar results in playback resuming from that position within 2 seconds.
- **SC-004**: Sequential playback advances to the next track within 1 second of the previous track ending.
- **SC-005**: The persistent player is fully usable on mobile (375px) without obscuring primary page content.

## Assumptions

- Audio URLs from the Phish.in API v2 (`mp3_url` field on tracks) are publicly accessible without authentication.
- The browser's native `<audio>` element provides sufficient playback capability — no third-party audio library is needed.
- Audio playback state is client-only (React context) and not persisted to the database or session.
- The persistent player is rendered in the root layout via React context, not as part of individual route components.
- Volume control is handled by the browser/OS — a custom volume slider is out of scope for this feature.
- Shuffle, repeat, and cross-set auto-play are out of scope for this feature.
- The existing seed script will need a migration to add `mp3Url` to the Track model and a re-seed to populate the URLs.
