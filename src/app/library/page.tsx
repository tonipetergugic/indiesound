"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  genre: string;
  bpm: string;
  keySignature: string;
  coverPublicUrl: string | null;
  audioPublicUrl: string | null;
};

export default function LibraryPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

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
            genre: row.genre ?? "—",
            bpm: row.bpm != null ? String(row.bpm) : "—",
            keySignature: row.key_signature ?? "—",
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
      // Stop audio on unmount
      Object.values(audioRefs.current).forEach((el) => {
        try {
          el?.pause();
        } catch {}
      });
    };
  }, [supabase]);

  function togglePlay(trackId: string) {
    const current = audioRefs.current[trackId];
    if (!current) return;

    // Pause any other playing track
    Object.entries(audioRefs.current).forEach(([id, el]) => {
      if (id !== trackId && el && !el.paused) {
        try {
          el.pause();
        } catch {}
      }
    });

    if (current.paused) {
      current.play().then(() => setPlayingId(trackId)).catch(() => {});
    } else {
      current.pause();
      setPlayingId(null);
    }
  }

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
          {tracks.map((t) => {
            return (
              <div
                key={t.id}
                style={{
                  backgroundColor: "#121214",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    backgroundColor: "#1a1a1d",
                    backgroundImage: t.coverPublicUrl
                      ? `url(${t.coverPublicUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                    marginBottom: "12px",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(t.id);
                    }}
                    style={{
                      appearance: "none",
                      border: "none",
                      borderRadius: 999,
                      width: 36,
                      height: 36,
                      backgroundColor: playingId === t.id ? "#00E0B0" : "#00FFC6",
                      color: "#0E0E10",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background 0.2s, transform 0.05s",
                    }}
                    onMouseDown={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "scale(0.98)";
                    }}
                    onMouseUp={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "scale(1)";
                    }}
                    title={playingId === t.id ? "Pause" : "Play"}
                  >
                    {playingId === t.id ? "❚❚" : "►"}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        color: "#FFFFFF",
                        fontSize: "1rem",
                        margin: 0,
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.title}
                    </h3>
                    <p
                      style={{
                        color: "#B3B3B3",
                        fontSize: "0.85rem",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.artist}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    color: "#B3B3B3",
                    fontSize: "0.8rem",
                    marginTop: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ background: "#18181B", padding: "4px 8px", borderRadius: 8 }}>
                    {t.genre}
                  </span>
                  <span style={{ background: "#18181B", padding: "4px 8px", borderRadius: 8 }}>
                    {t.bpm} BPM
                  </span>
                  <span style={{ background: "#18181B", padding: "4px 8px", borderRadius: 8 }}>
                    {t.keySignature}
                  </span>
                </div>

                <audio
                  ref={(el) => {
                    audioRefs.current[t.id] = el;
                  }}
                  src={t.audioPublicUrl ?? undefined}
                  onEnded={() => setPlayingId(null)}
                  preload="none"
                  style={{ width: "100%", marginTop: 10 }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
