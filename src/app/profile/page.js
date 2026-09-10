import { createClient } from "@/lib/supabase-server";
import ProfileForm from "./ProfileForm";

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
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="p-4 sm:p-8 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-500 text-sm mb-6">{user.email}</p>

      <ProfileForm
        currentUsername={profile?.username || ""}
        currentDisplayName={profile?.display_name || ""}
      />
    </main>
  );
}