"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Image as ImageIcon, CheckCircle } from "lucide-react";

export default function ArtistProfileForm() {
  const supabase = createClientComponentClient();

  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("bio, avatar_url, instagram, facebook, twitter")
        .eq("id", user.id)
        .single();

      if (profile) {
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
        setInstagram(profile.instagram || "");
        setFacebook(profile.facebook || "");
        setTwitter(profile.twitter || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileName = `artist_avatars/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error(error);
      setMessage("❌ Error uploading image.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Nur Felder aktualisieren, die Werte enthalten
    const updateData: Record<string, any> = {};
    if (bio) updateData.bio = bio;
    if (avatarUrl) updateData.avatar_url = avatarUrl;
    if (instagram) updateData.instagram = instagram;
    if (facebook) updateData.facebook = facebook;
    if (twitter) updateData.twitter = twitter;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    setSaving(false);
    setMessage(error ? "❌ Error saving profile." : "✅ Profile updated successfully!");
  };

  const handleReset = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("bio, avatar_url, instagram, facebook, twitter")
      .eq("id", user.id)
      .single();

    if (profile) {
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || null);
      setInstagram(profile.instagram || "");
      setFacebook(profile.facebook || "");
      setTwitter(profile.twitter || "");
    }

    setMessage("🔄 Changes reset to last saved version.");
    setLoading(false);
  };

  if (loading) {
    return <p style={{ color: "#B3B3B3" }}>Loading profile...</p>;
  }

  return (
    <div
      style={{
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>Artist Profile</h2>

      {/* Avatar Upload */}
      <div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          style={{ display: "none" }}
        />
        <div
          onClick={() => avatarInputRef.current?.click()}
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ImageIcon size={22} color="#00FFC6" />
            <div style={{ fontSize: "16px" }}>
              {uploading ? "Uploading..." : "Upload Profile Picture"}
            </div>
            {avatarUrl ? (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={18} color="#00FFC6" />
                <img
                  src={avatarUrl}
                  alt="avatar"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #00FFC6",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  fontSize: "13px",
                  color: "#B3B3B3",
                  marginTop: "4px",
                }}
              >
                JPG oder PNG auswählen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          style={{
            ...inputStyle,
            height: "100px",
            resize: "none",
          }}
        />
      </div>

      {/* Socials */}
      <div style={{ display: "grid", gap: "12px" }}>
        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram URL"
          style={inputStyle}
        />
        <input
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="Facebook URL"
          style={inputStyle}
        />
        <input
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="X / Twitter URL"
          style={inputStyle}
        />
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "#00FFC6",
            color: "#0E0E10",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00E0B0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00FFC6")}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            backgroundColor: "transparent",
            color: "#00FFC6",
            border: "1px solid #00FFC6",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: "10px",
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#00FFC6";
            e.currentTarget.style.color = "#0E0E10";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#00FFC6";
          }}
        >
          Reset Changes
        </button>
      </div>

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
