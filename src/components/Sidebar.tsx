"use client";

import { Home, Library, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Home", icon: Home, href: "/home" },
  { name: "Library", icon: Library, href: "/library" },
  { name: "Create", icon: PlusCircle, href: "/create" },
  { name: "Search", icon: Search, href: "/search" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

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
            const active = pathname === item.href;
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
                onMouseLeave={() => setHovered((h) => (h === item.name ? null : h))}
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
    </aside>
  );
}
