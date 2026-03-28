# Player Context Contract: Audio Playback

**Date**: 2026-03-27
**Feature Branch**: `002-audio-playback`

## Context API

### Types (`app/lib/player-context.ts`)

```typescript
interface PlayableTrack {
  id: string;
  mp3Url: string;
  songTitle: string;
  showDate: string;       // "YYYY-MM-DD"
  venueName: string;
  setName: string;
  position: number;
}

interface PlayerContextValue {
  // State
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  currentTime: number;    // seconds
  duration: number;       // seconds
  isMinimized: boolean;
  error: string | null;

  // Queue info
  queue: PlayableTrack[];
  queueIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;

  // Actions
  play: (track: PlayableTrack, queue: PlayableTrack[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;   // <5s: previous track, >=5s: restart
  seek: (time: number) => void;
  minimize: () => void;
  expand: () => void;
  close: () => void;      // stops playback + hides player
}
```

### Hook

```typescript
function usePlayer(): PlayerContextValue
```

Throws if used outside `PlayerProvider`.

## Provider (`app/components/player-provider.tsx`)

- Wraps the app in `root.tsx` (inside `App` component, after the `<header>`)
- Manages a single `<audio>` element via `useRef`
- Renders the `<audio>` element (hidden) and the `AudioPlayer` UI component
- Handles `timeupdate`, `ended`, `error`, `loadedmetadata` events on `<audio>`
- On `ended`: auto-advances to next track in queue (same set only)
- On `error`: sets error state, auto-advances after 2s if queue has next

## Show Detail Integration

### Track Data Flow

The show detail loader already returns tracks with songs. The `mp3Url` field
flows through without any service changes:

```
Loader (shows.$showDate.tsx)
  → getShowByDate() returns tracks with mp3Url
  → Serialized to client
  → TrackRow reads mp3Url + player context
  → Click dispatches play(track, setTracks)
```

### TrackRow Component (`app/components/track-row.tsx`)

Props:
```typescript
interface TrackRowProps {
  track: {
    id: string;
    position: number;
    duration: number | null;
    mp3Url: string | null;
    song: {
      title: string;
      original: boolean;
      artist: string | null;
    };
  };
  showDate: string;
  venueName: string;
  setName: string;
  setTracks: PlayableTrack[];  // all playable tracks in this set
}
```

Behavior:
- **Has mp3Url**: Clickable. Hover shows play icon. Click calls `play(track, setTracks)`.
- **No mp3Url**: Not clickable. No hover effect. Track number always visible.
- **Is current track + playing**: Shows animated equalizer indicator. Click calls `pause()`.
- **Is current track + paused**: Shows paused indicator. Click calls `resume()`.

## AudioPlayer Component (`app/components/audio-player.tsx`)

Reads from `usePlayer()` context. Renders nothing if `currentTrack` is null.

### Expanded State
- Track info: song title, show date (formatted), venue name
- Progress bar: clickable/draggable, shows elapsed / total time
- Controls: previous, play/pause, next
- Actions: minimize button, close (X) button

### Minimized State
- Compact single row: play/pause button, track title (truncated), expand button, close (X)

### Responsive
- Mobile (375px): Same as minimized layout
- Desktop: Full expanded layout
