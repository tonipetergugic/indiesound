"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ArtistProfilePage() {
  const supabase = createClientComponentClient();

  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [spotify, setSpotify] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("bio, avatar_url, instagram, spotify, soundcloud")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
        setInstagram(profile.instagram || "");
        setSpotify(profile.spotify || "");
        setSoundcloud(profile.soundcloud || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
        avatar_url: avatarUrl,
        instagram,
        spotify,
        soundcloud,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#B3B3B3" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#0E0E10",
        minHeight: "100vh",
        padding: "40px",
        color: "#FFFFFF",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "30px" }}>
        Edit Artist Profile
      </h1>

      {/* Avatar */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", marginBottom: "10px", color: "#B3B3B3" }}>
          Profile Picture URL
        </label>
        <input
          type="text"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Artist Avatar"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              marginTop: "15px",
              objectFit: "cover",
              border: "2px solid #00FFC6",
            }}
          />
        )}
      </div>

      {/* Bio */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", marginBottom: "10px", color: "#B3B3B3" }}>
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          style={{
            ...inputStyle,
            height: "120px",
            resize: "none",
          }}
        />
      </div>

      {/* Social Links */}
      <div style={{ display: "grid", gap: "20px", marginBottom: "30px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "6px", color: "#B3B3B3" }}>
            Instagram
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", color: "#B3B3B3" }}>
            Spotify
          </label>
          <input
            type="text"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            placeholder="https://open.spotify.com/artist/..."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", color: "#B3B3B3" }}>
            SoundCloud
          </label>
          <input
            type="text"
            value={soundcloud}
            onChange={(e) => setSoundcloud(e.target.value)}
            placeholder="https://soundcloud.com/..."
            style={inputStyle}
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          backgroundColor: "#00FFC6",
          color: "#0E0E10",
          border: "none",
          borderRadius: "10px",
          padding: "12px 24px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background-color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00E0B0")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00FFC6")}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1A1A1D",
  color: "#FFFFFF",
  fontSize: "14px",
  outline: "none",
};

