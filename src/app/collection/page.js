import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function CollectionPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-4 sm:p-8">
        <p className="text-gray-500">Log in to see your collection.</p>
      </main>
    );
  }

  const { data: entries, error } = await supabase
    .from("collections")
    .select("id, rating, albums (id, title, artist, year, cover_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-4 sm:p-8">Error loading collection: {error.message}</main>;
  }

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">My Collection</h1>

      {entries.length === 0 ? (
        <p className="text-gray-500">No albums saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Link href={`/albums/${entry.albums.id}`} key={entry.id}>
              <div className="border rounded-lg p-4 flex gap-3 items-center hover:bg-gray-900 cursor-pointer">
                {entry.albums.cover_url && (
                  <img src={entry.albums.cover_url} alt={entry.albums.title} className="w-16 h-16 rounded" />
                )}
                <div>
                  <h2 className="font-semibold">{entry.albums.title}</h2>
                  <p className="text-sm text-gray-500">{entry.albums.artist} · {entry.albums.year}</p>
                  <p className="text-sm mt-1">
                    {entry.rating ? "★".repeat(entry.rating) : "Not rated yet"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}