import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { username, displayName } = await request.json();

  // basic validation
  const trimmedUsername = username.trim().toLowerCase();

  if (trimmedUsername.length < 3) {
    return Response.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }

  if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
    return Response.json(
      { error: "Username can only contain lowercase letters, numbers, and underscores" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: trimmedUsername, display_name: displayName.trim() })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "That username is already taken" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}