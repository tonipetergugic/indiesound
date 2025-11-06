"use client";

import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from "react";

export type Track = {
  title: string;
  artist: string;
  coverUrl: string | null;
  audioUrl: string | null;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  setPlayingState: (playing: boolean) => void;
  setQueue: (tracks: Track[], startIndex: number) => void;
  setQueueAndPlay: (tracks: Track[], startIndex: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  handleTrackEnd: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // currentTrack wird dynamisch aus queue[currentIndex] abgeleitet
  const currentTrack = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < queue.length) {
      return queue[currentIndex];
    }
    return null;
  }, [queue, currentIndex]);

  const playTrack = useCallback((track: Track) => {
    // Prüfe, ob der Track bereits in der Queue ist
    const trackIndex = queue.findIndex(
      (t) => t.audioUrl === track.audioUrl && t.title === track.title
    );

    if (trackIndex >= 0) {
      // Track ist in der Queue, springe dorthin
      setCurrentIndex(trackIndex);
      setIsPlaying(true);
    } else {
      // Track ist nicht in der Queue, setze neue Queue mit diesem Track
      setQueueState([track]);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [queue]);

  const setQueue = useCallback((tracks: Track[], startIndex: number) => {
    if (tracks.length === 0) {
      setQueueState([]);
      setCurrentIndex(-1);
      setIsPlaying(false);
      return;
    }

    const validStartIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    setQueueState(tracks);
    setCurrentIndex(validStartIndex);
    setIsPlaying(true);
  }, []);

  const setQueueAndPlay = useCallback((tracks: Track[], startIndex: number) => {
    if (tracks.length === 0) {
      setQueueState([]);
      setCurrentIndex(-1);
      setIsPlaying(false);
      return;
    }

    const validStartIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    setQueueState(tracks);
    setCurrentIndex(validStartIndex);
    setIsPlaying(true);
  }, []);

  const nextTrack = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setIsPlaying(true);
    } else {
      // Ende der Queue erreicht
      setIsPlaying(false);
    }
  }, [queue, currentIndex]);

  const prevTrack = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setIsPlaying(true);
    } else if (currentIndex === 0) {
      // Am Anfang, starte Track neu
      setIsPlaying(true);
    }
  }, [currentIndex]);

  const handleTrackEnd = useCallback(() => {
    // Automatisch zum nächsten Track wechseln
    nextTrack();
  }, [nextTrack]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const setPlayingState = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        currentIndex,
        playTrack,
        togglePlay,
        pause,
        setPlayingState,
        setQueue,
        setQueueAndPlay,
        nextTrack,
        prevTrack,
        handleTrackEnd,
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
