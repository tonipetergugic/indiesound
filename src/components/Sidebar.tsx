"use client";

import { Home, Library, PlusCircle, Search, Music, ListMusic } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [showLibraryMenu, setShowLibraryMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt Popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowLibraryMenu(false);
        setShowCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", icon: Home, href: "/home" },
    { name: "Library", icon: Library, href: "/library" },
    { name: "Create", icon: PlusCircle, href: "/create" },
    { name: "Search", icon: Search, href: "/search" },
  ];

  return (
    <aside
      style={{
        width: "220px",
        backgroundColor: "#141416",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #1e1e1e",
        position: "relative",
      }}
    >
      <div>
        <h2
          style={{
            color: "var(--accent)",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "30px",
          }}
        >
          IndieSound
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.name === "Library" &&
                (pathname === "/library" || pathname === "/library/playlists"));

            if (item.name === "Library") {
              return (
                <div key={item.name} style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowLibraryMenu((prev) => !prev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color:
                        active || showLibraryMenu
                          ? "var(--accent)"
                          : hovered === item.name
                          ? "var(--accent-hover)"
                          : "var(--text-secondary)",
                      fontWeight: active || showLibraryMenu ? 600 : 400,
                      transition: "color 0.2s",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      padding: 0,
                      textAlign: "left",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                    onMouseEnter={() => setHovered(item.name)}
                    onMouseLeave={() =>
                      setHovered((h) => (h === item.name ? null : h))
                    }
                  >
                    <Icon size={20} />
                    {item.name}
                  </button>

                  {showLibraryMenu && (
                    <div
                      ref={menuRef}
                      style={{
                        position: "absolute",
                        left: "180px",
                        top: "10px",
                        backgroundColor: "#1A1A1D",
                        border: "1px solid #2a2a2a",
                        borderRadius: "12px",
                        padding: "10px 0",
                        width: "180px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                        zIndex: 100,
                        display: "flex",
                        flexDirection: "column",
                        animation: "fadeIn 0.12s ease-out",
                      }}
                    >
                      <button
                        onClick={() => {
                          router.push("/library");
                          setShowLibraryMenu(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#FFFFFF",
                          padding: "10px 16px",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(0,255,198,0.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <Music size={18} />
                        Tracks
                      </button>

                      <button
                        onClick={() => {
                          router.push("/library/playlists");
                          setShowLibraryMenu(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#FFFFFF",
                          padding: "10px 16px",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(0,255,198,0.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <ListMusic size={18} />
                        Playlists
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.name === "Create") {
              return (
                <div key={item.name} style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowCreateMenu((prev) => !prev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color:
                        active || showCreateMenu
                          ? "var(--accent)"
                          : hovered === item.name
                          ? "var(--accent-hover)"
                          : "var(--text-secondary)",
                      fontWeight: active || showCreateMenu ? 600 : 400,
                      transition: "color 0.2s",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      padding: 0,
                      textAlign: "left",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                    onMouseEnter={() => setHovered(item.name)}
                    onMouseLeave={() =>
                      setHovered((h) => (h === item.name ? null : h))
                    }
                  >
                    <Icon size={20} />
                    {item.name}
                  </button>

                  {showCreateMenu && (
                    <div
                      ref={menuRef}
                      style={{
                        position: "absolute",
                        left: "180px",
                        top: "10px",
                        backgroundColor: "#1A1A1D",
                        border: "1px solid #2a2a2a",
                        borderRadius: "12px",
                        padding: "10px 0",
                        width: "180px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                        zIndex: 100,
                        display: "flex",
                        flexDirection: "column",
                        animation: "fadeIn 0.12s ease-out",
                      }}
                    >
                      <button
                        onClick={() => {
                          router.push("/create/playlist");
                          setShowCreateMenu(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#FFFFFF",
                          padding: "10px 16px",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(0,255,198,0.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <Music size={18} />
                        Create Playlist
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: active
                    ? "var(--accent)"
                    : hovered === item.name
                    ? "var(--accent-hover)"
                    : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  transition: "color 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(item.name)}
                onMouseLeave={() =>
                  setHovered((h) => (h === item.name ? null : h))
                }
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.8rem",
          marginTop: "30px",
        }}
      >
        © {new Date().getFullYear()} IndieSound
      </p>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </aside>
  );
}
