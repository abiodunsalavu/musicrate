import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Onboarding from "./Onboarding";

export const metadata = { title: "Welcome · Musicrate" };

// turn "Jane.Doe+music@example.com" into a valid username suggestion like "jane_doe_music"
function suggestUsername(email) {
  const base = (email?.split("@")[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
  return base.length >= 3 ? base : "";
}

export default async function WelcomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // with email confirmation on, people land here before they have a session
  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="card p-8 text-center">
          <h1 className="text-3xl font-extrabold">Check your email</h1>
          <p className="mt-3 text-muted">
            Confirm your email address, then log in to set up your profile.
          </p>
          <Link href="/login" className="btn-primary mt-6 w-full">Log in</Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, profile_picture_url, banner_url, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarded_at) {
    redirect(`/users/${profile.username}`);
  }

  const hasDefaultUsername = /^user_[0-9a-f]{8}$/.test(profile?.username ?? "");

  return (
    <Onboarding
      userId={user.id}
      initialUsername={hasDefaultUsername ? suggestUsername(user.email) || profile.username : profile?.username ?? ""}
      initialDisplayName={profile?.display_name ?? ""}
      initialAvatarUrl={profile?.profile_picture_url ?? ""}
      initialBannerUrl={profile?.banner_url ?? ""}
    />
  );
}
