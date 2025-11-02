"use client";

import Link from "next/link";
import { Upload, BarChart3, Music } from "lucide-react";

export default function ArtistHomePage() {
  return (
    <div
      style={{
        padding: "40px",
        color: "#FFFFFF",
        backgroundColor: "#0E0E10",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        Welcome back, Artist 🎧
      </h1>

      <p
        style={{
          color: "#B3B3B3",
          marginBottom: "32px",
          fontSize: "15px",
        }}
      >
        Manage your tracks, see your stats, and upload new releases.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Upload Track */}
        <Link
          href="/artist/upload"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111114",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid #1e1e22",
            cursor: "pointer",
            textDecoration: "none",
            color: "#FFFFFF",
            transition: "all 0.2s ease",
          }}
        >
          <Upload size={44} color="#00FFC6" />
          <span style={{ marginTop: "12px", fontWeight: 600, fontSize: "16px" }}>
            Upload Track
          </span>
        </Link>

        {/* My Tracks */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111114",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid #1e1e22",
            color: "#B3B3B3",
          }}
        >
          <Music size={44} color="#00FFC6" />
          <span style={{ marginTop: "12px", fontWeight: 600, fontSize: "16px" }}>
            My Tracks
          </span>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
            Coming soon
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111114",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid #1e1e22",
            color: "#B3B3B3",
          }}
        >
          <BarChart3 size={44} color="#00FFC6" />
          <span style={{ marginTop: "12px", fontWeight: 600, fontSize: "16px" }}>
            Stats
          </span>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}

