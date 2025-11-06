"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Play, Pause, Globe, Instagram, Facebook, Twitter, Music2 } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { usePlayer } from "@/context/PlayerContext";

type ArtistProfile = {
  id: string;
  bio: string | null;
  user_id: string;
  social_links?: Record<string, string> | null;
  profiles?: {
    avatar_url: string | null;
    display_name: string | null;
  } | null;
};

type Track = {
  id: string;
  title: string;
  cover_url: string | null;
  audio_url: string | null;
  duration?: number;
};

function TrackRow({
  track,
  index,
  artistName,
  supabase,
}: {
  track: Track;
  index: number;
  artistName: string;
  supabase: ReturnType<typeof createClientComponentClient>;
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  const coverUrl = track.cover_url
    ? supabase.storage.from("covers").getPublicUrl(track.cover_url).data?.publicUrl
    : null;
  const audioUrl = track.audio_url
    ? supabase.storage.from("tracks").getPublicUrl(track.audio_url).data?.publicUrl
    : null;
  const isCurrentTrack = currentTrack?.title === track.title && currentTrack?.artist === artistName;
  const showIconOverlay = isHoveringCover || isCurrentTrack;

  const getRowBackground = () => {
    if (isCurrentTrack) return "rgba(0, 255, 198, 0.1)";
    return "transparent";
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioUrl) return;

    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack({
        title: track.title,
        artist: artistName,
        coverUrl: coverUrl || null,
        audioUrl: audioUrl || null,
      });
    }
  };

  return (
    <tr
      style={{
        borderTop: "1px solid #222",
        cursor: "default",
        background: getRowBackground(),
        boxShadow: isCurrentTrack ? "0 0 8px rgba(0,255,198,0.3)" : "none",
        transition: "background 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (isCurrentTrack) {
          e.currentTarget.style.background = "rgba(0,255,198,0.15)";
        } else {
          e.currentTarget.style.background = "rgba(0,255,198,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = getRowBackground();
      }}
    >
      <td style={{ padding: "5px 0", color: isCurrentTrack ? "#FFFFFF" : "#B3B3B3" }}>{index + 1}</td>
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
              backgroundColor: showIconOverlay ? "rgba(0,0,0,0.5)" : "transparent",
              opacity: showIconOverlay ? 1 : 0,
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
      <td style={{ padding: "5px 0", color: isCurrentTrack ? "#FFFFFF" : "#B3B3B3" }}>
        {formatDuration(track.duration || 0)}
      </td>
    </tr>
  );
}

export default function ArtistPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;

      // 🎵 Lade Artist aus "artists" mit Join zu "profiles"
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select(`
          id,
          bio,
          social_links,
          user_id,
          profiles!inner(
            avatar_url,
            display_name
          )
        `)
        .eq("user_id", id)
        .single();

      if (artistError || !artistData) {
        setArtist(null);
        setLoading(false);
        return;
      }

      // Parse social_links if it's a string
      if (artistData.social_links && typeof artistData.social_links === 'string') {
        try {
          artistData.social_links = JSON.parse(artistData.social_links);
        } catch (e) {
          console.error('Error parsing social_links:', e);
          artistData.social_links = null;
        }
      }

      setArtist(artistData);

      // 🎧 Lade Tracks über user_id des Artists
      const { data: trackData, error: trackError } = await supabase
        .from("tracks")
        .select("id, title, cover_url, audio_url, duration")
        .eq("user_id", artistData.user_id);

      if (!trackError) setTracks(trackData || []);
      setLoading(false);
    };

    fetchArtist();
  }, [id, supabase]);

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#B3B3B3" }}>
        Loading artist...
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={{ padding: "40px", color: "#B3B3B3" }}>
        Artist not found.
      </div>
    );
  }

  return (
    <div
      style={{
        color: "#FFFFFF",
        backgroundColor: "#0E0E10",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(to bottom, #121214, #0E0E10)",
          padding: "60px 40px 40px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: "3px solid #00E0B0",
              padding: "4px",
              backgroundColor: "#0E0E10",
            }}
          >
            {(() => {
              const avatarPath = artist?.profiles?.avatar_url;
              const avatarUrl = avatarPath
                ? supabase.storage.from("avatars").getPublicUrl(avatarPath).data.publicUrl
                : null;
              return (
                <img
                  src={avatarUrl || "/default-avatar.png"}
                  alt={artist.profiles?.display_name || "Artist"}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              );
            })()}
          </div>

          {/* Artist Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              textAlign: "center",
              width: "100%",
            }}
          >
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: 900,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {artist.profiles?.display_name || "Artist"}
            </h1>
            <p
              style={{
                color: "#B3B3B3",
                fontSize: "1rem",
                maxWidth: "600px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {artist.bio || "No biography available."}
            </p>
            
            {/* Social Media Icons */}
            {artist.social_links && Object.keys(artist.social_links).length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                {(() => {
                  const links = artist.social_links;
                  
                  // Helper function to find link by multiple possible key names
                  const findLink = (possibleKeys: string[]): string | null => {
                    for (const key of possibleKeys) {
                      if (links[key] && typeof links[key] === 'string' && links[key].trim()) {
                        return links[key].trim();
                      }
                    }
                    return null;
                  };

                  // Define icon configurations with flexible key matching
                  const iconConfigs = [
                    {
                      icon: <Globe size={24} />,
                      url: findLink(['website', 'Website', 'site']),
                      key: 'website',
                    },
                    {
                      icon: <Instagram size={24} />,
                      url: findLink(['instagram']),
                      key: 'instagram',
                    },
                    {
                      icon: <Facebook size={24} />,
                      url: findLink(['facebook']),
                      key: 'facebook',
                    },
                    {
                      icon: <Twitter size={24} />,
                      url: findLink(['x', 'twitter']),
                      key: 'x',
                    },
                    {
                      icon: <Music2 size={24} />,
                      url: findLink(['tiktok']),
                      key: 'tiktok',
                    },
                  ];

                  // Filter and render only icons with valid URLs
                  return iconConfigs
                    .filter(config => config.url)
                    .map((config) => (
                      <a
                        key={config.key}
                        href={config.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#B3B3B3",
                          cursor: "pointer",
                          transition: "color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#00FFC6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#B3B3B3";
                        }}
                      >
                        {config.icon}
                      </a>
                    ));
                })()}
              </div>
            )}
            
            <button
              style={{
                backgroundColor: "#00FFC6",
                color: "#0E0E10",
                border: "none",
                borderRadius: "50px",
                padding: "12px 32px",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                marginTop: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00E0B0";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#00FFC6";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "0 40px 40px" }}>
        {/* Tracks Table */}
        <div style={{ marginTop: "20px" }}>
          {tracks.length === 0 ? (
            <p style={{ color: "#B3B3B3" }}>No tracks yet.</p>
          ) : (
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
                  <th style={{ width: "30px", paddingBottom: "10px" }}>#</th>
                  <th style={{ paddingBottom: "10px", width: "60px" }}></th>
                  <th style={{ paddingBottom: "10px" }}>Title</th>
                  <th style={{ paddingBottom: "10px" }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    artistName={artist.profiles?.display_name || "Artist"}
                    supabase={supabase}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
