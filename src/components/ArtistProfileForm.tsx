"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Image as ImageIcon, CheckCircle } from "lucide-react";

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

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch artist data (bio and social_links)
      const { data: artist } = await supabase
        .from("artists")
        .select("bio, social_links")
        .eq("user_id", user.id)
        .single();

      // Fetch profile data (avatar_url)
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (artist) {
        setBio(artist.bio || "");
        
        // Parse social_links JSON if it exists
        if (artist.social_links) {
          const socialLinks = typeof artist.social_links === 'string' 
            ? JSON.parse(artist.social_links) 
            : artist.social_links;
          setWebsite(socialLinks.website || "");
          setInstagram(socialLinks.instagram || "");
          setFacebook(socialLinks.facebook || "");
          // Accept both "x" and "twitter" keys for X (Twitter)
          setX(socialLinks.x || socialLinks.twitter || "");
        }
      }

      // Handle avatar URL from profiles
      if (profile?.avatar_url) {
        const key = profile.avatar_url?.startsWith("http") ? null : profile.avatar_url || null;
        if (key) {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(key);
          setAvatarUrl(publicData?.publicUrl || null);
        } else {
          setAvatarUrl(null);
        }
      } else {
        setAvatarUrl(null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("❌ Not authenticated.");
      setUploading(false);
      return;
    }

    // Vor dem Upload: bisherigen Avatar-Key aus profiles holen und ggf. löschen
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
    if (profileData?.avatar_url) {
      const oldKey = profileData.avatar_url?.startsWith("http") ? null : profileData.avatar_url;
      if (oldKey) {
        const { error: removeError } = await supabase.storage
          .from("avatars")
          .remove([oldKey]);
        if (removeError) {
          console.error("Error removing previous avatar:", removeError);
          // wir fahren fort, um den neuen Avatar trotzdem zu speichern
        }
      }
    }

    const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error(error);
      setMessage("❌ Error uploading image.");
      setUploading(false);
      return;
    }

    // Speichere den Storage-Key in profiles.avatar_url
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      setMessage("❌ Error saving avatar path.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl || null);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Build social_links object
    const socialLinks: Record<string, string> = {};
    if (website.trim()) socialLinks.website = website.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    // Store X (Twitter) under "twitter" key to match existing Supabase data
    if (x.trim()) socialLinks.twitter = x.trim();

    // Prepare update data (only bio and social_links, avatar_url is in profiles)
    const updateData: Record<string, any> = {
      bio: bio || null,
      social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
    };

    // Log the complete updateData object to verify JSON output
    console.log("Update data:", JSON.stringify(updateData, null, 2));

    const { error } = await supabase
      .from("artists")
      .update(updateData)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      setMessage("❌ Error saving profile.");
      console.error("Error updating artist profile:", error);
    } else {
      setMessage("✅ Profile updated successfully!");
      console.log("Artist profile updated successfully");
    }
  };

  const handleReset = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch artist data (bio and social_links)
    const { data: artist } = await supabase
      .from("artists")
      .select("bio, social_links")
      .eq("user_id", user.id)
      .single();

    // Fetch profile data (avatar_url)
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (artist) {
      setBio(artist.bio || "");
      
      // Parse social_links JSON if it exists
      if (artist.social_links) {
        const socialLinks = typeof artist.social_links === 'string' 
          ? JSON.parse(artist.social_links) 
          : artist.social_links;
        setWebsite(socialLinks.website || "");
        setInstagram(socialLinks.instagram || "");
        setFacebook(socialLinks.facebook || "");
        // Accept both "x" and "twitter" keys for X (Twitter)
        setX(socialLinks.x || socialLinks.twitter || "");
      } else {
        setWebsite("");
        setInstagram("");
        setFacebook("");
        setX("");
      }
    }

    // Handle avatar URL from profiles
    if (profile?.avatar_url) {
      const key = profile.avatar_url?.startsWith("http") ? null : profile.avatar_url || null;
      if (key) {
        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(key);
        setAvatarUrl(publicData?.publicUrl || null);
      } else {
        setAvatarUrl(null);
      }
    } else {
      setAvatarUrl(null);
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
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Website URL"
          style={inputStyle}
        />
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
          value={x}
          onChange={(e) => setX(e.target.value)}
          placeholder="X (Twitter) URL"
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
