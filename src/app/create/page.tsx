"use client";

import { useRouter } from "next/navigation";
import { Music, Upload, UserPlus } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();

  const menuItems = [
    {
      label: "Create Playlist",
      icon: <Music size={22} color="#00FFC6" />,
      action: () => router.push("/create/playlist"),
    },
    {
      label: "Upload Track",
      icon: <Upload size={22} color="#00FFC6" />,
      action: () => alert("Coming soon!"),
    },
    {
      label: "Create Artist Page",
      icon: <UserPlus size={22} color="#00FFC6" />,
      action: () => alert("Coming soon!"),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "#1A1A1D",
          borderRadius: "16px",
          padding: "30px",
          width: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2
          style={{
            color: "#FFFFFF",
            fontSize: "20px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Create
        </h2>

        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "#18181A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              padding: "12px 16px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget.style.backgroundColor = "#00E0B0");
              (e.currentTarget.style.color = "#000000");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget.style.backgroundColor = "#18181A");
              (e.currentTarget.style.color = "#FFFFFF");
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
