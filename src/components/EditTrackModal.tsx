"use client";

import React from "react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { X } from "lucide-react";

type Track = {
  id: string;
  title: string;
  genre: string | null;
  bpm: number | null;
  key_signature: string | null;
  cover_url: string | null;
};

type EditTrackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onSave: () => void;
};

export default function EditTrackModal({
  isOpen,
  onClose,
  track,
  onSave,
}: EditTrackModalProps) {
  const supabase = createClientComponentClient();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Prefill form when track changes
  useEffect(() => {
    if (track) {
      setTitle(track.title || "");
      setGenre(track.genre || "");
      setBpm(track.bpm?.toString() || "");
      setKeySignature(track.key_signature || "");
      setCoverUrl(track.cover_url || "");
      setMessage("");
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const updateData: Record<string, any> = {
        title: title.trim(),
        genre: genre.trim() || null,
        bpm: bpm.trim() ? parseInt(bpm.trim()) : null,
        key_signature: keySignature.trim() || null,
        cover_url: coverUrl.trim() || null,
      };

      const { error } = await supabase
        .from("tracks")
        .update(updateData)
        .eq("id", track.id);

      if (error) {
        throw error;
      }

      setMessage("✅ Track updated");
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("Error updating track:", error);
      setMessage("❌ Error updating track. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#1A1A1D",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#121214",
          borderRadius: "16px",
          padding: "24px",
          width: "90%",
          maxWidth: "500px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "transparent",
            border: "none",
            color: "#B3B3B3",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#B3B3B3";
          }}
        >
          <X size={24} />
        </button>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#FFFFFF",
            marginBottom: "24px",
            marginRight: "32px",
          }}
        >
          Edit Track
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Title */}
          <div>
            <label
              style={{
                display: "block",
                color: "#B3B3B3",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
              style={inputStyle}
              required
            />
          </div>

          {/* Genre */}
          <div>
            <label
              style={{
                display: "block",
                color: "#B3B3B3",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Electronic, Rock, Pop"
              style={inputStyle}
            />
          </div>

          {/* BPM */}
          <div>
            <label
              style={{
                display: "block",
                color: "#B3B3B3",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              BPM
            </label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="e.g., 120"
              style={inputStyle}
              min="0"
            />
          </div>

          {/* Key Signature */}
          <div>
            <label
              style={{
                display: "block",
                color: "#B3B3B3",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Key Signature
            </label>
            <input
              type="text"
              value={keySignature}
              onChange={(e) => setKeySignature(e.target.value)}
              placeholder="e.g., C Major, Am"
              style={inputStyle}
            />
          </div>

          {/* Cover URL */}
          <div>
            <label
              style={{
                display: "block",
                color: "#B3B3B3",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Cover URL
            </label>
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="Cover image URL or storage path"
              style={inputStyle}
            />
          </div>

          {/* Message */}
          {message && (
            <p
              style={{
                color: message.startsWith("✅") ? "#00FFC6" : "#FF5555",
                fontSize: "14px",
                margin: 0,
              }}
            >
              {message}
            </p>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              backgroundColor: "#00FFC6",
              color: "#0E0E10",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: saving || !title.trim() ? "not-allowed" : "pointer",
              transition: "background-color 0.2s ease",
              opacity: saving || !title.trim() ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saving && title.trim()) {
                e.currentTarget.style.backgroundColor = "#00E0B0";
              }
            }}
            onMouseLeave={(e) => {
              if (!saving && title.trim()) {
                e.currentTarget.style.backgroundColor = "#00FFC6";
              }
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}



