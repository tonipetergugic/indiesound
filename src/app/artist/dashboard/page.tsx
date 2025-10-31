"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type Track = {
  id: number;
  title: string;
  artist: string;
  genre: string | null;
  bpm: number | null;
  key_signature: string | null;
  cover_url: string | null;
  audio_url: string | null;
};

type TrackWithUrls = Track & {
  coverUrl: string;
  audioUrl: string;
};

export default function ArtistDashboardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackWithUrls[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check session on mount and watch for auth changes
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (!data.session) {
        router.replace("/artist/login");
      } else {
        setUserEmail(data.session.user.email ?? null);
        
        // Get artist name from artists table
        const { data: artistData } = await supabase
          .from("artists")
          .select("display_name")
          .eq("user_id", data.session.user.id)
          .single();
        
        if (artistData?.display_name) {
          setArtistName(artistData.display_name);
        }
      }
      setSessionChecked(true);
    })();

    // Fix: add types for _event and session parameters
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        if (!session) {
          router.replace("/artist/login");
        } else {
          setUserEmail(session.user.email ?? null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Fetch tracks when artist name is available
  useEffect(() => {
    if (artistName && sessionChecked) {
      fetchTracks();
    }
  }, [artistName, sessionChecked]);

  async function fetchTracks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("artist", artistName);

      if (error) throw error;

      const tracksWithUrls: TrackWithUrls[] = (data || []).map((track: Track) => {
        const { data: coverData } = supabase
          .storage
          .from("covers")
          .getPublicUrl(track.cover_url || "");
        
        const { data: audioData } = supabase
          .storage
          .from("tracks")
          .getPublicUrl(track.audio_url || "");

        return {
          ...track,
          coverUrl: coverData?.publicUrl || "",
          audioUrl: audioData?.publicUrl || "",
        };
      });

      setTracks(tracksWithUrls);
    } catch (err: any) {
      setMessage("❌ Fehler beim Laden der Tracks: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(track: TrackWithUrls) {
    if (!confirm(`Möchtest du "${track.title}" wirklich löschen?`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Delete from storage
      if (track.cover_url) {
        const { error: coverError } = await supabase
          .storage
          .from("covers")
          .remove([track.cover_url]);
        if (coverError) console.error("Cover deletion error:", coverError);
      }

      if (track.audio_url) {
        const { error: audioError } = await supabase
          .storage
          .from("tracks")
          .remove([track.audio_url]);
        if (audioError) console.error("Audio deletion error:", audioError);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("tracks")
        .delete()
        .eq("id", track.id);

      if (deleteError) throw deleteError;

      setMessage("✅ Track erfolgreich gelöscht!");
      
      // Refresh tracks list
      await fetchTracks();
    } catch (err: any) {
      setMessage("❌ Fehler beim Löschen: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!sessionChecked) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0E0E10" }} />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px",
        margin: "40px auto",
        gap: "20px",
        padding: "40px",
        backgroundColor: "#121214",
        borderRadius: "16px",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Auth header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid #222",
          color: "#FFFFFF",
        }}
      >
        <span style={{ fontSize: "14px" }}>
          🎤 Logged in as {userEmail ?? ""}
        </span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/artist/login");
          }}
          style={{
            backgroundColor: "#00FFC6",
            color: "#0E0E10",
            fontWeight: "bold",
            fontSize: "13px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00E0B0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00FFC6";
          }}
        >
          Sign Out
        </button>
      </div>

      <h2 style={{ fontSize: "26px", fontWeight: "bold", color: "#FFFFFF" }}>
        Your Uploaded Tracks
      </h2>

      {message && (
        <p
          style={{
            color: message.startsWith("✅") ? "#00FFC6" : "#FF5555",
            marginTop: "10px",
          }}
        >
          {message}
        </p>
      )}

      {loading && tracks.length === 0 ? (
        <p style={{ color: "#B3B3B3", textAlign: "center", padding: "40px" }}>
          Lade Tracks...
        </p>
      ) : tracks.length === 0 ? (
        <p style={{ color: "#B3B3B3", textAlign: "center", padding: "40px" }}>
          You haven't uploaded any tracks yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "24px",
            marginTop: "10px",
          }}
        >
          {tracks.map((track) => (
            <div
              key={track.id}
              style={{
                backgroundColor: "#1a1a1d",
                borderRadius: "16px",
                padding: "20px",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid #23232a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 255, 198, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Cover Image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  backgroundColor: "#242428",
                  backgroundImage: track.coverUrl ? `url(${track.coverUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              ></div>

              {/* Track Info */}
              <h3 style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
                {track.title}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                {track.genre && (
                  <p style={{ color: "#B3B3B3", fontSize: "14px" }}>
                    Genre: {track.genre}
                  </p>
                )}
                {track.bpm && (
                  <p style={{ color: "#B3B3B3", fontSize: "14px" }}>
                    BPM: {track.bpm}
                  </p>
                )}
                {track.key_signature && (
                  <p style={{ color: "#B3B3B3", fontSize: "14px" }}>
                    Key: {track.key_signature}
                  </p>
                )}
              </div>

              {/* Audio Player */}
              <audio
                controls
                src={track.audioUrl}
                style={{
                  width: "100%",
                  height: "40px",
                  marginBottom: "16px",
                }}
              />

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(track)}
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: "#FF5555",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "14px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#FF3333";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF5555";
                }}
              >
                🗑️ Löschen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

