"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
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
        height: "85px",
        backgroundColor: "#141416",
        borderTop: "1px solid #1e1e1e",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 12px",
        zIndex: 50,
      }}
    >
      {/* Upper section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "55%",
          minWidth: "620px",
          maxWidth: "800px",
          gap: "14px",
        }}
      >
        {/* Track Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#242428",
              borderRadius: "6px",
            }}
          ></div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
              Demo Track
            </span>
            <span style={{ color: "#B3B3B3", fontSize: "0.78rem" }}>
              Various Artists
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <SkipBack size={16} color="#B3B3B3" />
          {isPlaying ? (
            <Pause
              size={24}
              color="#00FFC6"
              style={{ cursor: "pointer" }}
              onClick={() => setIsPlaying(false)}
            />
          ) : (
            <Play
              size={24}
              color="#00FFC6"
              style={{ cursor: "pointer" }}
              onClick={() => setIsPlaying(true)}
            />
          )}
          <SkipForward size={16} color="#B3B3B3" />
        </div>

        {/* Time */}
        <div
          style={{
            minWidth: "80px",
            textAlign: "right",
            color: "#B3B3B3",
            fontSize: "0.8rem",
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "55%",
          minWidth: "620px",
          maxWidth: "800px",
          height: "4px",
          backgroundColor: "#242428",
          borderRadius: "2px",
          overflow: "hidden",
          marginTop: "8px",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#00FFC6",
            transition: "width 0.2s linear",
          }}
        ></div>
      </div>
    </div>
  );
}


