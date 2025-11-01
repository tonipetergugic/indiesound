"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Upload } from "lucide-react";

export default function CreatePlaylistPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreatePlaylist = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter a playlist name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("You must be logged in to create a playlist.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("playlists").insert([
      {
        user_id: user.id,
        name,
        description,
        cover_url: coverUrl || null,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/library");
  };

  return (
    <div
      style={{
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#1A1A1D",
          borderRadius: "16px",
          padding: "40px",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "600" }}>Create Playlist</h2>

        {/* Cover Upload */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "12px",
              backgroundColor: "#18181A",
              backgroundImage: coverUrl
                ? `url(${coverUrl})`
                : "linear-gradient(180deg, #222 0%, #111 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
            onClick={() => {
              const url = prompt("Enter cover image URL (optional):");
              if (url) setCoverUrl(url);
            }}
          >
            {!coverUrl && <Upload size={32} color="#B3B3B3" />}
          </div>
        </div>

        {/* Playlist Name */}
        <input
          type="text"
          placeholder="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            backgroundColor: "#0E0E10",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            color: "#FFFFFF",
            fontSize: "16px",
            outline: "none",
          }}
        />

        {/* Description */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            backgroundColor: "#0E0E10",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            color: "#FFFFFF",
            fontSize: "15px",
            height: "80px",
            resize: "none",
            outline: "none",
          }}
        />

        {/* Error Message */}
        {errorMsg && (
          <p style={{ color: "#FF6B6B", fontSize: "14px", marginTop: "-5px" }}>
            {errorMsg}
          </p>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreatePlaylist}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#00E0B0" : "#00FFC6",
            color: "#000000",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </div>
    </div>
  );
}
