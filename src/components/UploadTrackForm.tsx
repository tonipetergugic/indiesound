"use client";

import { useRef, useState } from "react";
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

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

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

      // Upload Cover & Audio
      const [{ error: coverError }, { error: audioError }] = await Promise.all([
        supabase.storage.from("covers").upload(coverFile.name, coverFile, { upsert: true }),
        supabase.storage.from("tracks").upload(audioFile.name, audioFile, { upsert: true }),
      ]);

      if (coverError || audioError) throw coverError || audioError;

      // Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found.");

      // Insert Record
      const { error: insertError } = await supabase.from("tracks").insert([
        {
          title,
          artist,
          genre,
          bpm: bpm ? parseInt(bpm) : null,
          key_signature: keySignature,
          cover_url: coverFile.name,
          audio_url: audioFile.name,
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
