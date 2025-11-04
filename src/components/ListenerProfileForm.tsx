"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Image as ImageIcon, CheckCircle } from "lucide-react";

export default function ListenerProfileForm() {
  const supabase = createClientComponentClient();
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (profile?.avatar_url) {
        const key = profile.avatar_url.startsWith("http")
          ? null
          : profile.avatar_url;
        if (key) {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(key);
          setAvatarUrl(publicData?.publicUrl || null);
        }
      }
    };
    loadData();
  }, [supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profile?.avatar_url) {
      const oldKey = profile.avatar_url.startsWith("http")
        ? null
        : profile.avatar_url;
      if (oldKey) await supabase.storage.from("avatars").remove([oldKey]);
    }

    const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: false });

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

  const handleEmailUpdate = async () => {
    if (!newEmail.trim() || !confirmEmail.trim()) {
      setMessage("⚠️ Please fill in both email fields.");
      return;
    }
    if (newEmail.trim() !== confirmEmail.trim()) {
      setMessage("❌ Emails do not match.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSaving(false);
    if (error) setMessage("❌ Failed to update email.");
    else {
      setMessage("✅ Confirmation email sent! Please check your inbox.");
      setNewEmail("");
      setConfirmEmail("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#fff" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>Listener Profile</h2>

      {/* Avatar Upload */}
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
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <ImageIcon size={22} color="#00FFC6" />
        <div>{uploading ? "Uploading..." : "Upload Profile Picture"}</div>
        {avatarUrl ? (
          <div style={{ marginTop: "10px" }}>
            <CheckCircle size={18} color="#00FFC6" />{" "}
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
          <p style={{ color: "#B3B3B3", fontSize: "13px" }}>Select a JPG or PNG file</p>
        )}
      </div>

      {/* Current Email */}
      <div style={{ color: "#B3B3B3", fontSize: "14px" }}>
        <strong>Current email:</strong> {currentEmail}
      </div>

      {/* New Email Inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Enter new email"
          style={inputStyle}
        />
        <input
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder="Confirm new email"
          style={inputStyle}
        />
      </div>

      <button
        onClick={handleEmailUpdate}
        disabled={saving}
        style={buttonPrimary}
      >
        {saving ? "Saving..." : "Update Email"}
      </button>

      {message && (
        <p
          style={{
            color: message.startsWith("✅") ? "#00FFC6" : "#FF5555",
            marginTop: "8px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "#1A1A1D",
  border: "1px solid #333",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
};

const buttonPrimary: React.CSSProperties = {
  backgroundColor: "#00FFC6",
  color: "#0E0E10",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
};
