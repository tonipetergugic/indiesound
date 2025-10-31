"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: "center", padding: "16px" }}>
        <Link href="/artist/login" style={{ color: "#00FFC6" }}>
          Are you an artist? Join IndieSound for Artists
        </Link>
      </div>
    </div>
  );
}
