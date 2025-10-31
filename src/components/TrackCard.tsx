"use client";

interface TrackCardProps {
  title: string;
  artist: string;
  imageUrl?: string;
}

export default function TrackCard({ title, artist, imageUrl }: TrackCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#121214",
        borderRadius: "16px",
        padding: "16px",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 255, 198, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          marginBottom: "12px",
          overflow: "hidden",
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              backgroundColor: "#1a1a1d",
              borderRadius: "12px",
            }}
          />
        )}
      </div>
      <h3
        style={{
          color: "#FFFFFF",
          fontSize: "1rem",
          margin: 0,
          marginBottom: "4px",
          fontWeight: "bold",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#B3B3B3",
          fontSize: "0.85rem",
          margin: 0,
        }}
      >
        {artist}
      </p>
    </div>
  );
}
