import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { title, artist, year, spotifyId, coverUrl } = await request.json();

  let { data: album } = await supabase
    .from("albums")
    .select("id")
    .eq("spotify_id", spotifyId)
    .maybeSingle();

  if (!album) {
    const { data: newAlbum, error } = await supabase
      .from("albums")
      .insert([{ title, artist, year, spotify_id: spotifyId, cover_url: coverUrl }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    album = newAlbum;
  }

  return Response.json({ id: album.id });
}