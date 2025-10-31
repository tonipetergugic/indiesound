"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Music, CheckCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function ArtistUploadPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

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
      }
      setSessionChecked(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!coverFile || !audioFile) {
      setMessage("Please select both a cover and audio file.");
      setLoading(false);
      return;
    }

    try {
      // Upload cover
      const { error: coverError } = await supabase.storage
        .from("covers")
        .upload(coverFile.name, coverFile, { upsert: true });
      if (coverError) throw coverError;

      // Upload audio
      const { error: audioError } = await supabase.storage
        .from("tracks")
        .upload(audioFile.name, audioFile, { upsert: true });
      if (audioError) throw audioError;

      // Insert track record
      const { error: insertError } = await supabase.from("tracks").insert([
        {
          title,
          artist,
          genre,
          bpm: bpm ? parseInt(bpm) : null,
          key_signature: keySignature,
          cover_url: coverFile.name,
          audio_url: audioFile.name,
        },
      ]);
      if (insertError) throw insertError;

      setMessage("✅ Upload successful!");
      setTitle("");
      setArtist("");
      setGenre("");
      setBpm("");
      setKeySignature("");
      setCoverFile(null);
      setAudioFile(null);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: "700px",
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
        IndieSound for Artists – Upload Track
      </h2>

      <form
        onSubmit={handleUpload}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <input
          placeholder="Track title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Artist name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="BPM"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          type="number"
          style={inputStyle}
        />
        <input
          placeholder="Key (e.g. D Minor)"
          value={keySignature}
          onChange={(e) => setKeySignature(e.target.value)}
          style={inputStyle}
        />

        <div style={{ marginTop: "10px" }}>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            required
            style={{ display: "none" }}
          />
          <div
            onClick={() => coverInputRef.current?.click()}
            style={{
              border: "2px dashed #00FFC6",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#1A1A1D",
              color: "#FFFFFF",
              cursor: "pointer",
              textAlign: "center",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = "#17171A";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#00E0B0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = "#1A1A1D";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#00FFC6";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <ImageIcon size={22} color="#00FFC6" />
              <div style={{ fontSize: "16px", color: "#FFFFFF" }}>Upload Cover</div>
              {coverFile ? (
                <div style={{ marginTop: "4px", fontSize: "13px", color: "#B3B3B3", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={20} color="#00FFC6" />
                  <span>{coverFile.name}</span>
                </div>
              ) : (
                <div style={{ marginTop: "4px", fontSize: "13px", color: "#B3B3B3" }}>
                  JPG oder PNG auswählen
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mp3"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            required
            style={{ display: "none" }}
          />
          <div
            onClick={() => audioInputRef.current?.click()}
            style={{
              border: "2px dashed #00FFC6",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#1A1A1D",
              color: "#FFFFFF",
              cursor: "pointer",
              textAlign: "center",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = "#17171A";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#00E0B0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = "#1A1A1D";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#00FFC6";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <Music size={22} color="#00FFC6" />
              <div style={{ fontSize: "16px", color: "#FFFFFF" }}>Upload Audio</div>
              {audioFile ? (
                <div style={{ marginTop: "4px", fontSize: "13px", color: "#B3B3B3", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={20} color="#00FFC6" />
                  <span>{audioFile.name}</span>
                </div>
              ) : (
                <div style={{ marginTop: "4px", fontSize: "13px", color: "#B3B3B3" }}>
                  MP3-Datei auswählen
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#00E0B0" : "#00FFC6",
            color: "#0E0E10",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload Track"}
        </button>
      </form>

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
    </div>
  );
}

const inputStyle = {
  backgroundColor: "#1A1A1D",
  border: "1px solid #333",
  borderRadius: "10px",
  padding: "14px 16px",
  color: "#FFFFFF",
  fontSize: "16px",
};

const fileStyle = {
  backgroundColor: "#1A1A1D",
  border: "1px solid #333",
  borderRadius: "10px",
  padding: "10px",
  color: "#FFFFFF",
  width: "100%",
  cursor: "pointer",
};

const labelStyle = {
  color: "#B3B3B3",
  fontSize: "15px",
  marginBottom: "6px",
  display: "block",
};
