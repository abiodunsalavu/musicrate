import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { albumId, rating, favouriteTrack, reviewText } = await request.json();

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return Response.json({ error: "Rating must be a whole number from 1 to 10" }, { status: 400 });
  }

  if (favouriteTrack != null && (typeof favouriteTrack !== "string" || favouriteTrack.length > 200)) {
    return Response.json({ error: "Invalid favourite track" }, { status: 400 });
  }

  if (reviewText != null && (typeof reviewText !== "string" || reviewText.length > 140)) {
    return Response.json({ error: "Review must be 140 characters or fewer" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("collections")
    .update({
      rating,
      favourite_track: favouriteTrack || null,
      review_text: reviewText || null,
    })
    .eq("user_id", user.id)
    .eq("album_id", albumId)
    .select("id");

  if (error) {
    console.error("Failed to save rating", error);
    return Response.json({ error: "Could not save rating" }, { status: 500 });
  }

  if (updated.length === 0) {
    return Response.json({ error: "Add this album to your collection before rating it" }, { status: 404 });
  }

  return Response.json({ success: true });
}
