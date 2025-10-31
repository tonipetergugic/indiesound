"use client";

import TrackCard from "@/components/TrackCard";

export default function LibraryPage() {
  const demoItems = Array.from({ length: 6 }, (_, i) => ({
    title: `Saved Track ${i + 1}`,
    artist: "Favorite Artist",
    imageUrl: `https://picsum.photos/300?random=${i + 20}`,
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
