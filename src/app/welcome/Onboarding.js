"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Avatar from "@/app/components/Avatar";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_AVATAR_INPUT_BYTES,
  MAX_BANNER_BYTES,
  validateImage,
  uploadAvatar,
  uploadBanner,
} from "@/lib/profile-images";

const supabase = createClient();

const STEPS = ["Your name", "Your look", "Your albums"];
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

async function saveProfile(updates) {
  const response = await fetch("/api/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Couldn't save. Try again.");
}

export default function Onboarding({ userId, initialUsername, initialDisplayName, initialAvatarUrl, initialBannerUrl }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl);

  const finish = async (destination) => {
    await saveProfile({ completeOnboarding: true });
    router.push(destination);
    router.refresh();
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-accent-text">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
        <button onClick={() => finish("/")} className="text-sm font-medium text-subtle hover:text-fg">
          Skip setup
        </button>
      </div>

      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {STEPS.map((label, i) => (
          <div key={label} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-surface-2"}`} />
        ))}
      </div>

      {step === 0 && (
        <NameStep
          username={username}
          displayName={displayName}
          onSaved={(savedUsername, savedDisplayName) => {
            setUsername(savedUsername);
            setDisplayName(savedDisplayName);
            setStep(1);
          }}
        />
      )}

      {step === 1 && (
        <LookStep
          userId={userId}
          username={username}
          displayName={displayName}
          avatarUrl={avatarUrl}
          bannerUrl={bannerUrl}
          onSaved={(savedAvatarUrl, savedBannerUrl) => {
            setAvatarUrl(savedAvatarUrl);
            setBannerUrl(savedBannerUrl);
            setStep(2);
          }}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && <AlbumsStep onBack={() => setStep(1)} onFinish={() => finish(`/users/${username}`)} />}
    </main>
  );
}

function NameStep({ username: initialUsername, displayName: initialDisplayName, onSaved }) {
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [availability, setAvailability] = useState("idle"); // idle | checking | available | taken
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const normalised = username.trim().toLowerCase();
  const formatOk = USERNAME_PATTERN.test(normalised);

  // check the username is free a moment after the user stops typing
  useEffect(() => {
    if (!formatOk) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setAvailability("checking");
      const [{ data: { user } }, { data: match }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("id").eq("username", normalised).maybeSingle(),
      ]);
      if (!cancelled) setAvailability(!match || match.id === user?.id ? "available" : "taken");
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalised, formatOk]);

  const status = !username
    ? null
    : !formatOk
      ? { tone: "text-score-low-fg", text: "3–30 characters: lowercase letters, numbers and underscores." }
      : availability === "taken"
        ? { tone: "text-score-low-fg", text: `@${normalised} is taken.` }
        : availability === "available"
          ? { tone: "text-score-high-fg", text: `@${normalised} is available.` }
          : { tone: "text-subtle", text: "Checking…" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formatOk || availability === "taken") return;

    setSaving(true);
    setError(null);
    try {
      await saveProfile({ username: normalised, displayName });
      onSaved(normalised, displayName.trim());
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Welcome to musicrate.</h1>
      <p className="mt-3 text-lg text-muted">First, what should people call you?</p>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="display-name" className="mb-2 block text-sm font-semibold">Display name</label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="Your name"
            autoFocus
            className="input"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold">Username</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-subtle">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setAvailability("idle");
              }}
              maxLength={30}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              aria-describedby="username-status"
              className="input pl-9"
            />
          </div>
          <p id="username-status" aria-live="polite" className={`mt-1.5 min-h-5 text-sm ${status?.tone ?? ""}`}>
            {status?.text}
          </p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-score-low-fg">{error}</p>}

      <button
        type="submit"
        disabled={saving || !formatOk || availability !== "available"}
        className="btn-primary mt-8 w-full sm:w-auto"
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}

