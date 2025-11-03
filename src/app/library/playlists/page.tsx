"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  cover_url?: string | null;
  created_at: string;
};

export default function LibraryPlaylistsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

        if (!error && data) {
          const updated = data.map((playlist: Playlist) => {
            if (playlist.cover_url && !playlist.cover_url.startsWith("http")) {
              const publicUrl = supabase.storage
                .from("playlist-covers")
                .getPublicUrl(playlist.cover_url).data.publicUrl;
              return { ...playlist, cover_url: publicUrl };
            }
            return playlist;
          });
        
          setPlaylists(updated);
        }
        
      setLoading(false);
    };

    fetchPlaylists();
  }, [supabase]);

  if (loading)
    return (
      <div style={{ color: "#B3B3B3", textAlign: "center", marginTop: "100px" }}>
        Loading playlists...
      </div>
    );

  if (!playlists.length)
    return (
      <div
        style={{
          textAlign: "center",
          color: "#B3B3B3",
          marginTop: "100px",
          fontSize: "16px",
        }}
      >
        No playlists yet. <br /> Create one to get started 🎵
      </div>
    );

  return (
    <div
      style={{
        padding: "20px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "25px",
      }}
    >
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          onClick={() => router.push(`/playlist/${playlist.id}`)}
          style={{
            backgroundColor: "#18181A",
            borderRadius: "12px",
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#202022")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#18181A")
          }
        >
          {/* Cover */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              backgroundColor: "#222",
              backgroundImage: playlist.cover_url
                ? `url(${playlist.cover_url})`
                : "linear-gradient(135deg, #00FFC6 0%, #00E0B0 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Info */}
          <div style={{ padding: "12px" }}>
            <p
              style={{
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: "5px",
              }}
            >
              {playlist.name}
            </p>
            <p
              style={{
                color: "#B3B3B3",
                fontSize: "14px",
                lineHeight: "1.3em",
              }}
            >
              {playlist.description || "No description"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
