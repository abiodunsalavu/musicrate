import { createClient } from "@/lib/supabase-server";
import { getAlbumTracks } from "@/lib/spotify";
import RatingForm from "./RatingForm";
import AddToCollectionButton from "./AddToCollectionButton";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default async function AlbumPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: album, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !album) {
    return <main className="p-4 sm:p-8">Album not found.</main>;
  }

  let currentRating = null;
  let inCollection = false;

  if (user) {
    const { data: entry } = await supabase
      .from("collections")
      .select("id, rating")
      .eq("user_id", user.id)
      .eq("album_id", album.id)
      .maybeSingle();

    if (entry) {
      inCollection = true;
      currentRating = entry.rating;
    }
  }

  if (user) {
    const { data: entry } = await supabase
      .from("collections")
      .select("rating")
      .eq("user_id", user.id)
      .eq("album_id", album.id)
      .maybeSingle();

    currentRating = entry?.rating ?? null;
  }

  const tracks = album.spotify_id ? await getAlbumTracks(album.spotify_id) : [];

  return (
    <main className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        <aside className="w-full sm:w-56 flex-shrink-0">
          {album.cover_url && (
            <img
              src={album.cover_url}
              alt={album.title}
              className="w-full rounded-lg border border-gray-800"
            />
          )}
          <div className="mt-4 text-sm space-y-2">
            <InfoRow label="Artist" value={album.artist} />
            <InfoRow label="Release Year" value={album.year} />
            <InfoRow
              label="Rating"
              value={currentRating ? "★".repeat(currentRating) : "Not rated"}
            />
            <InfoRow
              label="Added"
              value={new Date(album.created_at).toLocaleDateString()}
            />
          </div>
        </aside>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <p className="text-gray-500 mt-1">{album.artist}</p>

          <div className="mt-6">
            {!user ? (
              <p className="text-gray-500 text-sm">
                Log in to save this album.
              </p>
            ) : !inCollection ? (
              <AddToCollectionButton albumId={album.id} />
            ) : (
              <RatingForm albumId={album.id} currentRating={currentRating} />
            )}
          </div>

          {tracks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tracklist available.</p>
          ) : (
            <ol className="space-y-1">
              {tracks.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center justify-between gap-4 text-sm py-2 border-b border-gray-900"
                >
                  <span className="truncate">
                    <span className="text-gray-500 mr-3">
                      {track.trackNumber}
                    </span>
                    {track.name}
                  </span>
                  <span className="text-gray-500 flex-shrink-0">
                    {formatDuration(track.durationMs)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-gray-800 pb-2">
      <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
