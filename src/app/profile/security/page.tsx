"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { LogOut } from "lucide-react";

export default function SecurityPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGlobalLogout = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      setMessage("✅ All other sessions have been logged out.");
    } catch (err: any) {
      setMessage(`❌ ${err.message || "Error logging out sessions."}`);
    } finally {
      setLoading(false);
    }
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
        Security
      </h1>

      {/* Active Sessions Card */}
      <div
        style={{
          backgroundColor: "#141416",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "10px" }}>
          Active Sessions
        </h2>
        <p style={{ color: "#B3B3B3", marginBottom: "20px" }}>
          If you’ve logged in on other devices, you can end all other sessions
          except this one for better security.
        </p>

        <button
          onClick={handleGlobalLogout}
          disabled={loading}
          style={{
            backgroundColor: "#00FFC6",
            color: "#0E0E10",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00E0B0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00FFC6")}
        >
          <LogOut size={18} />
          {loading ? "Logging out..." : "Log out from all other devices"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "16px",
              color: message.startsWith("✅") ? "#00FFC6" : "#FF5555",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
