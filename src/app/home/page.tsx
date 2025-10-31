"use client";

import TrackCard from "@/components/TrackCard";

export default function HomePage() {
  const demoItems = Array.from({ length: 8 }, (_, i) => ({
    title: `Demo Track ${i + 1}`,
    artist: "Various Artists",
    imageUrl: `https://picsum.photos/300?random=${i}`,
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
        <TrackCard
          key={i}
          title={item.title}
          artist={item.artist}
          imageUrl={item.imageUrl}
        />
      ))}
    </div>
  );
}
