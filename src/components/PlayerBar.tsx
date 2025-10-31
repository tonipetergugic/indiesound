"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, setPlayingState, nextTrack, prevTrack, handleTrackEnd, queue, currentIndex } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const previousTrackUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!currentTrack?.audioUrl) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setProgress(0);
      previousTrackUrlRef.current = null;
      return;
    }

    const newTrackUrl = currentTrack.audioUrl;
    const isSameTrack = previousTrackUrlRef.current === newTrackUrl;

    if (!isSameTrack) {
      audioRef.current.src = newTrackUrl;
      setProgress(0);
      previousTrackUrlRef.current = newTrackUrl;
    }

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setPlayingState(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, setPlayingState]);

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

  useEffect(() => {
    const savedVolume = localStorage.getItem("indiesound-volume");
    if (savedVolume !== null) {
      const volumeValue = parseFloat(savedVolume);
      if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 1) {
        setVolume(volumeValue);
        if (audioRef.current) {
          audioRef.current.volume = volumeValue;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingVolume(false);
    };

    if (isDraggingVolume) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingVolume]);

  const duration = audioRef.current?.duration || 0;
  const currentTime = audioRef.current?.currentTime || 0;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Prüfe, ob es einen nächsten oder vorherigen Track gibt
  const hasNextTrack = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrevTrack = currentIndex > 0;

  const handleNext = () => {
    if (hasNextTrack) {
      nextTrack();
    }
  };

  const handlePrevious = () => {
    if (hasPrevTrack) {
      prevTrack();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = false;
    }
    localStorage.setItem("indiesound-volume", v.toString());
  };

  const handleVolumeMouseDown = () => {
    setIsDraggingVolume(true);
  };

  const handleVolumeMouseUp = () => {
    setIsDraggingVolume(false);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
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
        padding: "0 16px",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Left: Track Cover, Titel, Artist */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: "0 0 250px",
            overflow: "hidden",
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
            flex: "1 1 auto",
            overflow: "hidden",
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

        {/* Center: Steuerung (Prev, Play/Pause, Next, Fortschrittsbalken) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            width: "360px",
            pointerEvents: "none",
          }}
        >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "auto",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={!hasPrevTrack || !currentTrack}
            style={{
              background: "none",
              border: "none",
              cursor: hasPrevTrack && currentTrack ? "pointer" : "not-allowed",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#B3B3B3",
              opacity: hasPrevTrack && currentTrack ? 1 : 0.5,
              transition: "opacity 0.2s, color 0.2s",
              pointerEvents: "auto",
            }}
            onMouseEnter={(e) => {
              if (hasPrevTrack && currentTrack) {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.color = "#00FFC6";
              }
            }}
            onMouseLeave={(e) => {
              if (hasPrevTrack && currentTrack) {
                e.currentTarget.style.opacity = "1";
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
              transition: "opacity 0.2s, color 0.2s",
              opacity: currentTrack ? 1 : 0.5,
              pointerEvents: "auto",
            }}
            onMouseEnter={(e) => {
              if (currentTrack) {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.color = "#00E0B0";
              }
            }}
            onMouseLeave={(e) => {
              if (currentTrack) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.color = "#00FFC6";
              }
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={handleNext}
            disabled={!hasNextTrack || !currentTrack}
            style={{
              background: "none",
              border: "none",
              cursor: hasNextTrack && currentTrack ? "pointer" : "not-allowed",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#B3B3B3",
              opacity: hasNextTrack && currentTrack ? 1 : 0.5,
              transition: "opacity 0.2s, color 0.2s",
              pointerEvents: "auto",
            }}
            onMouseEnter={(e) => {
              if (hasNextTrack && currentTrack) {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.color = "#00FFC6";
              }
            }}
            onMouseLeave={(e) => {
              if (hasNextTrack && currentTrack) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.color = "#B3B3B3";
              }
            }}
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            pointerEvents: "auto",
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

        {/* Right: Lautstärkeregler */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            flex: "0 0 250px",
            overflow: "hidden",
          }}
        >
        <button
          onClick={handleMuteToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "#FFFFFF",
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={18} />
          ) : (
            <Volume2 size={18} />
          )}
        </button>
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "10px",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "4px",
              backgroundColor: "#333",
              borderRadius: "2px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: `${volume * 100}%`,
              height: "4px",
              backgroundColor: isHoveringVolume || isDraggingVolume ? "#00E0B0" : "#00FFC6",
              borderRadius: "2px",
              pointerEvents: "none",
              transition: "background-color 0.2s",
            }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            onMouseDown={handleVolumeMouseDown}
            onMouseUp={handleVolumeMouseUp}
            className={`volume-slider ${isDraggingVolume ? "dragging" : ""}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "10px",
              margin: 0,
              padding: 0,
              appearance: "none",
              background: "transparent",
              cursor: "pointer",
              zIndex: 1,
            }}
          />
        </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        preload="none"
      />
    </div>
  );
}
