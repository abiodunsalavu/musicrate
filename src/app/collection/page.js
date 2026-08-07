import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function CollectionPage() {
  const { data: albums, error } = await supabase
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-8">Error loading collection: {error.message}</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Collection</h1>

      {albums.length === 0 ? (
        <p className="text-gray-500">No albums saved yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {albums.map((album) => (
            <Link href={`/albums/${album.id}`} key={album.id}>
              <div className="border rounded-lg p-4 flex gap-3 items-center hover:bg-gray-900 cursor-pointer">
                {album.cover_url && (
                  <img src={album.cover_url} alt={album.title} className="w-16 h-16 rounded" />
                )}
                <div>
                  <h2 className="font-semibold">{album.title}</h2>
                  <p className="text-sm text-gray-500">{album.artist} · {album.year}</p>
                  <p className="text-sm mt-1">
                    {album.rating ? "★".repeat(album.rating) : "Not rated yet"}
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