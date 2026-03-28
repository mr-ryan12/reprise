import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";
import { usePlayer } from "~/lib/player-context";
import { Button } from "~/components/ui/button";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatShowDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${month}/${day}/${year}`;
}

function ProgressBar() {
  const { currentTime, duration, seek } = usePlayer();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(duration, fraction * duration)));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (duration <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (duration <= 0 || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(duration, fraction * duration)));
  }

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor(currentTime)}
      tabIndex={0}
      className="group relative h-2 w-full cursor-pointer rounded-full bg-muted"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 5));
        if (e.key === "ArrowLeft") seek(Math.max(0, currentTime - 5));
      }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
        style={{ left: `calc(${progress}% - 6px)` }}
      />
    </div>
  );
}

function ExpandedPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    error,
    hasNext,
    hasPrevious,
    togglePlayPause,
    next,
    previous,
    minimize,
    close,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentTrack.songTitle}</p>
          <p className="truncate text-xs text-muted-foreground">
            {formatShowDate(currentTrack.showDate)} &middot; {currentTrack.venueName}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={minimize}
            aria-label="Minimize player"
          >
            <Minimize2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={close}
            aria-label="Close player"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}

      <div className="mt-2">
        <ProgressBar />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={previous}
          disabled={!hasPrevious && currentTime < 5}
          aria-label="Previous track"
        >
          <SkipBack className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={next}
          disabled={!hasNext}
          aria-label="Next track"
        >
          <SkipForward className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function MinimizedPlayer() {
  const { currentTrack, isPlaying, error, togglePlayPause, expand, close } =
    usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        )}
      </Button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{currentTrack.songTitle}</p>
        {error && <p className="truncate text-xs text-destructive">{error}</p>}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={expand}
        aria-label="Expand player"
      >
        <Maximize2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={close}
        aria-label="Close player"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export function AudioPlayer() {
  const { currentTrack, isMinimized } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
      <div className="mx-auto max-w-3xl">
        <div className="hidden sm:block">
          {isMinimized ? <MinimizedPlayer /> : <ExpandedPlayer />}
        </div>
        <div className="sm:hidden">
          <MinimizedPlayer />
        </div>
      </div>
    </div>
  );
}
