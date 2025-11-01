"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Upload } from "lucide-react";

export default function CreatePlaylistPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5 MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size exceeds 5 MB. Please choose a smaller image.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUploadError("You must be logged in to upload images.");
        setUploading(false);
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt || "jpg"}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("playlist-covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setUploadError(uploadError.message || "Failed to upload image.");
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("playlist-covers")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setCoverUrl(urlData.publicUrl);
        setUploadError("");
      } else {
        setUploadError("Failed to get image URL.");
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverClick = () => {
    fileInputRef.current?.click();
  };

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
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
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
              cursor: uploading ? "wait" : "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
              position: "relative",
            }}
            onClick={handleCoverClick}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.border = "2px solid rgba(0, 255, 198, 0.5)";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 255, 198, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = "none";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
            }}
          >
            {uploading ? (
              <div style={{ color: "#00FFC6", fontSize: "14px" }}>Uploading...</div>
            ) : (
              !coverUrl && <Upload size={32} color="#B3B3B3" />
            )}
          </div>
          {uploadError && (
            <p style={{ color: "#FF6B6B", fontSize: "12px", marginTop: "-5px", maxWidth: "160px" }}>
              {uploadError}
            </p>
          )}
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
