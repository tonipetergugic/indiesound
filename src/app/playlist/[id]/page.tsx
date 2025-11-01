"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Play, MoreHorizontal, Plus } from "lucide-react";

type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  cover_url?: string | null;
  created_at: string;
  user_id: string;
};

export default function PlaylistDetailPage() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!params?.id) return;
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) setPlaylist(data);
      setLoading(false);
    };

    fetchPlaylist();
  }, [params, supabase]);

  if (loading)
    return (
      <div style={{ color: "#B3B3B3", textAlign: "center", marginTop: "100px" }}>
        Loading playlist...
      </div>
    );

  if (!playlist)
    return (
      <div style={{ color: "#B3B3B3", textAlign: "center", marginTop: "100px" }}>
        Playlist not found.
      </div>
    );

  return (
    <div
      style={{
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
          padding: "40px 0",
          background:
            "linear-gradient(180deg, rgba(0,255,198,0.1) 0%, rgba(14,14,16,1) 100%)",
          borderRadius: "16px",
          paddingLeft: "40px",
        }}
      >
        {/* Cover */}
        <div
          style={{
            width: "200px",
            height: "200px",
            backgroundColor: "#18181A",
            borderRadius: "8px",
            backgroundImage: playlist.cover_url
              ? `url(${playlist.cover_url})`
              : "linear-gradient(135deg, #00FFC6 0%, #00E0B0 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        />

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ fontSize: "14px", color: "#B3B3B3" }}>Playlist</h4>
          <h1 style={{ fontSize: "48px", fontWeight: "700", margin: "0" }}>
            {playlist.name}
          </h1>
          {playlist.description && (
            <p
              style={{
                color: "#B3B3B3",
                fontSize: "16px",
                width: "400px",
              }}
            >
              {playlist.description}
            </p>
          )}
          <p style={{ color: "#B3B3B3", fontSize: "14px" }}>
            Created at{" "}
            {new Date(playlist.created_at).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
          paddingLeft: "20px",
        }}
      >
        <button
          style={{
            backgroundColor: "#00FFC6",
            border: "none",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Play size={28} color="#000" />
        </button>
        <Plus size={28} color="#B3B3B3" style={{ cursor: "pointer" }} />
        <MoreHorizontal size={28} color="#B3B3B3" style={{ cursor: "pointer" }} />
      </div>

      {/* TRACKLIST (später dynamisch) */}
      <div
        style={{
          padding: "0 20px",
          marginTop: "10px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#FFFFFF",
            fontSize: "15px",
          }}
        >
          <thead style={{ textAlign: "left", color: "#B3B3B3" }}>
            <tr>
              <th style={{ width: "30px" }}>#</th>
              <th style={{ paddingBottom: "10px" }}>Title</th>
              <th style={{ paddingBottom: "10px" }}>Artist</th>
              <th style={{ paddingBottom: "10px" }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: "1px solid #222" }}>
              <td style={{ padding: "12px 0", color: "#B3B3B3" }}>1</td>
              <td style={{ padding: "12px 0" }}>Demo Track</td>
              <td style={{ padding: "12px 0", color: "#B3B3B3" }}>Unknown Artist</td>
              <td style={{ padding: "12px 0", color: "#B3B3B3" }}>3:42</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
