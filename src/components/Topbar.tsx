"use client";

import { useRouter } from "next/navigation";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, Settings, Shield, LogOut } from "lucide-react";

export default function Topbar() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const user = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#141416",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 20px",
        borderBottom: "1px solid #1e1e1e",
      }}
    >
      <span style={{ color: "#B3B3B3", marginRight: "12px", fontSize: "14px" }}>
        {user?.email ? `Eingeloggt als: ${user.email}` : "Nicht eingeloggt"}
      </span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              border: "none",
              cursor: "pointer",
            }}
          />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={10}
            style={{
              backgroundColor: "#1C1C1E",
              borderRadius: "10px",
              padding: "8px 0",
              minWidth: "180px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              color: "#FFFFFF",
            }}
          >
            <DropdownMenu.Item
              onClick={() => router.push("/profile")}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00FFC610";
                e.currentTarget.style.color = "#00FFC6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              <User size={16} style={{ marginRight: 8 }} /> Profil
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => router.push("/profile/settings")}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00FFC610";
                e.currentTarget.style.color = "#00FFC6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              <Settings size={16} style={{ marginRight: 8 }} /> Einstellungen
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => router.push("/profile/security")}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00FFC610";
                e.currentTarget.style.color = "#00FFC6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              <Shield size={16} style={{ marginRight: 8 }} /> Sicherheit
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              style={{ height: 1, backgroundColor: "#333", margin: "8px 0" }}
            />
            <DropdownMenu.Item 
              onClick={handleLogout} 
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00FFC610";
                e.currentTarget.style.color = "#00FFC6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              <LogOut size={16} style={{ marginRight: 8 }} /> Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  fontSize: "14px",
  cursor: "pointer",
  color: "#FFFFFF",
  borderRadius: "6px",
  transition: "background 0.15s ease-in-out, color 0.15s",
};
