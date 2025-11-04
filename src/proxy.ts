import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ✅ must export a default function named `proxy`
export default function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // If a magic-link code (?code=...) is in the URL but the path isn’t /auth/callback,
  // redirect it so Supabase can finish login.
  if (url.searchParams.has("code") && url.pathname !== "/auth/callback") {
    const redirectUrl = new URL("/auth/callback", req.url);
    redirectUrl.search = url.search; // keep ?code=...
    console.log("🧭 Redirecting magic link to:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Run on all routes
export const config = {
  matcher: ["/:path*"],
};
