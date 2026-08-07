import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { title, artist, year, spotifyId, coverUrl } = await request.json();

  // check if this album already exists in our database
  const { data: existing } = await supabase
    .from("albums")
    .select("id")
    .eq("spotify_id", spotifyId)
    .maybeSingle();

  if (existing) {
    return Response.json({ id: existing.id });
  }

  // not found — save it for the first time
  const { data: created, error } = await supabase
    .from("albums")
    .insert([{ title, artist, year, spotify_id: spotifyId, cover_url: coverUrl }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ id: created.id });
}