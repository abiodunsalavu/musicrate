"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Modal from "@/app/components/Modal";
import Avatar from "@/app/components/Avatar";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_AVATAR_INPUT_BYTES,
  MAX_BANNER_BYTES,
  validateImage,
  uploadAvatar,
  uploadBanner,
} from "@/lib/profile-images";

export default function EditProfileModal({
  currentUsername,
  currentDisplayName,
  currentAvatarUrl,
  currentBannerUrl,
  onClose,
}) {
  const [username, setUsername] = useState(currentUsername);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(currentBannerUrl);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const pickImage = (e, maxBytes) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return null;

    const problem = validateImage(file, maxBytes);
    setError(problem);
    return problem ? null : file;
  };

  const handleAvatarChange = (e) => {
    const file = pickImage(e, MAX_AVATAR_INPUT_BYTES);
    if (!file) return;
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = pickImage(e, MAX_BANNER_BYTES);
    if (!file) return;
    setBannerFile(file);
    setRemoveBanner(false);
    setBannerPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setRemoveBanner(true);
    setBannerPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const updates = { username, displayName };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (avatarFile) {
        updates.avatarUrl = await uploadAvatar(supabase, user.id, avatarFile);
      }

      if (bannerFile) {
        updates.bannerUrl = await uploadBanner(supabase, user.id, bannerFile);
      } else if (removeBanner) {
        updates.bannerUrl = "";
      }
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed. Try again.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-semibold">Banner</p>
          <div className="relative aspect-[3/1] overflow-hidden rounded-2xl border border-border bg-surface-2">
            {bannerPreviewUrl ? (
              <img src={bannerPreviewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <p className="grid h-full place-items-center px-4 text-center text-sm text-subtle">
                No banner. Your top-rated albums are shown instead.
              </p>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <label className="btn-secondary flex-1 cursor-pointer">
              {bannerPreviewUrl ? "Change banner" : "Upload banner"}
              <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} onChange={handleBannerChange} className="sr-only" />
            </label>
            {bannerPreviewUrl && (
              <button type="button" onClick={handleRemoveBanner} className="btn-ghost">
                Remove
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-subtle">Wide images work best. GIFs allowed, up to 4MB.</p>
        </div>

        <div className="flex items-center gap-4">
          <Avatar url={previewUrl} name={displayName || username} size="lg" />
          <div>
            <label className="btn-secondary cursor-pointer">
              Change photo
              <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} onChange={handleAvatarChange} className="sr-only" />
            </label>
            <p className="mt-1.5 text-xs text-subtle">Cropped to a square. GIFs use their first frame.</p>
          </div>
        </div>

        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
          />
          <p className="mt-1.5 text-xs text-subtle">Lowercase letters, numbers and underscores.</p>
        </div>

        <div>
          <label htmlFor="display-name" className="mb-2 block text-sm font-semibold">Display name</label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="input"
          />
        </div>

        {error && <p className="text-sm text-score-low-fg">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}
