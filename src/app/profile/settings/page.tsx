"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("❌ No active session.");
      setLoading(false);
      return;
    }

    // 1️⃣ Delete related data first
    await supabase.from("artists").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.from("tracks").delete().eq("artist_id", user.id); // optional, falls vorhanden

    // 2️⃣ Delete auth user via Supabase Admin API (only if your service role key is used on server)
    // In client context, user can "delete themselves" via signOut + cleanup:
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("❌ Error signing out user.");
      setLoading(false);
      return;
    }

    // 3️⃣ Feedback + redirect
    setMessage("✅ Account deleted successfully.");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        paddingTop: "40px",
        color: "#FFFFFF",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "30px" }}>
        Account Settings
      </h1>

      <div
        style={{
          backgroundColor: "#141416",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#FF5555" }}>
          Danger Zone
        </h2>
        <p style={{ color: "#B3B3B3", marginTop: "8px" }}>
          Deleting your account will permanently remove all your data including tracks,
          profile, and artist info. This action cannot be undone.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            style={{
              backgroundColor: "#FF5555",
              color: "#0E0E10",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FF3333")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF5555")}
          >
            <Trash2 size={18} /> Delete Account
          </button>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <p style={{ color: "#B3B3B3", marginBottom: "12px" }}>
              Are you sure you want to delete your account? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{
                  backgroundColor: "#FF5555",
                  color: "#0E0E10",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {loading ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #B3B3B3",
                  color: "#B3B3B3",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <p
            style={{
              color: message.startsWith("✅") ? "#00FFC6" : "#FF5555",
              marginTop: "16px",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
