import { createClient } from "@/lib/supabase-server";
import { getAlbum, isValidSpotifyId } from "@/lib/spotify";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  // only trust the Spotify ID from the client; album details come from Spotify itself
  const { spotifyId } = await request.json();

  if (!isValidSpotifyId(spotifyId)) {
    return Response.json({ error: "Invalid album" }, { status: 400 });
  }

  const findAlbum = () =>
    supabase.from("albums").select("id").eq("spotify_id", spotifyId).maybeSingle();

  let { data: album } = await findAlbum();

  if (!album) {
    const details = await getAlbum(spotifyId);

    if (!details) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }

    const { data: newAlbum, error } = await supabase
      .from("albums")
      .insert([{
        title: details.title,
        artist: details.artist,
        year: details.year,
        spotify_id: details.spotifyId,
        cover_url: details.coverUrl,
      }])
      .select("id")
      .single();

    if (error) {
      // another request created it first
      if (error.code === "23505") {
        ({ data: album } = await findAlbum());
      } else {
        console.error("Failed to create album", error);
        return Response.json({ error: "Could not save album" }, { status: 500 });
      }
    } else {
      album = newAlbum;
    }
  }

  return Response.json({ id: album.id });
}
