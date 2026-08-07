import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const body = await request.json();
  const { title, artist, year, spotifyId, coverUrl } = body;

  const { data, error } = await supabase
    .from("albums")
    .insert([
      {
        title,
        artist,
        year,
        spotify_id: spotifyId,
        cover_url: coverUrl,
      },
    ])
    .select();

  if (error) {
    console.error("Supabase insert error:", error); // ADD THIS LINE
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ album: data[0] });
}