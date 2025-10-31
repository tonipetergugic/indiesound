"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, setPlayingState } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Track previous track URL to detect when it changes
  const previousTrackUrlRef = useRef<string | null>(null);

  // Handle track changes and play/pause toggling
  useEffect(() => {
    if (!audioRef.current) return;

    // If no track selected, pause and clear
    if (!currentTrack?.audioUrl) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setProgress(0);
      previousTrackUrlRef.current = null;
      return;
    }

    const newTrackUrl = currentTrack.audioUrl;
    const isSameTrack = previousTrackUrlRef.current === newTrackUrl;

    // If it's a different track, load the new source
    if (!isSameTrack) {
      audioRef.current.src = newTrackUrl;
      setProgress(0);
      previousTrackUrlRef.current = newTrackUrl;
    }

    // Control play/pause based on isPlaying state
    // This does NOT reset currentTime - it preserves the current playback position
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setPlayingState(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, setPlayingState]);

  // Update progress from audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!isDragging && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration) {
        setProgress(0);
      }
    });

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [isDragging]);

  const duration = audioRef.current?.duration || 0;
  const currentTime = audioRef.current?.currentTime || 0;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    console.log("Next track pressed");
    // TODO: Integrate with playlist logic
  };

  const handlePrevious = () => {
    console.log("Previous track pressed");
    // TODO: Integrate with playlist logic
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    if (audioRef.current.duration) {
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack) return;
    setIsDragging(true);
    handleProgressClick(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !audioRef.current || !progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));

      if (audioRef.current.duration) {
        const newTime = (percentage / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#0E0E10",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 50,
        gap: "16px",
      }}
    >
      {/* Left Section: Cover + Track Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flex: "0 0 auto",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#121214",
            borderRadius: "4px",
            flexShrink: 0,
            backgroundImage: currentTrack?.coverUrl ? `url(${currentTrack.coverUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack?.title || "No track selected"}
          </span>
          <span
            style={{
              color: "#B3B3B3",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack?.artist || "—"}
          </span>
        </div>
      </div>

      {/* Center Section: Controls + Progress */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          flex: "1 1 auto",
          minWidth: 0,
          maxWidth: "600px",
        }}
      >
        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={!currentTrack}
            style={{
              background: "none",
              border: "none",
              cursor: currentTrack ? "pointer" : "not-allowed",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#B3B3B3",
              opacity: currentTrack ? 1 : 0.5,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (currentTrack) {
                e.currentTarget.style.color = "#00FFC6";
              }
            }}
            onMouseLeave={(e) => {
              if (currentTrack) {
                e.currentTarget.style.color = "#B3B3B3";
              }
            }}
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            style={{
              background: "none",
              border: "none",
              cursor: currentTrack ? "pointer" : "not-allowed",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#00FFC6",
              transition: "color 0.2s",
              opacity: currentTrack ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (currentTrack) {
                e.currentTarget.style.color = "#00E0B0";
              }
            }}
            onMouseLeave={(e) => {
              if (currentTrack) {
                e.currentTarget.style.color = "#00FFC6";
              }
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={handleNext}
            disabled={!currentTrack}
            style={{
              background: "none",
              border: "none",
              cursor: currentTrack ? "pointer" : "not-allowed",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#B3B3B3",
              opacity: currentTrack ? 1 : 0.5,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (currentTrack) {
                e.currentTarget.style.color = "#00FFC6";
              }
            }}
            onMouseLeave={(e) => {
              if (currentTrack) {
                e.currentTarget.style.color = "#B3B3B3";
              }
            }}
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Progress Bar + Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <span
            style={{
              color: "#B3B3B3",
              fontSize: "0.6875rem",
              minWidth: "35px",
              textAlign: "right",
            }}
          >
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
            style={{
              flex: "1 1 auto",
              height: "10px",
              display: "flex",
              alignItems: "center",
              cursor: currentTrack ? "pointer" : "default",
              position: "relative",
              padding: "0 2px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "3px",
                backgroundColor: "#1A1A1D",
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: isHoveringProgress && currentTrack ? "#00E0B0" : "#00FFC6",
                  transition: isDragging ? "none" : "width 0.1s linear, background-color 0.2s ease",
                }}
              />
            </div>
          </div>
          <span
            style={{
              color: "#B3B3B3",
              fontSize: "0.6875rem",
              minWidth: "35px",
              textAlign: "left",
            }}
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Section: Volume */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flex: "0 0 auto",
          minWidth: 0,
        }}
      >
        <Volume2 size={18} color="#B3B3B3" />
        <div
          style={{
            width: "80px",
            height: "3px",
            backgroundColor: "#1a1a1d",
            borderRadius: "2px",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "70%",
              height: "100%",
              backgroundColor: "#00FFC6",
            }}
          />
        </div>
      </div>
      {/* Global Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingState(false)}
        preload="none"
      />
    </div>
  );
}


