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

function ProgressBar({ slim = false }: { slim?: boolean }) {
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

  const dotSize = slim ? "size-2.5" : "size-3";
  const dotOffset = slim ? `calc(${progress}% - 5px)` : `calc(${progress}% - 6px)`;

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor(currentTime)}
      tabIndex={0}
      className={`group relative w-full cursor-pointer bg-muted ${
        slim ? "h-1" : "h-2 rounded-full"
      }`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 5));
        if (e.key === "ArrowLeft") seek(Math.max(0, currentTime - 5));
      }}
    >
      <div
        className={`absolute inset-y-0 left-0 bg-primary transition-[width] duration-100 ${
          slim ? "" : "rounded-full"
        }`}
        style={{ width: `${progress}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${dotSize} rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100`}
        style={{ left: dotOffset }}
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
          <p className="truncate text-sm font-semibold leading-snug tracking-tight">
            {currentTrack.songTitle}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatShowDate(currentTrack.showDate)} &middot;{" "}
            {currentTrack.venueName}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={minimize}
            aria-label="Minimize player"
            className="text-muted-foreground hover:text-foreground"
          >
            <Minimize2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={close}
            aria-label="Close player"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      <div className="mt-2.5">
        <ProgressBar />
        <div className="mt-1 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-3">
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
          className="transition-colors"
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
  const {
    currentTrack,
    isPlaying,
    error,
    hasNext,
    hasPrevious,
    currentTime,
    togglePlayPause,
    previous,
    next,
    expand,
    close,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div>
      <ProgressBar slim />
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={previous}
          disabled={!hasPrevious && currentTime < 5}
          aria-label="Previous track"
        >
          <SkipBack className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="transition-colors"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={next}
          disabled={!hasNext}
          aria-label="Next track"
        >
          <SkipForward className="size-3.5" />
        </Button>
        <div className="ml-1 min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug tracking-tight">
            {currentTrack.songTitle}
          </p>
          {error && (
            <p className="truncate text-xs text-destructive">{error}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={expand}
          aria-label="Expand player"
          className="text-muted-foreground hover:text-foreground"
        >
          <Maximize2 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={close}
          aria-label="Close player"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function AudioPlayer() {
  const { currentTrack, isMinimized } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 shadow-lg backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        {isMinimized ? <MinimizedPlayer /> : <ExpandedPlayer />}
      </div>
    </div>
  );
}
