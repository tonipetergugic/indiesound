"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("✅ Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#0E0E10",
        color: "#FFFFFF",
        padding: "24px",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Welcome to IndieSound</h1>
      <p style={{ color: "#B3B3B3", marginBottom: "20px" }}>
        Log in or continue to discover fresh indie tracks.
      </p>

      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "360px" }}
      >
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #23232a",
            backgroundColor: "#1A1A1D",
            color: "#FFFFFF",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#00FFC6",
            color: "#0E0E10",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00E0B0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00FFC6";
          }}
        >
          {loading ? "Sending..." : "Continue with Email"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "16px", color: "#00FFC6" }}>{message}</p>
      )}
      {error && (
        <p style={{ marginTop: "16px", color: "#ff6b6b" }}>{error}</p>
      )}

      <p style={{ marginTop: "20px", color: "#B3B3B3", fontSize: "14px" }}>
        Are you an artist? <a href="/artist/register" style={{ color: "#00FFC6", textDecoration: "none" }}>Join IndieSound for Artists</a>
      </p>
    </div>
  );
}
