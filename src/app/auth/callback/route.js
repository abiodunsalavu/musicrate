import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Email confirmation links land here with a one-time code. Swap it for a session,
// then continue to `next` (onboarding for new sign-ups).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // only allow same-site paths so the link can't redirect people elsewhere
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    console.error("Email confirmation failed", error);
  }

  return NextResponse.redirect(`${origin}/login?confirm=failed`);
}
