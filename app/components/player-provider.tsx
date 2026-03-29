import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PlayerContext,
  type PlayableTrack,
  type PlayerContextValue,
} from "~/lib/player-context";
import { AudioPlayer } from "~/components/audio-player";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasNext = queueIndex < queue.length - 1;
  const hasPrevious = queueIndex > 0;

  const playTrackAtIndex = useCallback(
    (index: number, trackQueue: PlayableTrack[]) => {
      const track = trackQueue[index];
      if (!track || !audioRef.current) return;

      setCurrentTrack(track);
      setQueueIndex(index);
      setError(null);
      setCurrentTime(0);
      setDuration(0);

      audioRef.current.src = track.mp3Url;
      audioRef.current.play().catch(() => {
        // Browser may block autoplay; handled by error event
      });
    },
    []
  );

  const play = useCallback(
    (track: PlayableTrack, newQueue: PlayableTrack[]) => {
      setQueue(newQueue);
      const index = newQueue.findIndex((t) => t.id === track.id);
      playTrackAtIndex(index >= 0 ? index : 0, newQueue);
      // Only expand if the player isn't already open
      setIsMinimized((prev) => (currentTrack ? prev : false));
    },
    [playTrackAtIndex, currentTrack]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const findNextPlayableIndex = useCallback(
    (fromIndex: number, trackQueue: PlayableTrack[]) => {
      for (let i = fromIndex + 1; i < trackQueue.length; i++) {
        if (trackQueue[i].mp3Url) return i;
      }
      return -1;
    },
    []
  );

  const next = useCallback(() => {
    const nextIndex = findNextPlayableIndex(queueIndex, queue);
    if (nextIndex >= 0) {
      playTrackAtIndex(nextIndex, queue);
    }
  }, [queueIndex, queue, findNextPlayableIndex, playTrackAtIndex]);

  const previous = useCallback(() => {
    if (!audioRef.current) return;

    // If 5+ seconds in, restart current track
    if (audioRef.current.currentTime >= 5) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    // Otherwise go to previous track
    for (let i = queueIndex - 1; i >= 0; i--) {
      if (queue[i].mp3Url) {
        playTrackAtIndex(i, queue);
        return;
      }
    }

    // No previous playable track — restart current
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [queueIndex, queue, playTrackAtIndex]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  }, []);

  const minimize = useCallback(() => setIsMinimized(true), []);
  const expand = useCallback(() => setIsMinimized(false), []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsMinimized(false);
    setError(null);
  }, []);

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      const nextIndex = findNextPlayableIndex(queueIndex, queue);
      if (nextIndex >= 0) {
        playTrackAtIndex(nextIndex, queue);
      } else {
        setIsPlaying(false);
      }
    };

    const onError = () => {
      setError("Track unavailable");
      setIsPlaying(false);

      // Auto-advance after 2s if there's a next track
      const nextIndex = findNextPlayableIndex(queueIndex, queue);
      if (nextIndex >= 0) {
        setTimeout(() => {
          playTrackAtIndex(nextIndex, queue);
        }, 2000);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [queueIndex, queue, findNextPlayableIndex, playTrackAtIndex]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      isMinimized,
      error,
      queue,
      queueIndex,
      hasNext,
      hasPrevious,
      play,
      pause,
      resume,
      togglePlayPause,
      next,
      previous,
      seek,
      minimize,
      expand,
      close,
    }),
    [
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      isMinimized,
      error,
      queue,
      queueIndex,
      hasNext,
      hasPrevious,
      play,
      pause,
      resume,
      togglePlayPause,
      next,
      previous,
      seek,
      minimize,
      expand,
      close,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" className="hidden" />
      <AudioPlayer />
    </PlayerContext.Provider>
  );
}
