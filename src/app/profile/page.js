import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import EditProfileButton from "./EditProfileButton";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-4 sm:p-8">
        <p className="text-gray-500">Log in to see your profile.</p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, profile_picture_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="p-4 sm:p-8 max-w-sm mx-auto flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border border-gray-700 mb-4">
        {profile?.profile_picture_url ? (
          <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
            ?
          </div>
        )}
      </div>

      <h1 className="text-xl font-bold">{profile?.display_name || "No display name set"}</h1>
      <p className="text-gray-500 text-sm">@{profile?.username}</p>
      <p className="text-gray-600 text-xs mt-1">{user.email}</p>

      <div className="mt-6 flex items-center gap-3">
        {profile?.username && (
          <Link href={`/users/${profile.username}`} className="border border-gray-700 rounded-lg px-4 py-2 text-sm">
            View Public Profile
          </Link>
        )}
        <EditProfileButton
          currentUsername={profile?.username || ""}
          currentDisplayName={profile?.display_name || ""}
          currentAvatarUrl={profile?.profile_picture_url || ""}
        />
      </div>
    </main>
  );
}