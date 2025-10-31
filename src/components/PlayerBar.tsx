"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.3));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const duration = 240;
  const currentTime = Math.floor((progress / 100) * duration);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

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
            Demo Track
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
            Various Artists
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
            onClick={() => {}}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#B3B3B3",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#00FFC6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#B3B3B3";
            }}
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#00FFC6",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#00E0B0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#00FFC6";
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={() => {}}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#B3B3B3",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#00FFC6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#B3B3B3";
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
            style={{
              flex: "1 1 auto",
              height: "3px",
              backgroundColor: "#1a1a1d",
              borderRadius: "2px",
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#00FFC6",
                transition: "width 0.2s linear",
              }}
            />
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
    </div>
  );
}


