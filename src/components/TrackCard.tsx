"use client";

import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";

interface TrackCardProps {
  title: string;
  artist: string;
  imageUrl?: string;
  audioUrl?: string;
  onPlayClick?: () => void;
}

export default function TrackCard({ title, artist, imageUrl, audioUrl, onPlayClick }: TrackCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const { currentTrack, isPlaying, togglePlay } = usePlayer();

  const isCurrentTrack = currentTrack?.title === title && currentTrack?.artist === artist;
  const showPauseIcon = isCurrentTrack && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack && isPlaying) {
      togglePlay();
    } else if (onPlayClick) {
      onPlayClick();
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#121214",
        borderRadius: "16px",
        padding: "16px",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 255, 198, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          marginBottom: "12px",
          overflow: "hidden",
          transition: "transform 0.3s ease",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
          setIsHovering(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          setIsHovering(false);
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              backgroundColor: "#1a1a1d",
              borderRadius: "12px",
            }}
          />
        )}
        {/* Hover Overlay with Play Button */}
        <div
          onClick={handlePlayClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isHovering ? 1 : 0,
            transition: "opacity 0.2s ease",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#00FFC6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(0,255,198,0.5)",
              transition: "background-color 0.2s ease, transform 0.2s ease",
              transform: "scale(0.95)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#00E0B0";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#00FFC6";
              e.currentTarget.style.transform = "scale(0.95)";
            }}
          >
            {showPauseIcon ? (
              // Pause icon
              <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                <rect x="6" y="4" width="3" height="12" fill="white" rx="0.5" />
                <rect x="11" y="4" width="3" height="12" fill="white" rx="0.5" />
              </svg>
            ) : (
              // Play icon
              <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                <path d="M7 5L15 10L7 15V5Z" fill="white" />
              </svg>
            )}
          </div>
        </div>
      </div>
      <h3
        style={{
          color: "#FFFFFF",
          fontSize: "1rem",
          margin: 0,
          marginBottom: "4px",
          fontWeight: "bold",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#B3B3B3",
          fontSize: "0.85rem",
          margin: 0,
        }}
      >
        {artist}
      </p>
    </div>
  );
}
