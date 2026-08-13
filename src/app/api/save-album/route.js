import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { title, artist, year, spotifyId, coverUrl } = await request.json();

  // find or create the shared album row first
  let { data: album } = await supabase
    .from("albums")
    .select("id")
    .eq("spotify_id", spotifyId)
    .maybeSingle();

  if (!album) {
    const { data: newAlbum, error: albumError } = await supabase
      .from("albums")
      .insert([{ title, artist, year, spotify_id: spotifyId, cover_url: coverUrl }])
      .select()
      .single();

    if (albumError) {
      return Response.json({ error: albumError.message }, { status: 500 });
    }
    album = newAlbum;
  }

  // now link it to this user via collections
  const { error: collectionError } = await supabase
    .from("collections")
    .insert([{ user_id: user.id, album_id: album.id }]);

  if (collectionError) {
    return Response.json({ error: collectionError.message }, { status: 500 });
  }

  return Response.json({ albumId: album.id });
}