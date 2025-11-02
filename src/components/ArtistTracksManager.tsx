"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pencil, Trash2 } from "lucide-react";
import EditTrackModal from "./EditTrackModal";

type Track = {
  id: string;
  title: string;
  genre: string | null;
  bpm: number | null;
  key_signature: string | null;
  cover_url: string | null;
  created_at: string;
};

export default function ArtistTracksManager() {
  const supabase = createClientComponentClient();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTracks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tracks")
      .select("id, title, genre, bpm, key_signature, audio_url, cover_url, artist, artist_id, created_at")
      .eq("artist_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tracks:", error);
      setTracks([]);
    } else {
      setTracks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleDelete = async (trackId: string, trackTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${trackTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // First, fetch the track to get audio_url and cover_url
      const { data: trackData, error: fetchError } = await supabase
        .from("tracks")
        .select("id, title, genre, bpm, key_signature, audio_url, cover_url, artist, artist_id, created_at")
        .eq("id", trackId)
        .single();

      if (fetchError) {
        throw new Error("Failed to fetch track data");
      }

      // Extract file paths from URLs or use directly if already a path
      let audioPath: string | null = null;
      let coverPath: string | null = null;

      if (trackData.audio_url) {
        // Check if it's a full URL or just a path
        if (trackData.audio_url.includes('/storage/v1/object/public/tracks/')) {
          audioPath = trackData.audio_url.split('/storage/v1/object/public/tracks/')[1];
        } else if (trackData.audio_url.includes('/storage/v1/object/sign/tracks/')) {
          audioPath = trackData.audio_url.split('/storage/v1/object/sign/tracks/')[1];
        } else {
          // Already a path, use directly
          audioPath = trackData.audio_url;
        }
      }

      if (trackData.cover_url) {
        // Check if it's a full URL or just a path
        if (trackData.cover_url.includes('/storage/v1/object/public/covers/')) {
          coverPath = trackData.cover_url.split('/storage/v1/object/public/covers/')[1];
        } else if (trackData.cover_url.includes('/storage/v1/object/sign/covers/')) {
          coverPath = trackData.cover_url.split('/storage/v1/object/sign/covers/')[1];
        } else {
          // Already a path, use directly
          coverPath = trackData.cover_url;
        }
      }

      // Delete files from storage (with error handling for missing files)
      if (audioPath) {
        try {
          await supabase.storage.from("tracks").remove([audioPath]);
        } catch (storageError) {
          console.warn("Could not delete audio file (may not exist):", storageError);
        }
      }

      if (coverPath) {
        try {
          await supabase.storage.from("covers").remove([coverPath]);
        } catch (storageError) {
          console.warn("Could not delete cover file (may not exist):", storageError);
        }
      }

      // Delete the database row
      const { error: deleteError } = await supabase
        .from("tracks")
        .delete()
        .eq("id", trackId);

      if (deleteError) {
        throw deleteError;
      }

      // Show success message
      alert("✅ Track and associated files deleted.");

      // Refresh the list
      await fetchTracks();
    } catch (error: any) {
      console.error("Error deleting track:", error);
      alert("❌ Error deleting track. Please try again.");
    }
  };

  const handleEdit = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
  };

  const handleSave = async () => {
    await fetchTracks();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>My Tracks</h2>
        <p style={{ color: "#B3B3B3" }}>Loading tracks...</p>
      </div>
    );
  }

  return (
    <>
      <EditTrackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        track={selectedTrack}
        onSave={handleSave}
      />
      <div>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>My Tracks</h2>

      {tracks.length === 0 ? (
        <p style={{ color: "#B3B3B3" }}>No tracks uploaded yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tracks.map((track) => {
            const coverUrl = track.cover_url
              ? supabase.storage.from("covers").getPublicUrl(track.cover_url).data?.publicUrl
              : null;

            return (
              <div
                key={track.id}
                style={{
                  backgroundColor: "#1A1A1D",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#202023";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1A1A1D";
                }}
              >
                {/* Cover */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    flexShrink: 0,
                    backgroundColor: "#121214",
                    backgroundImage: coverUrl ? `url(${coverUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!coverUrl && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #00FFC6, #00E0B0)",
                      }}
                    >
                      <span style={{ color: "#0E0E10", fontSize: "24px" }}>🎵</span>
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      color: "#FFFFFF",
                      fontSize: "16px",
                      fontWeight: 600,
                      margin: "0 0 4px 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {track.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      color: "#B3B3B3",
                      fontSize: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    {track.genre && (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        Genre: {track.genre}
                      </span>
                    )}
                    {track.bpm && (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        BPM: {track.bpm}
                      </span>
                    )}
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {formatDate(track.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => handleEdit(track)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #00FFC6",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#00FFC6",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#00FFC6";
                      e.currentTarget.style.color = "#0E0E10";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#00FFC6";
                    }}
                  >
                    <Pencil size={16} />
                    <span style={{ fontSize: "14px" }}>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(track.id, track.title)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #FF5555",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#FF5555",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FF5555";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#FF5555";
                    }}
                  >
                    <Trash2 size={16} />
                    <span style={{ fontSize: "14px" }}>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}

