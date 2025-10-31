"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type TrackRow = {
  id: number;
  title: string;
  artist: string;
  cover_url?: string | null;
};

type TrackWithCover = TrackRow & { cover: string };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrackWithCover[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      const fetchTracks = async () => {
        const { data, error } = await supabase
          .from("tracks")
          .select("id,title,artist,cover_url")
          .or(`title.ilike.%${query}%,artist.ilike.%${query}%`);

        if (error) {
          setResults([]);
          setLoading(false);
          return;
        }

        const mapped: TrackWithCover[] = (data || []).map((track: TrackRow) => {
          const { data: publicData } = supabase
            .storage
            .from("covers")
            .getPublicUrl(track.cover_url || "");
          const cover = publicData?.publicUrl || "";
          return { ...track, cover };
        });

        setResults(mapped);
        setLoading(false);
      };
      fetchTracks();
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#1A1A1D",
          padding: "10px 15px",
          borderRadius: "12px",
        }}
      >
        <Search size={20} color="#B3B3B3" />
        <input
          type="text"
          placeholder="Search for songs or artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#FFFFFF",
            fontSize: "16px",
            marginLeft: "10px",
          }}
        />
      </div>

      {/* Results */}
      {loading ? (
        <p style={{ color: "#B3B3B3" }}>Searching...</p>
      ) : results.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "20px",
          }}
        >
          {results.map((track) => (
            <div
              key={track.id}
              style={{
                backgroundColor: "#18181A",
                borderRadius: "12px",
                overflow: "hidden",
                padding: "10px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  backgroundColor: "#333",
                  backgroundImage: `url(${track.cover})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "8px",
                }}
              />
              <p style={{ marginTop: "10px", fontWeight: "bold", color: "#FFFFFF" }}>
                {track.title}
              </p>
              <p style={{ color: "#B3B3B3", fontSize: "14px" }}>{track.artist}</p>
            </div>
          ))}
        </div>
      ) : query ? (
        <p style={{ color: "#B3B3B3" }}>No results found.</p>
      ) : (
        <p style={{ color: "#B3B3B3" }}>Start typing to search.</p>
      )}
    </div>
  );
}
