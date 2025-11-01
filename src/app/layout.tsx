// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PlayerBar from "@/components/PlayerBar";
import { PlayerProvider } from "@/context/PlayerContext";
import SupabaseProvider from "./SupabaseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IndieSound",
  description: "A fair platform for independent artists.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateColumns: "220px 1fr", // Sidebar + Main area
          gridTemplateRows: "60px 1fr", // Topbar + Content
          gridTemplateAreas: `
            "sidebar topbar"
            "sidebar main"
          `,
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
        }}
      >
        <SupabaseProvider>
          <PlayerProvider>
            {/* Sidebar (linke Spalte, über volle Höhe) */}
            <div style={{ gridArea: "sidebar" }}>
              <Sidebar />
            </div>

            {/* Topbar (oben, rechte Seite) */}
            <div style={{ gridArea: "topbar" }}>
              <Topbar />
            </div>

            {/* Hauptinhalt (unter der Topbar) */}
            <main
              style={{
                gridArea: "main",
                padding: "20px",
                overflowY: "auto",
              }}
            >
              {children}
            </main>
            <PlayerBar />
          </PlayerProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
