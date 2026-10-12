import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { albumId } = await request.json();

  const { error } = await supabase
    .from("collections")
    .insert([{ user_id: user.id, album_id: albumId }]);

  // already in the collection counts as success
  if (error && error.code !== "23505") {
    console.error("Collection update failed", error);
    return Response.json({ error: "Could not update collection" }, { status: 500 });
  }

  return Response.json({ success: true });
}