"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Music, CheckCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// 🎵 Hilfsfunktion für Audio-Länge
const getAudioDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      resolve(Math.round(audio.duration));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      resolve(0);
    };
  });

export default function UploadTrackForm() {
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [canUpload, setCanUpload] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Check user role on mount to gate the UI
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) setCanUpload(false);
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profileError) {
          console.error("Error checking user role:", profileError.message);
          if (isMounted) setCanUpload(false);
          return;
        }
        if (isMounted) setCanUpload(profile?.role === "artist");
      } catch (e) {
        console.error(e);
        if (isMounted) setCanUpload(false);
      }
    })();
    return () => { isMounted = false; };
  }, [supabase]);

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
      const duration = await getAudioDuration(audioFile);

      // Get User first for path structure
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to upload tracks.");
        setLoading(false);
        return;
      }

      // Verify artist role before proceeding
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error checking user role:", profileError.message);
        alert("Could not verify user role. Please try again.");
        setLoading(false);
        return;
      }

      if (profile?.role !== "artist") {
        alert("Only artists can upload tracks.");
        setLoading(false);
        return;
      }

      // Build user-scoped paths with timestamp
      const coverPath = `${user.id}/${Date.now()}_${coverFile.name}`;
      const audioPath = `${user.id}/${Date.now()}_${audioFile.name}`;

      // Upload Cover
      const { data: coverData, error: coverError } = await supabase.storage
        .from("covers")
        .upload(coverPath, coverFile, { upsert: true });
      if (coverError) throw coverError;
      if (!coverData) throw new Error("Cover upload failed");

      // Upload Audio
      const { data: audioData, error: audioError } = await supabase.storage
        .from("tracks")
        .upload(audioPath, audioFile, { upsert: true });
      if (audioError) throw audioError;
      if (!audioData) throw new Error("Audio upload failed");

      // Insert with storage keys (data.path)
      const { error: insertError } = await supabase.from("tracks").insert([
        {
          title,
          artist,
          genre,
          bpm: bpm ? parseInt(bpm) : null,
          key_signature: keySignature,
          cover_url: coverData.path,
          audio_url: audioData.path,
          duration,
          artist_id: user.id,
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
      console.error("Upload error:", err);
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: "26px", fontWeight: "bold", color: "#FFFFFF" }}>
        IndieSound for Artists – Upload Track
      </h2>

      {!canUpload ? (
        <div style={{ color: "#B3B3B3", textAlign: "center", padding: "16px" }}>
          Only artists can upload tracks.
        </div>
      ) : (
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Basic Inputs */}
        <input placeholder="Track title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        <input placeholder="Artist name" value={artist} onChange={(e) => setArtist(e.target.value)} required style={inputStyle} />
        <input placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} style={inputStyle} />
        <input placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value)} type="number" style={inputStyle} />
        <input placeholder="Key (e.g. D Minor)" value={keySignature} onChange={(e) => setKeySignature(e.target.value)} style={inputStyle} />

        {/* Cover Upload */}
        <UploadBox
          label="Upload Cover"
          icon={<ImageIcon size={22} color="#00FFC6" />}
          file={coverFile}
          onClick={() => coverInputRef.current?.click()}
          inputRef={coverInputRef}
          accept="image/*"
          onFile={(f) => setCoverFile(f)}
        />

        {/* Audio Upload */}
        <UploadBox
          label="Upload Audio"
          icon={<Music size={22} color="#00FFC6" />}
          file={audioFile}
          onClick={() => audioInputRef.current?.click()}
          inputRef={audioInputRef}
          accept="audio/mp3"
          onFile={(f) => setAudioFile(f)}
        />

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
      )}

      {message && (
        <p style={{ color: message.startsWith("✅") ? "#00FFC6" : "#FF5555", marginTop: "10px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

/* 🔧 Helper Component */
function UploadBox({
  label,
  icon,
  file,
  onClick,
  inputRef,
  accept,
  onFile,
}: {
  label: string;
  icon: React.ReactNode;
  file: File | null;
  onClick: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onFile: (file: File | null) => void;
}) {
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onFile(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />
      <div
        onClick={onClick}
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
          e.currentTarget.style.backgroundColor = "#17171A";
          e.currentTarget.style.borderColor = "#00E0B0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1A1A1D";
          e.currentTarget.style.borderColor = "#00FFC6";
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          {icon}
          <div style={{ fontSize: "16px", color: "#FFFFFF" }}>{label}</div>
          {file ? (
            <div style={{ marginTop: "4px", fontSize: "13px", color: "#B3B3B3", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle size={20} color="#00FFC6" />
              <span>{file.name}</span>
            </div>
          ) : (
            <div style={{ marginTop: "4px", fontSize: "13px", color: "#B3B3B3" }}>
              {accept.startsWith("image") ? "JPG oder PNG auswählen" : "MP3-Datei auswählen"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxWidth: "700px",
  margin: "40px auto",
  gap: "20px",
  padding: "40px",
  backgroundColor: "#121214",
  borderRadius: "16px",
  boxShadow: "0 0 20px rgba(0,0,0,0.3)",
};

const inputStyle = {
  backgroundColor: "#1A1A1D",
  border: "1px solid #333",
  borderRadius: "10px",
  padding: "14px 16px",
  color: "#FFFFFF",
  fontSize: "16px",
};
