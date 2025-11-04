"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ArtistProfileForm from "@/components/ArtistProfileForm";
import ListenerProfileForm from "@/components/ListenerProfileForm";

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [role, setRole] = useState<"artist" | "listener" | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role || "listener"); // default fallback
    };
    fetchRole();
  }, [supabase]);

  if (!role)
    return <p style={{ color: "#B3B3B3" }}>Loading profile...</p>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        paddingTop: "40px",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "30px" }}>
        Profile Settings
      </h1>

      <div
        style={{
          backgroundColor: "#141416",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
        }}
      >
        {role === "artist" ? <ArtistProfileForm /> : <ListenerProfileForm />}
      </div>
    </div>
  );
}