function LookStep({ userId, username, displayName, avatarUrl, bannerUrl, onSaved, onBack }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(bannerUrl);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const pick = (e, maxBytes, setFile, setPreview) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImage(file, maxBytes);
    setError(problem);
    if (problem) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleContinue = async () => {
    if (!avatarFile && !bannerFile) {
      onSaved(avatarUrl, bannerUrl);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updates = {};
      if (avatarFile) updates.avatarUrl = await uploadAvatar(supabase, userId, avatarFile);
      if (bannerFile) updates.bannerUrl = await uploadBanner(supabase, userId, bannerFile);
      await saveProfile(updates);
      onSaved(updates.avatarUrl ?? avatarUrl, updates.bannerUrl ?? bannerUrl);
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="mt-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Make it yours.</h1>
      <p className="mt-3 text-lg text-muted">Add a photo and a banner. You can change these any time.</p>

      {/* live preview of their profile header */}
      <div className="card mt-8 overflow-hidden">
        <label className="group relative block aspect-[3/1] cursor-pointer bg-surface-2">
          {bannerPreview ? (
            <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-accent/40 via-surface-2 to-score-low-bg" />
          )}
          <span className="absolute right-3 bottom-3 rounded-full bg-overlay px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-black/80">
            {bannerPreview ? "Change banner" : "Add banner"}
          </span>
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={(e) => pick(e, MAX_BANNER_BYTES, setBannerFile, setBannerPreview)}
            className="sr-only"
          />
        </label>

        <div className="flex items-end gap-4 px-5 pb-5">
          <label className="group relative -mt-12 cursor-pointer rounded-full">
            <Avatar url={avatarPreview} name={displayName || username} size="lg" className="border-4 border-surface" />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-overlay text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
            <input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={(e) => pick(e, MAX_AVATAR_INPUT_BYTES, setAvatarFile, setAvatarPreview)}
              className="sr-only"
            />
            <span className="sr-only">Change profile photo</span>
          </label>
          <div className="min-w-0 pb-1">
            <p className="truncate font-display text-2xl font-bold">{displayName || username}</p>
            <p className="truncate text-muted">@{username}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-subtle">
        Tap the banner or photo to upload. Photos are cropped square and GIFs use their first frame. Banners can be GIFs,
        up to 4MB.
      </p>

      {error && <p className="mt-4 text-sm text-score-low-fg">{error}</p>}

      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row">
        <button onClick={onBack} className="btn-ghost">Back</button>
        <button onClick={handleContinue} disabled={saving} className="btn-primary sm:ml-auto">
          {saving ? "Uploading…" : avatarFile || bannerFile ? "Save and continue" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}

function AlbumsStep({ onBack, onFinish }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState({}); // spotifyId -> "adding" | "added"
  const [finishing, setFinishing] = useState(false);

  const addedCount = Object.values(added).filter((state) => state === "added").length;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const response = await fetch(`/api/search?type=albums&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setResults(data.albums ?? []);
    setSearching(false);
  };

  const addAlbum = async (album) => {
    if (added[album.spotifyId]) return;
    setAdded((current) => ({ ...current, [album.spotifyId]: "adding" }));

    const albumResponse = await fetch("/api/get-or-create-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotifyId: album.spotifyId }),
    });
    const { id } = await albumResponse.json();

    const collectionResponse = albumResponse.ok
      ? await fetch("/api/add-to-collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId: id }),
        })
      : null;

    setAdded((current) => {
      const next = { ...current };
      if (collectionResponse?.ok) next[album.spotifyId] = "added";
      else delete next[album.spotifyId];
      return next;
    });
  };

  return (
    <div className="mt-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Start your collection.</h1>
      <p className="mt-3 text-lg text-muted">Add a few albums you love. You can rate them later.</p>

      <form onSubmit={handleSearch} className="mt-8 flex gap-2">
        <label htmlFor="album-search" className="sr-only">Search albums</label>
        <input
          id="album-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search an album or artist"
          className="input"
        />
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {searching ? (
        <p className="mt-6 text-muted">Searching…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {results.map((album) => {
            const state = added[album.spotifyId];
            return (
              <button
                key={album.spotifyId}
                onClick={() => addAlbum(album)}
                aria-pressed={state === "added"}
                className="group text-left"
              >
                <div
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                    state === "added" ? "border-accent" : "border-transparent"
                  }`}
                >
                  {album.coverUrl && <img src={album.coverUrl} alt="" className="h-full w-full object-cover" />}
                  <span
                    className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-lg font-bold shadow-md transition-colors ${
                      state === "added" ? "bg-accent text-on-accent" : "bg-overlay text-white group-hover:bg-black/80"
                    }`}
                    aria-hidden="true"
                  >
                    {state === "added" ? "✓" : state === "adding" ? "…" : "+"}
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold">{album.title}</p>
                <p className="truncate text-sm text-muted">{album.artist}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 mt-8 flex flex-col-reverse gap-2 border-t border-border bg-bg/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <button onClick={onBack} className="btn-ghost">Back</button>
        <p className="text-sm text-muted sm:ml-auto">
          {addedCount} {addedCount === 1 ? "album" : "albums"} added
        </p>
        <button
          onClick={async () => {
            setFinishing(true);
            await onFinish();
          }}
          disabled={finishing}
          className="btn-primary"
        >
          {finishing ? "Finishing…" : addedCount > 0 ? "Finish" : "Skip and finish"}
        </button>
      </div>
    </div>
  );
}
