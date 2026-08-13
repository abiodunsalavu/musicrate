import { createClient } from "@supabase/supabase-js";
import { getAlbumTracks } from "@/lib/spotify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default async function AlbumPage({ params }) {
  const { id } = await params;

  const { data: album, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !album) {
    return <main className="p-8">Album not found.</main>;
  }

  const tracks = album.spotify_id ? await getAlbumTracks(album.spotify_id) : [];

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex gap-8">
        <aside className="w-56 flex-shrink-0">
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
              value={album.rating ? "★".repeat(album.rating) : "Not rated"}
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

          <div className="border-b border-gray-800 mt-6 mb-4">
            <span className="border-b-2 border-white pb-2 font-medium text-sm">
              Tracklist
            </span>
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
