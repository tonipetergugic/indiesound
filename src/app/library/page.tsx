"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import TrackCard from "@/components/TrackCard";

type TrackRow = {
  id: string;
  title: string | null;
  artist: string | null;
  genre: string | null;
  bpm: number | null;
  key_signature: string | null;
  cover_url: string | null; // storage path in bucket "covers"
  audio_url: string | null; // storage path in bucket "tracks"
};

type TrackItem = {
  id: string;
  title: string;
  artist: string;
  coverPublicUrl: string | null;
  audioPublicUrl: string | null;
};

export default function LibraryPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTracks() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("tracks")
          .select("id,title,artist,genre,bpm,key_signature,cover_url,audio_url");

        if (fetchError) throw fetchError;

        const rows: TrackRow[] = data ?? [];

        const resolved: TrackItem[] = rows.map((row) => {
          const coverPublicUrl = row.cover_url
            ? supabase.storage.from("covers").getPublicUrl(row.cover_url).data
                ?.publicUrl || null
            : null;
          const audioPublicUrl = row.audio_url
            ? supabase.storage.from("tracks").getPublicUrl(row.audio_url).data
                ?.publicUrl || null
            : null;

          return {
            id: row.id,
            title: row.title ?? "Untitled",
            artist: row.artist ?? "Unknown Artist",
            coverPublicUrl,
            audioPublicUrl,
          };
        });

        if (!isMounted) return;
        setTracks(resolved);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load tracks");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTracks();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const pageStyle: React.CSSProperties = {
    backgroundColor: "#0E0E10",
    minHeight: "100%",
    color: "#FFFFFF",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "20px",
    padding: "20px",
  };

  const emptyStateStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "50vh",
    color: "#B3B3B3",
    fontSize: "1rem",
  };

  return (
    <div style={pageStyle}>
      {loading ? (
        <div style={emptyStateStyle}>Lade deine Bibliothek…</div>
      ) : error ? (
        <div style={emptyStateStyle}>Fehler: {error}</div>
      ) : tracks.length === 0 ? (
        <div style={emptyStateStyle}>No tracks uploaded yet.</div>
      ) : (
        <div style={gridStyle}>
          {tracks.map((t) => (
            <TrackCard
              key={t.id}
              title={t.title}
              artist={t.artist}
              imageUrl={t.coverPublicUrl || undefined}
              audioUrl={t.audioPublicUrl || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
