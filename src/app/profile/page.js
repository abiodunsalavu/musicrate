import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import Avatar from "@/app/components/Avatar";
import EditProfileButton from "./EditProfileButton";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold">Your profile</h1>
        <p className="mt-2 text-lg text-muted">Log in to set up your profile.</p>
        <Link href="/login" className="btn-primary mt-6">Log in</Link>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, profile_picture_url, banner_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-12 pb-16 sm:px-6">
      <div className="card flex flex-col items-center p-8 text-center">
        <Avatar url={profile?.profile_picture_url} name={profile?.display_name || profile?.username} size="lg" />

        <h1 className="mt-5 text-3xl font-extrabold">{profile?.display_name || "No display name yet"}</h1>
        <p className="mt-1 text-muted">@{profile?.username}</p>
        <p className="mt-1 text-sm text-subtle">{user.email}</p>

        <div className="mt-7 flex w-full flex-col gap-2 sm:flex-row">
          <EditProfileButton
            currentUsername={profile?.username || ""}
            currentDisplayName={profile?.display_name || ""}
            currentAvatarUrl={profile?.profile_picture_url || ""}
            currentBannerUrl={profile?.banner_url || ""}
          />
          {profile?.username && (
            <Link href={`/users/${profile.username}`} className="btn-secondary flex-1">
              View public profile
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
