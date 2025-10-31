"use client";

export default function HomePage() {
  const demoItems = Array.from({ length: 8 }, (_, i) => ({
    title: `Demo Track ${i + 1}`,
    artist: "Various Artists",
  }));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {demoItems.map((item, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "#1a1a1d",
            borderRadius: "12px",
            padding: "16px",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 0 10px #00FFC6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1/1",
              backgroundColor: "#242428",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          ></div>
          <h3 style={{ color: "#fff", fontSize: "1rem", marginBottom: "4px" }}>
            {item.title}
          </h3>
          <p style={{ color: "#B3B3B3", fontSize: "0.85rem" }}>{item.artist}</p>
        </div>
      ))}
    </div>
  );
}
