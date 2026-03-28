import { createContext, useContext } from "react";

export interface PlayableTrack {
  id: string;
  mp3Url: string;
  songTitle: string;
  showDate: string; // "YYYY-MM-DD"
  venueName: string;
  setName: string;
  position: number;
}

export interface PlayerContextValue {
  // State
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  currentTime: number; // seconds
  duration: number; // seconds
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
  previous: () => void;
  seek: (time: number) => void;
  minimize: () => void;
  expand: () => void;
  close: () => void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
