"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Image as ImageIcon, CheckCircle, Lock } from "lucide-react";

export default function ArtistProfileForm() {
  const supabase = createClientComponentClient();

  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [x, setX] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // FETCH EXISTING PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artist } = await supabase
        .from("artists")
        .select("bio, social_links")
        .eq("user_id", user.id)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (artist) {
        setBio(artist.bio || "");
        if (artist.social_links) {
          const links =
            typeof artist.social_links === "string"
              ? JSON.parse(artist.social_links)
              : artist.social_links;
          setWebsite(links.website || "");
          setInstagram(links.instagram || "");
          setFacebook(links.facebook || "");
          setX(links.x || links.twitter || "");
        }
      }

      if (profile?.avatar_url) {
        const key = profile.avatar_url?.startsWith("http")
          ? null
          : profile.avatar_url;
        if (key) {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(key);
          setAvatarUrl(publicData?.publicUrl || null);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  // AVATAR UPLOAD
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profileData?.avatar_url) {
      const oldKey = profileData.avatar_url?.startsWith("http")
        ? null
        : profileData.avatar_url;
      if (oldKey)
        await supabase.storage.from("avatars").remove([oldKey]);
    }

    const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setMessage("❌ Error uploading image.");
      setUploading(false);
      return;
    }

    await supabase.from("profiles").update({ avatar_url: filePath }).eq("id", user.id);

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl || null);
    setUploading(false);
  };

  // SAVE PROFILE INFO
  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const socialLinks: Record<string, string> = {};
    if (website) socialLinks.website = website.trim();
    if (instagram) socialLinks.instagram = instagram.trim();
    if (facebook) socialLinks.facebook = facebook.trim();
    if (x) socialLinks.twitter = x.trim();

    const updateData = {
      bio: bio || null,
      social_links: Object.keys(socialLinks).length ? socialLinks : null,
    };

    const { error } = await supabase
      .from("artists")
      .update(updateData)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) setMessage("❌ Error saving profile.");
    else setMessage("✅ Profile updated successfully!");
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setMessage("⚠️ Please enter a new password.");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });
    setChangingPassword(false);
    if (error) setMessage("❌ Failed to update password.");
    else {
      setMessage("✅ Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    }
  };

  if (loading) return <p style={{ color: "#B3B3B3" }}>Loading profile...</p>;

  return (
    <div style={{ color: "#FFFFFF", display: "flex", flexDirection: "column", gap: "24px" }}>
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
            <div style={{ fontSize: "13px", color: "#B3B3B3", marginTop: "4px" }}>
              Select a JPG or PNG file
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write something about yourself..."
        style={{ ...inputStyle, height: "100px", resize: "none" }}
      />

      {/* Social Links */}
      <div style={{ display: "grid", gap: "12px" }}>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" style={inputStyle} />
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram URL" style={inputStyle} />
        <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook URL" style={inputStyle} />
        <input value={x} onChange={(e) => setX(e.target.value)} placeholder="X (Twitter) URL" style={inputStyle} />
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={handleSave} disabled={saving} style={buttonPrimary}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: "#333", margin: "20px 0" }} />

      {/* CHANGE PASSWORD */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <Lock size={18} /> Change Password
        </h3>
        <input
          type="password"
          placeholder="Current password (optional)"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={handleChangePassword}
          disabled={changingPassword}
          style={buttonSecondary}
        >
          {changingPassword ? "Updating..." : "Update Password"}
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

const buttonPrimary: React.CSSProperties = {
  backgroundColor: "#00FFC6",
  color: "#0E0E10",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#00FFC6",
  border: "1px solid #00FFC6",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
};
