import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // send logged-in users who haven't finished setup to onboarding, however they arrive
  if (user && request.method === "GET" && !SKIP_ONBOARDING_CHECK.test(request.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.onboarded_at) {
      const redirect = NextResponse.redirect(new URL("/welcome", request.url));
      // keep any refreshed session cookies
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
  }

  return response;
}

const SKIP_ONBOARDING_CHECK = /^\/(api|auth|welcome|login|signup)(\/|$)/;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};