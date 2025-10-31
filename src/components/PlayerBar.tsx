"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePlayer } from "@/context/PlayerContext";

// Styles
const containerStyle: React.CSSProperties = {
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
};

const innerContainerStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "100%",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flex: "0 0 250px",
  overflow: "hidden",
};

const coverStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  backgroundColor: "#121214",
  borderRadius: "4px",
  flexShrink: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const textContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1 1 auto",
  overflow: "hidden",
};

const titleStyle: React.CSSProperties = {
  color: "#FFFFFF",
  fontWeight: 500,
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const artistStyle: React.CSSProperties = {
  color: "#B3B3B3",
  fontSize: "0.75rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const centerContainerStyle: React.CSSProperties = {
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
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  pointerEvents: "auto",
};

const baseButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  transition: "opacity 0.2s, color 0.2s",
  pointerEvents: "auto",
};

const progressContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  pointerEvents: "auto",
};

const timeStyle: React.CSSProperties = {
  color: "#B3B3B3",
  fontSize: "0.6875rem",
  minWidth: "35px",
};

const progressBarStyle: React.CSSProperties = {
  flex: "1 1 auto",
  height: "10px",
  display: "flex",
  alignItems: "center",
  position: "relative",
  padding: "0 2px",
};

const progressTrackStyle: React.CSSProperties = {
  width: "100%",
  height: "3px",
  backgroundColor: "#1A1A1D",
  borderRadius: "2px",
  overflow: "hidden",
  position: "relative",
};

const volumeContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "80px",
  height: "10px",
  display: "flex",
  alignItems: "center",
};

const volumeTrackStyle: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "4px",
  backgroundColor: "#333",
  borderRadius: "2px",
};

const volumeSliderStyle: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "10px",
  margin: 0,
  padding: 0,
  appearance: "none",
  background: "transparent",
  cursor: "pointer",
  zIndex: 1,
};

const rightSectionStyle: React.CSSProperties = {
  ...sectionStyle,
  justifyContent: "flex-end",
};

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

  // Audio playback control
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
      audioRef.current.play().catch(() => setPlayingState(false));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, setPlayingState]);

  // Progress tracking
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
      if (audio.duration) setProgress(0);
    });

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [isDragging]);

  // Volume initialization and control
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

  // Global mouse up for volume dragging
  useEffect(() => {
    if (!isDraggingVolume) return;
    const handleGlobalMouseUp = () => setIsDraggingVolume(false);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDraggingVolume]);

  // Progress bar dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!audioRef.current || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));

      if (audioRef.current.duration) {
        const newTime = (percentage / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(percentage);
      }
    };

    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const hasNextTrack = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrevTrack = currentIndex > 0;
  const duration = audioRef.current?.duration || 0;
  const currentTime = audioRef.current?.currentTime || 0;

  const handleNext = useCallback(() => {
    if (hasNextTrack) nextTrack();
  }, [hasNextTrack, nextTrack]);

  const handlePrevious = useCallback(() => {
    if (hasPrevTrack) prevTrack();
  }, [hasPrevTrack, prevTrack]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = false;
    }
    localStorage.setItem("indiesound-volume", v.toString());
  }, []);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  }, [isMuted]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    if (audioRef.current.duration) {
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  }, [currentTrack]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack) return;
    setIsDragging(true);
    handleProgressClick(e);
  }, [currentTrack, handleProgressClick]);

  const getButtonHoverStyle = useCallback((isEnabled: boolean, defaultColor: string, hoverColor: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isEnabled) {
        e.currentTarget.style.opacity = "0.8";
        e.currentTarget.style.color = hoverColor;
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isEnabled) {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.color = defaultColor;
      }
    },
  }), []);

  const prevButtonStyle = {
    ...baseButtonStyle,
    cursor: hasPrevTrack && currentTrack ? "pointer" : "not-allowed",
    color: "#B3B3B3",
    opacity: hasPrevTrack && currentTrack ? 1 : 0.5,
  };

  const playButtonStyle = {
    ...baseButtonStyle,
    cursor: currentTrack ? "pointer" : "not-allowed",
    color: "#00FFC6",
    opacity: currentTrack ? 1 : 0.5,
  };

  const nextButtonStyle = {
    ...baseButtonStyle,
    cursor: hasNextTrack && currentTrack ? "pointer" : "not-allowed",
    color: "#B3B3B3",
    opacity: hasNextTrack && currentTrack ? 1 : 0.5,
  };

  const progressFillStyle: React.CSSProperties = {
    width: `${progress}%`,
    height: "100%",
    backgroundColor: isHoveringProgress && currentTrack ? "#00E0B0" : "#00FFC6",
    transition: isDragging ? "none" : "width 0.1s linear, background-color 0.2s ease",
  };

  const volumeFillStyle: React.CSSProperties = {
    ...volumeTrackStyle,
    width: `${volume * 100}%`,
    backgroundColor: isHoveringVolume || isDraggingVolume ? "#00E0B0" : "#00FFC6",
    pointerEvents: "none",
    transition: "background-color 0.2s",
  };

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        {/* Left: Track Cover, Titel, Artist */}
        <div style={sectionStyle}>
          <div style={{ ...coverStyle, backgroundImage: currentTrack?.coverUrl ? `url(${currentTrack.coverUrl})` : undefined }} />
          <div style={textContainerStyle}>
            <span style={titleStyle}>{currentTrack?.title || "No track selected"}</span>
            <span style={artistStyle}>{currentTrack?.artist || "—"}</span>
          </div>
        </div>

        {/* Center: Steuerung */}
        <div style={centerContainerStyle}>
          <div style={buttonGroupStyle}>
            <button
              onClick={handlePrevious}
              disabled={!hasPrevTrack || !currentTrack}
              style={prevButtonStyle}
              {...getButtonHoverStyle(hasPrevTrack && !!currentTrack, "#B3B3B3", "#00FFC6")}
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              style={playButtonStyle}
              {...getButtonHoverStyle(!!currentTrack, "#00FFC6", "#00E0B0")}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNextTrack || !currentTrack}
              style={nextButtonStyle}
              {...getButtonHoverStyle(hasNextTrack && !!currentTrack, "#B3B3B3", "#00FFC6")}
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div style={progressContainerStyle}>
            <span style={{ ...timeStyle, textAlign: "right" }}>{formatTime(currentTime)}</span>
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onMouseEnter={() => setIsHoveringProgress(true)}
              onMouseLeave={() => setIsHoveringProgress(false)}
              style={{ ...progressBarStyle, cursor: currentTrack ? "pointer" : "default" }}
            >
              <div style={progressTrackStyle}>
                <div style={progressFillStyle} />
              </div>
            </div>
            <span style={{ ...timeStyle, textAlign: "left" }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Lautstärkeregler */}
        <div style={rightSectionStyle}>
          <button
            onClick={handleMuteToggle}
            style={{ ...baseButtonStyle, cursor: "pointer", color: "#FFFFFF", opacity: 0.7 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div
            style={volumeContainerStyle}
            onMouseEnter={() => setIsHoveringVolume(true)}
            onMouseLeave={() => setIsHoveringVolume(false)}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              onMouseDown={() => setIsDraggingVolume(true)}
              onMouseUp={() => setIsDraggingVolume(false)}
              className={`volume-slider ${isDraggingVolume ? "dragging" : ""}`}
              style={{
                ...volumeSliderStyle,
                ["--volume-value" as string]: `${volume * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <audio ref={audioRef} onEnded={handleTrackEnd} preload="none" />
    </div>
  );
}