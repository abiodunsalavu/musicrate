import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import AlbumTile from "@/app/components/AlbumTile";

export default async function CollectionPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold">Your collection</h1>
        <p className="mt-2 text-lg text-muted">Log in to start collecting and rating albums.</p>
        <Link href="/login" className="btn-primary mt-6">Log in</Link>
      </main>
    );
  }

  const { data: entries, error } = await supabase
    .from("collections")
    .select("id, rating, review_text, albums (id, title, artist, year, cover_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-muted">Couldn&apos;t load your collection. Try again.</p>
      </main>
    );
  }

  const rated = entries.filter((entry) => entry.rating).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Your collection</h1>
      <p className="mt-2 text-muted">
        {entries.length} {entries.length === 1 ? "album" : "albums"} · {rated} rated
      </p>

      {entries.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-2xl font-bold">Start your collection</h2>
          <p className="mt-2 text-muted">Search for an album you love and add it here.</p>
          <Link href="/" className="btn-primary mt-5">Search albums</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map((entry) => (
            <AlbumTile key={entry.id} album={entry.albums} rating={entry.rating} />
          ))}
        </div>
      )}
    </main>
  );
}
