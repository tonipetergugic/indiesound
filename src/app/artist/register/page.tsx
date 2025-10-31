"use client";

import { useState, FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function ArtistRegisterPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // Try to get user id from immediate session or user
      const userId = signUpData.user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        // If email confirmation is required, user may be null
        throw new Error("Please verify your email to complete registration.");
      }

      const { error: insertError } = await supabase.from("artists").insert([
        { id: userId, display_name: displayName },
      ]);
      if (insertError) throw insertError;

      router.replace("/artist/upload");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to IndieSound for Artists</h1>
        <p style={styles.subtitle}>Let’s set up your artist account.</p>

        <form onSubmit={handleSubmit} style={styles.form as React.CSSProperties}>
          <label htmlFor="displayName" style={styles.label}>Display Name</label>
          <input
            id="displayName"
            type="text"
            required
            placeholder="Your artist name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
          />

          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="email"
          />

          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="new-password"
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {error && (
          <p style={{ ...styles.feedback, color: "#ff6b6b" }}>{error}</p>
        )}

        <p style={{ ...styles.subtitle, marginTop: 16 }}>
          Already have an account? <a href="/artist/login" style={styles.link}>Log in</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0E10",
    padding: "24px",
    color: "#FFFFFF",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#111114",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
    border: "1px solid #1e1e22",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    margin: 0,
    marginBottom: "8px",
    color: "#FFFFFF",
    letterSpacing: "0.2px",
  },
  subtitle: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#B3B3B3",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "13px",
    color: "#B3B3B3",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #23232a",
    outline: "none",
    backgroundColor: "#1A1A1D",
    color: "#FFFFFF",
    fontSize: "14px",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  } as React.CSSProperties,
  button: {
    marginTop: "6px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#00FFC6",
    color: "#0E0E10",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.15s ease, transform 0.02s ease",
  } as React.CSSProperties,
  feedback: {
    marginTop: "14px",
    fontSize: "14px",
  },
  link: {
    color: "#00FFC6",
    textDecoration: "none",
  },
} satisfies Record<string, React.CSSProperties>;


