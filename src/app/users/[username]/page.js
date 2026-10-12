import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

async function getProfile(supabase, username) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, profile_picture_url, created_at")
    .eq("username", decodeURIComponent(username).toLowerCase())
    .maybeSingle();

  return profile;
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await getProfile(supabase, username);

  if (!profile) return { title: "User not found · Musicrate" };

  return { title: `${profile.display_name || profile.username} (@${profile.username}) · Musicrate` };
}

export default async function UserProfilePage({ params }) {
  const { username } = await params;
  const supabase = await createClient();

  const profile = await getProfile(supabase, username);

  if (!profile) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  const { data: entries } = await supabase
    .from("collections")
    .select("id, rating, favourite_track, review_text, created_at, albums (id, title, artist, year, cover_url)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const collection = entries ?? [];
  const rated = collection.filter((entry) => entry.rating);
  const averageRating = rated.length
    ? (rated.reduce((sum, entry) => sum + entry.rating, 0) / rated.length).toFixed(1)
    : null;

  return (
    <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
          {profile.profile_picture_url ? (
            <img src={profile.profile_picture_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">?</div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          <p className="text-gray-500 text-sm">@{profile.username}</p>
          <p className="text-gray-600 text-xs mt-1">
            Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
        </div>

        {isOwnProfile && (
          <Link href="/profile" className="border rounded-lg px-4 py-2 text-sm bg-white text-black font-medium">
            Edit Profile
          </Link>
        )}
      </header>

      <div className="flex justify-center sm:justify-start gap-8 mt-6 py-4 border-y border-gray-800 text-center sm:text-left">
        <Stat label="Albums" value={collection.length} />
        <Stat label="Rated" value={rated.length} />
        <Stat label="Avg rating" value={averageRating ? `${averageRating}/10` : "–"} />
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Collection</h2>

      {collection.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {isOwnProfile ? "You haven't added any albums yet." : "No albums in this collection yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collection.map((entry) => (
            <Link href={`/albums/${entry.albums.id}`} key={entry.id}>
              <div className="border border-gray-800 rounded-lg p-4 flex gap-4 hover:bg-gray-900 h-full">
                {entry.albums.cover_url && (
                  <img src={entry.albums.cover_url} alt={entry.albums.title} className="w-20 h-20 rounded flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{entry.albums.title}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {entry.albums.artist} · {entry.albums.year}
                  </p>
                  <p className="text-sm mt-1">
                    {entry.rating ? <span className="font-medium">{entry.rating}/10</span> : <span className="text-gray-500">Not rated yet</span>}
                  </p>
                  {entry.favourite_track && (
                    <p className="text-xs text-gray-500 mt-1 truncate">Favourite: {entry.favourite_track}</p>
                  )}
                  {entry.review_text && (
                    <p className="text-sm text-gray-400 italic mt-1">&ldquo;{entry.review_text}&rdquo;</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
    </div>
  );
}
