import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import Avatar from "@/app/components/Avatar";
import AlbumTile from "@/app/components/AlbumTile";
import ScoreBadge from "@/app/components/ScoreBadge";
import { bannerStillUrl } from "@/lib/images";

async function getProfile(supabase, username) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, profile_picture_url, banner_url, created_at")
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
    ? rated.reduce((sum, entry) => sum + entry.rating, 0) / rated.length
    : null;
  const distribution = Array.from({ length: 10 }, (_, i) => rated.filter((entry) => entry.rating === i + 1).length);
  const maxCount = Math.max(1, ...distribution);
  const topCovers = [...rated]
    .sort((a, b) => b.rating - a.rating)
    .map((entry) => entry.albums.cover_url)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <main className="w-full pb-16">
      <ProfileBanner bannerUrl={profile.banner_url} topCovers={topCovers} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="relative -mt-14 flex flex-col items-center gap-4 text-center sm:-mt-16 sm:flex-row sm:items-end sm:gap-6 sm:text-left">
          <Avatar
            url={profile.profile_picture_url}
            name={profile.display_name || profile.username}
            size="lg"
            className="border-4 border-bg shadow-lg"
          />

          <div className="min-w-0 flex-1 sm:pb-1">
            <h1 className="text-4xl font-extrabold sm:text-5xl">{profile.display_name || profile.username}</h1>
            <p className="mt-1 text-muted">
              @{profile.username} · Joined{" "}
              {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
          </div>

          {isOwnProfile && (
            <Link href="/profile" className="btn-secondary sm:mb-1">
              Edit profile
            </Link>
          )}
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div className="card flex gap-8 p-5">
            <Stat label="Albums" value={collection.length} />
            <Stat label="Rated" value={rated.length} />
            <div>
              {averageRating != null ? <ScoreBadge score={averageRating} size="md" /> : <p className="font-display text-3xl font-bold">–</p>}
              <p className="eyebrow mt-1 text-subtle">Avg score</p>
            </div>
          </div>

          <div className="card p-5">
            <p className="eyebrow text-subtle">How they rate</p>
            <div className="mt-3 flex h-16 items-end gap-1.5" aria-label="Rating distribution">
              {distribution.map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md ${count ? "bg-accent" : "bg-surface-2"}`}
                    style={{ height: `${Math.max(6, (count / maxCount) * 48)}px` }}
                    title={`${count} rated ${i + 1}`}
                  />
                  <span className="text-[11px] tabular-nums text-subtle">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <h2 className="mt-12 text-2xl font-bold">Collection</h2>

        {collection.length === 0 ? (
          <p className="mt-3 text-muted">
            {isOwnProfile ? "You haven't added any albums yet." : "No albums in this collection yet."}
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
            {collection.map((entry) => (
              <AlbumTile key={entry.id} album={entry.albums} rating={entry.rating} review={entry.review_text} />
            ))}
          </div>
        )}
        </div>
      </main>
    );
  }

  function ProfileBanner({ bannerUrl, topCovers }) {
    if (bannerUrl) {
      return (
        <div className="h-40 w-full overflow-hidden bg-surface-2 sm:h-60">
          <picture>
            {/* a still frame for people who turn off animations */}
            <source srcSet={bannerStillUrl(bannerUrl)} media="(prefers-reduced-motion: reduce)" />
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
          </picture>
      </div>
    );
  }

  // default: a blurred collage of their highest-rated album covers
  return (
    <div className="relative h-40 w-full overflow-hidden bg-surface-2 sm:h-60" aria-hidden="true">
      {topCovers.length > 0 ? (
        <div className="absolute -inset-10 flex scale-110 blur-2xl saturate-150">
          {topCovers.map((cover) => (
            <div key={cover} className="h-full flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-surface-2 to-score-low-bg" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/20 to-bg" />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold leading-10 tabular-nums">{value}</p>
      <p className="eyebrow mt-1 text-subtle">{label}</p>
    </div>
  );
}
