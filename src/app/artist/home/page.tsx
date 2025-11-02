"use client";

import { useState } from "react";
import { Upload, BarChart3, Music, User } from "lucide-react";
import UploadTrackForm from "@/components/UploadTrackForm";
import MyTracks from "@/components/MyTracks";
import Stats from "@/components/Stats";
import ArtistProfileForm from "@/components/ArtistProfileForm";

export default function ArtistHomePage() {
  const [activePanel, setActivePanel] = useState<
    "upload" | "tracks" | "stats" | "profile" | null
  >(null);

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
        style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "12px" }}
      >
        Welcome back, Artist 🎧
      </h1>
      <p style={{ color: "#B3B3B3", marginBottom: "32px", fontSize: "15px" }}>
        Manage your tracks, see your stats, and customize your profile.
      </p>

      {/* Kacheln */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          onClick={() =>
            setActivePanel(activePanel === "upload" ? null : "upload")
          }
          style={cardStyle}
        >
          <Upload size={42} color="#00FFC6" />
          <span style={labelStyle}>Upload Track</span>
        </div>

        <div
          onClick={() =>
            setActivePanel(activePanel === "tracks" ? null : "tracks")
          }
          style={cardStyle}
        >
          <Music size={42} color="#00FFC6" />
          <span style={labelStyle}>My Tracks</span>
        </div>

        <div
          onClick={() =>
            setActivePanel(activePanel === "stats" ? null : "stats")
          }
          style={cardStyle}
        >
          <BarChart3 size={42} color="#00FFC6" />
          <span style={labelStyle}>Stats</span>
        </div>

        <div
          onClick={() =>
            setActivePanel(activePanel === "profile" ? null : "profile")
          }
          style={cardStyle}
        >
          <User size={42} color="#00FFC6" />
          <span style={labelStyle}>Artist Profile</span>
        </div>
      </div>

      {/* Dynamischer Bereich */}
      <div
        style={{
          backgroundColor: "#111114",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #1e1e22",
        }}
      >
        {activePanel === "upload" && <UploadTrackForm />}
        {activePanel === "tracks" && <MyTracks />}
        {activePanel === "stats" && <Stats />}
        {activePanel === "profile" && <ArtistProfileForm />}
        {!activePanel && (
          <p style={{ color: "#B3B3B3", textAlign: "center" }}>
            Select a section above to get started.
          </p>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  marginTop: "12px",
  fontWeight: 600,
  fontSize: "16px",
};
