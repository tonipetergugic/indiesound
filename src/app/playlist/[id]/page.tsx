"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Play, Pause, MoreHorizontal, Plus } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { usePlayer } from "@/context/PlayerContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  cover_url?: string | null;
  created_at: string;
  user_id: string;
  is_public?: boolean;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  audio_url: string;
  cover_url?: string | null;
};

type PlaylistTrack = {
  id: string;
  position: number;
  tracks: Track;
};

type AvailableTrack = {
  id: string;
  title: string;
  artist: string;
};

function SortableRow({ playlistTrack, supabase }: { playlistTrack: PlaylistTrack; supabase: ReturnType<typeof createClientComponentClient> }) {
  const track = playlistTrack.tracks;
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: playlistTrack.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const coverUrl = track.cover_url
    ? supabase.storage.from("covers").getPublicUrl(track.cover_url).data?.publicUrl
    : null;

  const audioUrl = track.audio_url
    ? supabase.storage.from("tracks").getPublicUrl(track.audio_url).data?.publicUrl
    : null;

  const isCurrentTrack = currentTrack?.title === track.title && currentTrack?.artist === track.artist;
  const showPlayIcon = isHoveringCover || isCurrentTrack;

  // Calculate row background color
  const getRowBackground = () => {
    if (isDragging) return "transparent";
    if (isCurrentTrack) return "rgba(0, 255, 198, 0.1)";
    return "transparent";
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    
    if (!audioUrl || isDragging) return;

    if (isCurrentTrack) {
      // Current track: toggle play/pause
      togglePlay();
    } else {
      // Different track: play this track
      playTrack({
        title: track.title,
        artist: track.artist,
        coverUrl: coverUrl || null,
        audioUrl: audioUrl || null,
      });
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Only play if not dragging and audioUrl exists
    // Skip if clicking on the icon overlay
    if (!isDragging && audioUrl && !(e.target as HTMLElement).closest('[data-play-button]')) {
      if (isCurrentTrack) {
        togglePlay();
      } else {
        playTrack({
          title: track.title,
          artist: track.artist,
          coverUrl: coverUrl || null,
          audioUrl: audioUrl || null,
        });
      }
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={{
        borderTop: "1px solid #222",
        cursor: "pointer",
        background: getRowBackground(),
        boxShadow: isDragging 
          ? "0 0 20px rgba(0,255,198,0.3)" 
          : isCurrentTrack 
            ? "0 0 8px rgba(0,255,198,0.3)" 
            : "none",
        transition: transition || "background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        ...style,
      }}
      {...attributes}
      {...listeners}
      onClick={handleRowClick}
      onMouseEnter={(e) => {
        if (!isDragging) {
          if (isCurrentTrack) {
            e.currentTarget.style.background = "rgba(0,255,198,0.15)";
          } else {
            e.currentTarget.style.background = "rgba(0,255,198,0.08)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.background = getRowBackground();
        }
      }}
    >
      <td style={{ padding: "5px 0", color: isCurrentTrack ? "#FFFFFF" : "#B3B3B3" }}>
        {playlistTrack.position}
      </td>
      <td style={{ padding: "5px 8px 5px 0" }}>
        <div
          style={{
            position: "relative",
            width: "48px",
            height: "48px",
            borderRadius: "6px",
            overflow: "hidden",
          }}
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={track.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #00FFC6, #00E0B0)",
              }}
            />
          )}
          {/* Play/Pause Icon Overlay */}
          <div
            data-play-button
            onClick={handleIconClick}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: showPlayIcon ? "rgba(0,0,0,0.5)" : "transparent",
              opacity: showPlayIcon ? 1 : 0,
              transition: "opacity 0.2s ease, background-color 0.2s ease",
              cursor: "pointer",
            }}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause
                size={20}
                fill="#00FFC6"
                color="#00FFC6"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(0,255,198,0.8))",
                  transition: "filter 0.2s ease",
                }}
              />
            ) : (
              <Play
                size={20}
                fill="#00FFC6"
                color="#00FFC6"
                style={{
                  filter: isCurrentTrack ? "drop-shadow(0 0 8px rgba(0,255,198,0.8))" : "none",
                  transition: "filter 0.2s ease",
                }}
              />
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: "5px 0", color: isCurrentTrack ? "#FFFFFF" : "#FFFFFF" }}>{track.title}</td>
      <td style={{ padding: "5px 0", color: isCurrentTrack ? "#CCCCCC" : "#B3B3B3" }}>
        {track.artist}
      </td>
      <td style={{ padding: "5px 0", color: isCurrentTrack ? "#FFFFFF" : "#B3B3B3" }}>
        {formatDuration(track.duration || 0)}
      </td>
    </tr>
  );
}

