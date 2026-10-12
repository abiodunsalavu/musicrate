import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { username, displayName, avatarUrl, bannerUrl, completeOnboarding } = await request.json();

  const updates = {};

  if (username !== undefined) {
    if (typeof username !== "string") {
      return Response.json({ error: "Invalid username" }, { status: 400 });
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return Response.json({ error: "Username must be 3 to 30 characters" }, { status: 400 });
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return Response.json(
        { error: "Username can only contain lowercase letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    updates.username = trimmedUsername;
  }

  if (displayName !== undefined) {
    if (typeof displayName !== "string" || displayName.trim().length > 50) {
      return Response.json({ error: "Display name must be 50 characters or fewer" }, { status: 400 });
    }

    updates.display_name = displayName.trim();
  }

  if (avatarUrl !== undefined && avatarUrl !== "") {
    if (!isOwnStorageUrl(avatarUrl, "avatars", user.id)) {
      return Response.json({ error: "Invalid profile picture" }, { status: 400 });
    }

    updates.profile_picture_url = avatarUrl;
  }

  if (bannerUrl !== undefined) {
    if (bannerUrl === "") {
      updates.banner_url = null;
    } else if (!isOwnStorageUrl(bannerUrl, "banners", user.id)) {
      return Response.json({ error: "Invalid banner" }, { status: 400 });
    } else {
      updates.banner_url = bannerUrl;
    }
  }

  if (completeOnboarding === true) {
    updates.onboarded_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ success: true });
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "That username is already taken" }, { status: 409 });
    }
    console.error("Failed to update profile", error);
    return Response.json({ error: "Could not update profile" }, { status: 500 });
  }

  if (updated.length === 0) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}

// only accept files from this user's own folder in one of our public storage buckets
function isOwnStorageUrl(value, bucket, userId) {
  if (typeof value !== "string") return false;

  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  const expected = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const folder = `/storage/v1/object/public/${bucket}/${userId}/`;

  return (
    url.origin === expected.origin &&
    url.pathname.startsWith(folder) &&
    !decodeURIComponent(url.pathname).includes("..")
  );
}
