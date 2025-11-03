"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import type { Track } from "@/context/PlayerContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type Playlist = {
  id: string;
  name: string;
  cover_url?: string | null;
  // legacy support
  coverUrl?: string | null;
  tracks: Track[];
};

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();
  const { setQueue } = usePlayer();
  const supabase = createClientComponentClient();

  const computedCoverUrl = useMemo(() => {
    if (!playlist.cover_url && !playlist.coverUrl) return null;
    const key = (playlist.cover_url || playlist.coverUrl) as string;
    const { data } = supabase.storage
      .from("playlist-covers")
      .getPublicUrl(key);
    return data?.publicUrl || null;
  }, [playlist.cover_url, playlist.coverUrl, supabase]);

  const handleCardClick = () => {
    router.push(`/playlist/${playlist.id}`);
  };

  const handlePlayAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0);
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
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
          setIsHovering(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          setIsHovering(false);
        }}
      >
        {computedCoverUrl ? (
          <img
            src={computedCoverUrl}
            alt={playlist.name}
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
              background: "linear-gradient(135deg, #00FFC6, #00E0B0)",
              borderRadius: "12px",
            }}
          />
        )}
        {/* Play All Button - oben rechts */}
        <div
          onClick={handlePlayAllClick}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#00FFC6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            opacity: isHovering ? 1 : 0,
            transition: "opacity 0.2s ease, background-color 0.2s ease, transform 0.2s ease",
            cursor: "pointer",
            transform: "scale(0.9)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#00E0B0";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00FFC6";
            e.currentTarget.style.transform = "scale(0.9)";
          }}
        >
          <Play size={18} fill="white" color="white" />
        </div>
      </div>
      <h3
        onClick={handleCardClick}
        style={{
          color: "#FFFFFF",
          fontSize: "1rem",
          margin: 0,
          marginBottom: "4px",
          fontWeight: "bold",
        }}
      >
        {playlist.name}
      </h3>
    </div>
  );
}
