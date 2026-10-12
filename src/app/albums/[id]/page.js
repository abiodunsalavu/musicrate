import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getAlbumTracks } from "@/lib/spotify";
import RatingForm from "./RatingForm";
import AddToCollectionButton from "./AddToCollectionButton";
import RemoveFromCollectionButton from "./RemoveFromCollectionButton";
import ScoreBadge from "@/app/components/ScoreBadge";
import Avatar from "@/app/components/Avatar";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default async function AlbumPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: album, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !album) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold">Album not found</h1>
        <p className="mt-2 text-muted">It may have been removed, or the link is wrong.</p>
        <Link href="/" className="btn-primary mt-6">Search albums</Link>
      </main>
    );
  }

  let currentRating = null;
  let currentFavouriteTrack = null;
  let currentReviewText = null;
  let inCollection = false;

  if (user) {
    const { data: entry } = await supabase
      .from("collections")
      .select("id, rating, favourite_track, review_text")
      .eq("user_id", user.id)
      .eq("album_id", album.id)
      .maybeSingle();

    if (entry) {
      inCollection = true;
      currentRating = entry.rating;
      currentFavouriteTrack = entry.favourite_track;
      currentReviewText = entry.review_text;
    }
  }

  const tracks = album.spotify_id ? await getAlbumTracks(album.spotify_id) : [];

  const { data: ratingEntries } = await supabase
    .from("collections")
    .select("id, user_id, rating, favourite_track, review_text")
    .eq("album_id", album.id)
    .not("rating", "is", null)
    .order("created_at", { ascending: false });

  const ratings = ratingEntries ?? [];
  const { data: raters } = ratings.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, profile_picture_url")
        .in("id", ratings.map((entry) => entry.user_id))
    : { data: [] };
  const ratersById = Object.fromEntries((raters ?? []).map((rater) => [rater.id, rater]));

  const averageRating = ratings.length
    ? ratings.reduce((sum, entry) => sum + entry.rating, 0) / ratings.length
    : null;
  const totalDuration = tracks.reduce((sum, track) => sum + track.durationMs, 0);

  return (
    <main className="w-full pb-16">
      <section className="relative overflow-hidden">
        {album.cover_url && (
          <div
            className="absolute -inset-16 scale-110 bg-cover bg-center opacity-60 blur-3xl saturate-150 dark:opacity-50"
            style={{ backgroundImage: `url(${album.cover_url})` }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/70 to-bg" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-10 pb-8 sm:flex-row sm:items-end sm:gap-8 sm:px-6 sm:pt-16">
          {album.cover_url && (
            <img
              src={album.cover_url}
              alt={`${album.title} cover`}
              className="w-48 rounded-2xl shadow-2xl shadow-black/40 sm:w-60"
            />
          )}
          <div className="min-w-0">
            <p className="eyebrow text-accent-text">Album{album.year ? ` · ${album.year}` : ""}</p>
            <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl">{album.title}</h1>
            <p className="mt-2 text-lg text-muted">
              <span className="font-semibold text-fg">{album.artist}</span>
              {tracks.length > 0 && ` · ${tracks.length} tracks · ${Math.round(totalDuration / 60000)} min`}
            </p>

            <div className="mt-5 flex items-center gap-3">
              {averageRating != null ? (
                <>
                  <ScoreBadge score={averageRating} size="lg" />
                  <p className="text-sm leading-snug text-muted">
                    <span className="font-semibold text-fg">Community rating</span>
                    <br />
                    from {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">No ratings yet. Be the first.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 lg:order-1">
          <h2 className="eyebrow mb-3 font-sans text-subtle">Tracklist</h2>
          {tracks.length === 0 ? (
            <p className="text-muted">No tracklist available.</p>
          ) : (
            <ol>
              {tracks.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center gap-4 border-b border-border py-3"
                >
                  <span className="w-6 text-right text-sm tabular-nums text-subtle">{track.trackNumber}</span>
                  <span className="min-w-0 flex-1 truncate">{track.name}</span>
                  <span className="text-sm tabular-nums text-subtle">{formatDuration(track.durationMs)}</span>
                </li>
              ))}
            </ol>
          )}

          <h2 className="eyebrow mt-12 mb-3 font-sans text-subtle">
            Ratings{ratings.length > 0 && ` · ${ratings.length}`}
          </h2>
          {ratings.length === 0 ? (
            <p className="text-muted">Nobody has rated this album yet.</p>
          ) : (
            <ul>
              {ratings.map((entry) => {
                const rater = ratersById[entry.user_id];
                if (!rater) return null;

                return (
                  <li key={entry.id} className="flex gap-3 border-b border-border py-4">
                    <Link href={`/users/${rater.username}`} className="rounded-full">
                      <Avatar url={rater.profile_picture_url} name={rater.display_name || rater.username} size="sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/users/${rater.username}`} className="truncate font-semibold hover:text-accent-text">
                          {rater.display_name || rater.username}
                        </Link>
                        <ScoreBadge score={entry.rating} size="sm" />
                      </div>
                      {entry.review_text && (
                        <p className="mt-1 text-muted">&ldquo;{entry.review_text}&rdquo;</p>
                      )}
                      {entry.favourite_track && (
                        <p className="mt-1 text-sm text-subtle">Favourite track: {entry.favourite_track}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="order-1 lg:order-2">
          <div className="card p-5 lg:sticky lg:top-24">
            {!user ? (
              <>
                <h2 className="text-xl font-bold">Rate this album</h2>
                <p className="mt-1 text-muted">Log in to add it to your collection and give it a score.</p>
                <Link href="/login" className="btn-primary mt-4 w-full">Log in</Link>
              </>
            ) : !inCollection ? (
              <>
                <h2 className="text-xl font-bold">Rate this album</h2>
                <p className="mt-1 text-muted">Add it to your collection first, then give it a score.</p>
                <AddToCollectionButton albumId={album.id} />
              </>
            ) : (
              <>
                <RatingForm
                  albumId={album.id}
                  tracks={tracks}
                  currentRating={currentRating}
                  currentFavouriteTrack={currentFavouriteTrack}
                  currentReviewText={currentReviewText}
                />
                <RemoveFromCollectionButton albumId={album.id} hasRating={Boolean(currentRating)} />
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
