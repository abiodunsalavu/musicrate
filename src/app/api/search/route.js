import { getSpotifyToken } from "@/lib/spotify";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return Response.json({ error: "Missing search query" }, { status: 400 });
  }

  if (query.length > 100) {
    return Response.json({ error: "Search query is too long" }, { status: 400 });
  }

  const accessToken = await getSpotifyToken();

  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
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
