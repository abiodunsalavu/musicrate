// Browser-side upload helpers shared by the edit-profile modal and onboarding.
import { toStaticSquare, toStillFrame, extensionFor } from "@/lib/images";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_AVATAR_INPUT_BYTES = 10 * 1024 * 1024; // shrunk to a small static image before upload
export const MAX_BANNER_BYTES = 4 * 1024 * 1024;

// returns an error message, or null if the file is OK
export function validateImage(file, maxBytes) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Upload a JPG, PNG, WEBP or GIF image.";
  if (file.size > maxBytes) return `Image must be smaller than ${maxBytes / 1024 / 1024}MB.`;
  return null;
}

async function upload(supabase, bucket, path, body, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(path, body, { upsert: true, contentType });
  if (error) throw error;

  // the file name stays the same, so add a version to skip stale caches
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

// avatars are always a static 400x400 image, so GIFs become their first frame
export async function uploadAvatar(supabase, userId, file) {
  const avatar = await toStaticSquare(file);
  return upload(supabase, "avatars", `${userId}/avatar.${extensionFor(avatar)}`, avatar, avatar.type);
}

// banners keep their animation, with a still copy for reduced-motion visitors
export async function uploadBanner(supabase, userId, file) {
  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const still = await toStillFrame(file);
  await upload(supabase, "banners", `${userId}/banner-still.jpg`, still, still.type);
  return upload(supabase, "banners", `${userId}/banner.${extension}`, file, file.type);
}
