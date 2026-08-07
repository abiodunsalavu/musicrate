import { getSpotifyToken } from "@/lib/spotify";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Missing search query" }, { status: 400 });
  }

  const accessToken = await getSpotifyToken();

  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const searchData = await searchResponse.json();

  const albums = searchData.albums.items.map((album) => ({
    spotifyId: album.id,
    title: album.name,
    artist: album.artists[0]?.name,
    year: album.release_date?.slice(0, 4),
    coverUrl: album.images[0]?.url,
  }));

  return Response.json({ albums });
}