export default function PlaylistDetailPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const params = useParams();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<AvailableTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const [isUpdatingPositions, setIsUpdatingPositions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPlaylistAndTracks = useCallback(async () => {
    if (!params?.id) return;

    // Fetch playlist
    const { data: playlistData, error: playlistError } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", params.id)
      .single();

    if (playlistError) {
      console.error("Error loading playlist:", playlistError.message);
    } else {
      setPlaylist(playlistData);
    }

    // Fetch tracks
    const { data: tracksData, error: tracksError } = await supabase
      .from("playlist_tracks")
      .select(`
        id,
        position,
        tracks (
          id,
          title,
          artist,
          duration,
          audio_url,
          cover_url
        )
      `)
      .eq("playlist_id", params.id)
      .order("position");

    if (tracksError) {
      console.error("Error loading tracks:", tracksError.message);
    } else {
      setTracks(tracksData || []);
    }

    setLoading(false);
  }, [params, supabase]);

  useEffect(() => {
    fetchPlaylistAndTracks();
  }, [fetchPlaylistAndTracks]);

  const fetchAvailableTracks = async () => {
    setLoadingTracks(true);
    const { data, error } = await supabase
      .from("tracks")
      .select("id, title, artist")
      .order("title");

    if (error) {
      console.error("Error loading available tracks:", error.message);
    } else {
      setAvailableTracks(data || []);
    }
    setLoadingTracks(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchAvailableTracks();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAvailableTracks([]);
  };

  const handleAddTrack = async (trackId: string) => {
    if (!params?.id) return;

    setAddingTrackId(trackId);
    const nextPosition = tracks.length + 1;

    const { error } = await supabase.from("playlist_tracks").insert([
      {
        playlist_id: params.id,
        track_id: trackId,
        position: nextPosition,
      },
    ]);

    if (error) {
      console.error("Error adding track to playlist:", error.message);
      alert("Fehler beim Hinzufügen des Tracks: " + error.message);
    } else {
      // Refresh track list
      await fetchPlaylistAndTracks();
      handleCloseModal();
    }

    setAddingTrackId(null);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDeletePlaylist = async () => {
    if (!params?.id) return;

    const confirmed = window.confirm("Are you sure you want to delete this playlist?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", params.id);

      if (error) {
        console.error("Error deleting playlist:", error.message);
        alert("Fehler beim Löschen der Playlist: " + error.message);
      } else {
        router.push("/library");
      }
    } catch (error: any) {
      console.error("Error deleting playlist:", error);
      alert("Fehler beim Löschen der Playlist: " + error.message);
    }
  };

  const handleEditPlaylist = () => {
    // Placeholder action
    console.log("Edit playlist clicked");
    setIsMenuOpen(false);
  };

  const handleTogglePrivacy = () => {
    // Placeholder action
    console.log("Toggle privacy clicked");
    setIsMenuOpen(false);
  };

  // Check if current track is from this playlist
  const isCurrentTrackFromPlaylist = useMemo(() => {
    if (!currentTrack || tracks.length === 0) return false;
    return tracks.some(
      (playlistTrack) =>
        playlistTrack.tracks.title === currentTrack.title &&
        playlistTrack.tracks.artist === currentTrack.artist
    );
  }, [currentTrack, tracks]);

  const handlePlayButtonClick = () => {
    if (tracks.length === 0) return;

    if (isCurrentTrackFromPlaylist && isPlaying) {
      // Current track from playlist is playing → pause
      togglePlay();
    } else if (isCurrentTrackFromPlaylist && !isPlaying) {
      // Current track from playlist but paused → resume
      togglePlay();
    } else {
      // No track playing or different track → start from first track in playlist
      const firstTrack = tracks[0].tracks;
      const coverUrl = firstTrack.cover_url
        ? supabase.storage.from("covers").getPublicUrl(firstTrack.cover_url).data?.publicUrl
        : null;
      const audioUrl = firstTrack.audio_url
        ? supabase.storage.from("tracks").getPublicUrl(firstTrack.audio_url).data?.publicUrl
        : null;

      if (audioUrl) {
        playTrack({
          title: firstTrack.title,
          artist: firstTrack.artist,
          coverUrl: coverUrl || null,
          audioUrl: audioUrl || null,
        });
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tracks.findIndex((item) => item.id === active.id);
    const newIndex = tracks.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately with new positions
    const newOrder = arrayMove(tracks, oldIndex, newIndex).map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    setTracks(newOrder);

    // Update positions in Supabase
    setIsUpdatingPositions(true);
    try {
      for (let i = 0; i < newOrder.length; i++) {
        const { error } = await supabase
          .from("playlist_tracks")
          .update({ position: i + 1 })
          .eq("id", newOrder[i].id);
        
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating track positions:", error);
      // Revert to original order on error
      await fetchPlaylistAndTracks();
    } finally {
      setIsUpdatingPositions(false);
    }
  };

  if (loading)
    return (
      <div style={{ color: "#B3B3B3", textAlign: "center", marginTop: "100px" }}>
        Loading playlist...
      </div>
    );

  if (!playlist)
    return (
      <div style={{ color: "#B3B3B3", textAlign: "center", marginTop: "100px" }}>
        Playlist not found.
      </div>
    );

  return (
    <div
      style={{
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
          padding: "40px 0",
          background:
            "linear-gradient(180deg, rgba(0,255,198,0.1) 0%, rgba(14,14,16,1) 100%)",
          borderRadius: "16px",
          paddingLeft: "40px",
        }}
      >
        {/* Cover */}
        <div
          style={{
            width: "200px",
            height: "200px",
            backgroundColor: "#18181A",
            borderRadius: "8px",
            backgroundImage: playlist.cover_url
              ? `url(${playlist.cover_url})`
              : "linear-gradient(135deg, #00FFC6 0%, #00E0B0 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        />

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ fontSize: "14px", color: "#B3B3B3" }}>Playlist</h4>
          <h1 style={{ fontSize: "48px", fontWeight: "700", margin: "0" }}>
            {playlist.name}
          </h1>
          {playlist.description && (
            <p
              style={{
                color: "#B3B3B3",
                fontSize: "16px",
                width: "400px",
              }}
            >
              {playlist.description}
            </p>
          )}
          <p style={{ color: "#B3B3B3", fontSize: "14px" }}>
            Created at {new Date(playlist.created_at).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
          paddingLeft: "20px",
        }}
      >
        <button
          onClick={handlePlayButtonClick}
          disabled={tracks.length === 0}
          style={{
            background: "linear-gradient(135deg, #00FFC6, #00E0B0)",
            border: "none",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: tracks.length > 0 ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: "0 0 20px rgba(0,255,198,0.6)",
            opacity: tracks.length > 0 ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (tracks.length > 0) {
              e.currentTarget.style.background = "linear-gradient(135deg, #00FFD9, #00FFC6)";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(0,255,198,0.8)";
            }
          }}
          onMouseLeave={(e) => {
            if (tracks.length > 0) {
              e.currentTarget.style.background = "linear-gradient(135deg, #00FFC6, #00E0B0)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,198,0.6)";
            }
          }}
        >
          {isCurrentTrackFromPlaylist && isPlaying ? (
            <Pause size={28} fill="#000" color="#000" />
          ) : (
            <Play size={28} fill="#000" color="#000" />
          )}
        </button>
        <Plus
          size={28}
          color="#B3B3B3"
          style={{ cursor: "pointer" }}
          onClick={handleOpenModal}
        />
        <div
          ref={menuButtonRef}
          style={{ position: "relative" }}
        >
          <MoreHorizontal
            size={28}
            color="#B3B3B3"
            style={{ cursor: "pointer" }}
            onClick={handleMenuToggle}
          />
          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                backgroundColor: "#18181A",
                borderRadius: "8px",
                padding: "8px 0",
                minWidth: "180px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                zIndex: 1000,
              }}
            >
              <div
                onClick={handleEditPlaylist}
                style={{
                  padding: "10px 16px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,255,198,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Edit Playlist
              </div>
              <div
                onClick={handleTogglePrivacy}
                style={{
                  padding: "10px 16px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,255,198,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Set to {playlist?.is_public ? "Private" : "Public"}
              </div>
              <div
                onClick={handleDeletePlaylist}
                style={{
                  padding: "10px 16px",
                  color: "#FF5555",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,85,85,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Delete Playlist
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TRACKLIST (später dynamisch) */}
      <div style={{ padding: "0 20px", marginTop: "10px" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#FFFFFF",
              fontSize: "15px",
            }}
          >
            <thead style={{ textAlign: "left", color: "#B3B3B3" }}>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th style={{ paddingBottom: "10px", width: "60px" }}></th>
                <th style={{ paddingBottom: "10px" }}>Title</th>
                <th style={{ paddingBottom: "10px" }}>Artist</th>
                <th style={{ paddingBottom: "10px" }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {tracks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "40px 0",
                      textAlign: "center",
                      color: "#B3B3B3",
                    }}
                  >
                    No tracks in this playlist yet.
                  </td>
                </tr>
              ) : (
                <SortableContext
                  items={tracks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tracks.map((playlistTrack) => (
                    <SortableRow
                      key={playlistTrack.id}
                      playlistTrack={playlistTrack}
                      supabase={supabase}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </DndContext>
        {isUpdatingPositions && (
          <div
            style={{
              position: "fixed",
              bottom: "80px",
              right: "20px",
              backgroundColor: "#121214",
              color: "#00FFC6",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              zIndex: 100,
            }}
          >
            Speichere Reihenfolge...
          </div>
        )}
      </div>

      {/* ADD TRACK MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "#121214",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
                Track zur Playlist hinzufügen
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#B3B3B3",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#B3B3B3")}
              >
                ×
              </button>
            </div>

            {loadingTracks ? (
              <div style={{ color: "#B3B3B3", textAlign: "center", padding: "40px 0" }}>
                Lade Tracks...
              </div>
            ) : availableTracks.length === 0 ? (
              <div style={{ color: "#B3B3B3", textAlign: "center", padding: "40px 0" }}>
                Keine Tracks verfügbar.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {availableTracks.map((track) => (
                  <div
                    key={track.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      backgroundColor: "#1A1A1D",
                      borderRadius: "8px",
                      border: "1px solid #222",
                      transition: "background 0.2s ease, border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#18181A";
                      e.currentTarget.style.borderColor = "#00FFC6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1A1A1D";
                      e.currentTarget.style.borderColor = "#222";
                    }}
                  >
                    <div>
                      <div style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: "500" }}>
                        {track.title}
                      </div>
                      <div style={{ color: "#B3B3B3", fontSize: "14px", marginTop: "4px" }}>
                        {track.artist}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddTrack(track.id)}
                      disabled={addingTrackId === track.id}
                      style={{
                        backgroundColor:
                          addingTrackId === track.id ? "#00E0B0" : "#00FFC6",
                        color: "#000000",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: addingTrackId === track.id ? "wait" : "pointer",
                        transition: "background 0.2s ease",
                        opacity: addingTrackId === track.id ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (addingTrackId !== track.id) {
                          e.currentTarget.style.backgroundColor = "#00E0B0";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (addingTrackId !== track.id) {
                          e.currentTarget.style.backgroundColor = "#00FFC6";
                        }
                      }}
                    >
                      {addingTrackId === track.id ? "Hinzufügen..." : "Hinzufügen"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
