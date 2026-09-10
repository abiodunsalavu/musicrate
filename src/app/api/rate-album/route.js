import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { albumId, rating, favouriteTrack, reviewText } = await request.json();

  const { error } = await supabase
    .from("collections")
    .update({
      rating,
      favourite_track: favouriteTrack,
      review_text: reviewText,
    })
    .eq("user_id", user.id)
    .eq("album_id", albumId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
