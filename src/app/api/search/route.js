import { spotifyFetch } from "@/lib/spotify";
import { createClient } from "@/lib/supabase-server";

const SEARCHERS = {
  albums: searchAlbums,
  users: searchUsers,
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? "albums";

  if (!query) {
    return Response.json({ error: "Missing search query" }, { status: 400 });
  }

  if (query.length > 100) {
    return Response.json({ error: "Search query is too long" }, { status: 400 });
  }

  const search = SEARCHERS[type];

  if (!search) {
    return Response.json({ error: "Unknown search type" }, { status: 400 });
  }

  return search(query);
}

async function searchAlbums(query) {
  const searchResponse = await spotifyFetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`
  );

  if (!searchResponse.ok) {
    console.error("Spotify search failed", searchResponse.status);
    return Response.json({ error: "Search is unavailable right now" }, { status: 502 });
  }

  const searchData = await searchResponse.json();

  const albums = (searchData.albums?.items ?? []).map((album) => ({
    spotifyId: album.id,
    title: album.name,
    artist: album.artists[0]?.name,
    year: album.release_date?.slice(0, 4),
    coverUrl: album.images[0]?.url,
  }));

  return Response.json({ albums });
}

async function searchUsers(query) {
  // keep only letters, numbers, spaces and underscores so the text can't change the
  // filter syntax below or add LIKE wildcards
  const term = query.replace(/[^\p{L}\p{N} _]/gu, "").trim();

  if (!term) {
    return Response.json({ users: [] });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, profile_picture_url")
    .or(`username.ilike.*${term}*,display_name.ilike.*${term}*`)
    .order("username")
    .limit(20);

  if (error) {
    console.error("User search failed", error);
    return Response.json({ error: "Search is unavailable right now" }, { status: 500 });
  }

  const users = data.map((profile) => ({
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.profile_picture_url,
  }));

  return Response.json({ users });
}
