"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const menuItems = [
    {
      label: "Tracks",
      emoji: "🎶",
      action: () => router.push("/library"),
    },
    {
      label: "Playlists",
      emoji: "📀",
      action: () => router.push("/library/playlists"),
    },
  ];

  // Klick außerhalb => Menü schließen
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="absolute left-[150px] top-[140px] z-50">
      <div
        ref={menuRef}
        className="bg-[#161616] rounded-xl shadow-xl w-[200px] py-2 animate-fadeIn"
      >
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                onClose();
              }}
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium text-left transition-all ${
                hovered === item.label
                  ? "bg-[#00FFC6] text-black"
                  : "text-white hover:bg-[#00E0B0] hover:text-black"
              }`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

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
        .animate-fadeIn {
          animation: fadeIn 0.12s ease-out;
        }
      `}</style>
    </div>
  );
}
