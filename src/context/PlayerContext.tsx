"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Track = {
  title: string;
  artist: string;
  coverUrl: string | null;
  audioUrl: string | null;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  setPlayingState: (playing: boolean) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const setPlayingState = (playing: boolean) => {
    setIsPlaying(playing);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        pause,
        setPlayingState,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
