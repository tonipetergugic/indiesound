"use client";

import TrackCard from "@/components/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import type { Track } from "@/context/PlayerContext";

export default function HomePage() {
  const { setQueue } = usePlayer();
  
  const demoItems: Track[] = Array.from({ length: 8 }, (_, i) => ({
    title: `Demo Track ${i + 1}`,
    artist: "Various Artists",
    coverUrl: `https://picsum.photos/300?random=${i}`,
    audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`,
  }));

  const handleTrackClick = (index: number) => {
    // Setze alle Tracks als Queue und starte am angeklickten Index
    setQueue(demoItems, index);
  };

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
          imageUrl={item.coverUrl || undefined}
          audioUrl={item.audioUrl || undefined}
          onPlayClick={() => handleTrackClick(i)}
        />
      ))}
    </div>
  );
}
