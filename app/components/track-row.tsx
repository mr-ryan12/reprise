import { Pause, Play } from "lucide-react";
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
}: TrackRowProps) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayer();

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
      className={`flex items-center justify-between px-4 py-2.5 ${
        isPlayable
          ? "cursor-pointer transition-colors hover:bg-accent/50"
          : ""
      } ${isCurrentTrack ? "bg-accent/30" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex w-6 items-center justify-center text-right text-xs text-muted-foreground">
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
        <span className={`font-medium ${isCurrentTrack ? "text-primary" : ""}`}>
          {track.song.title}
        </span>
        {!track.song.original && track.song.artist && (
          <Badge variant="secondary" className="text-xs">
            {track.song.artist}
          </Badge>
        )}
      </div>
      {track.duration && (
        <span className="text-sm text-muted-foreground">
          {formatDuration(track.duration)}
        </span>
      )}
    </div>
  );
}
