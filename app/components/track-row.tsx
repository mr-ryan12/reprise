import { useFetcher } from "react-router";
import { Heart, Pause, Play } from "lucide-react";
import { usePlayer, type PlayableTrack } from "~/lib/player-context";
import { Badge } from "~/components/ui/badge";

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
  setTracks: PlayableTrack[];
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TrackRow({
  track,
  showDate,
  venueName,
  setName,
  setTracks,
  isFavorited = false,
  isLoggedIn = false,
}: TrackRowProps) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayer();
  const fetcher = useFetcher();

  // Optimistic: if fetcher is submitting, toggle from current state
  const optimisticFavorited =
    fetcher.state !== "idle" ? !isFavorited : isFavorited;

  const isCurrentTrack = currentTrack?.id === track.id;
  const isPlayable = Boolean(track.mp3Url);

  function handleClick() {
    if (!isPlayable) return;

    if (isCurrentTrack && isPlaying) {
      pause();
    } else if (isCurrentTrack && !isPlaying) {
      resume();
    } else {
      play(
        {
          id: track.id,
          mp3Url: track.mp3Url!,
          songTitle: track.song.title,
          showDate,
          venueName,
          setName,
          position: track.position,
        },
        setTracks
      );
    }
  }

  return (
    <div
      role={isPlayable ? "button" : undefined}
      tabIndex={isPlayable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isPlayable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`flex items-center justify-between gap-3 px-4 py-3 ${
        isPlayable
          ? "cursor-pointer transition-colors hover:bg-accent/50"
          : ""
      } ${isCurrentTrack ? "bg-accent/40" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex w-6 shrink-0 items-center justify-center text-xs tabular-nums text-muted-foreground">
          {isCurrentTrack && isPlaying ? (
            <span className="equalizer flex items-end gap-0.5" aria-label="Playing">
              <span className="equalizer-bar h-2.5 w-0.75 rounded-sm bg-primary" />
              <span className="equalizer-bar h-3.5 w-0.75 rounded-sm bg-primary" />
              <span className="equalizer-bar h-2 w-0.75 rounded-sm bg-primary" />
            </span>
          ) : isCurrentTrack && !isPlaying ? (
            <Pause className="size-3.5 text-primary" />
          ) : isPlayable ? (
            <span className="group-track relative">
              <span className="track-number">{track.position}</span>
              <Play className="track-play-icon absolute inset-0 m-auto hidden size-3.5" />
            </span>
          ) : (
            track.position
          )}
        </span>
        <span
          className={`truncate font-medium ${isCurrentTrack ? "text-primary" : ""}`}
        >
          {track.song.title}
        </span>
        {!track.song.original && track.song.artist && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            {track.song.artist}
          </Badge>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {track.duration && (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatDuration(track.duration)}
          </span>
        )}
        {isLoggedIn && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetcher.submit(
                { intent: "track-favorite", trackId: track.id },
                { method: "post" },
              );
            }}
            className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
            aria-label={optimisticFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`size-3.5 transition-colors ${
                optimisticFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground/50 hover:text-foreground"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
