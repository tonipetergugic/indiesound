"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type ArtistProfile = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
};

type Track = {
  id: string;
  title: string;
  cover_url: string | null;
  audio_url: string | null;
};

export default function ArtistPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;

      // Lade Artist-Info
      const { data: artistData } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url")
        .eq("id", id)
        .single();

      setArtist(artistData);

      // Lade alle Tracks des Artists
      const { data: trackData } = await supabase
        .from("tracks")
        .select("id, title, cover_url, audio_url")
        .eq("artist_id", id);

      setTracks(trackData || []);
      setLoading(false);
    };

    fetchArtist();
  }, [id, supabase]);

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#B3B3B3" }}>
        Loading artist...
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={{ padding: "40px", color: "#B3B3B3" }}>
        Artist not found.
      </div>
    );
  }

  return (
    <div
      style={{
        color: "#FFFFFF",
        backgroundColor: "#0E0E10",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "30px",
          marginBottom: "40px",
        }}
      >
        <img
          src={artist.avatar_url || "/default-avatar.png"}
          alt={artist.display_name}
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "100%",
            objectFit: "cover",
            border: "2px solid #00FFC6",
          }}
        />
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {artist.display_name}
          </h1>
          <p style={{ color: "#B3B3B3", marginBottom: "20px" }}>
            {artist.bio || "No biography available."}
          </p>
          <button
            style={{
              backgroundColor: "#00FFC6",
              color: "#0E0E10",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#00E0B0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#00FFC6")
            }
          >
            Follow
          </button>
        </div>
      </div>

      {/* Tracks */}
      <h2 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>Tracks</h2>

      {tracks.length === 0 ? (
        <p style={{ color: "#B3B3B3" }}>No tracks yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "20px",
          }}
        >
          {tracks.map((track) => (
            <div
              key={track.id}
              style={{
                backgroundColor: "#1A1A1D",
                borderRadius: "12px",
                padding: "14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1.0)")
              }
            >
              <img
                src={track.cover_url || "/default-cover.png"}
                alt={track.title}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  objectFit: "cover",
                }}
              />
              <p style={{ fontWeight: 600 }}>{track.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

