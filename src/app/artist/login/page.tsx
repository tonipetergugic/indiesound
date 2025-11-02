"use client";

import { useState, FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function ArtistLoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // ✅ Hole das Profil + prüfe Rolle
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "artist") {
        router.replace("/artist/home");
      } else {
        setError("Access denied: This account is not registered as an artist.");
        await supabase.auth.signOut();
      }
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>IndieSound for Artists – Login</h1>
        <p style={styles.subtitle}>Welcome back! Please sign in to continue.</p>

        <form onSubmit={handleSubmit} style={styles.form as React.CSSProperties}>
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
            inputMode="email"
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
            autoComplete="current-password"
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && (
          <p style={{ ...styles.feedback, color: "#ff6b6b" }}>{error}</p>
        )}

        <p style={{ ...styles.subtitle, marginTop: 16 }}>
          New to IndieSound? <a href="/artist/register" style={styles.link}>Create an account</a>
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


