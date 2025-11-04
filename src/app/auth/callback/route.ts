// Supabase Magic Link callback: exchanges the code for a session and redirects to /home.

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("🪩 /auth/callback triggered!");

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  console.log("🧠 Code param:", code);

  if (code) {
    const cookieStore = await cookies(); // ✅ new in Next.js 16 — must await
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      await supabase.auth.exchangeCodeForSession(code);
      console.log("✅ Session exchanged successfully!");
    } catch (error) {
      console.error("❌ Exchange failed:", error);
    }
  } else {
    console.warn("⚠️ No code parameter found in URL!");
  }

  return NextResponse.redirect(new URL("/home", request.url));
}
