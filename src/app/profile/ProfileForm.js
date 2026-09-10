"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ currentUsername, currentDisplayName }) {
  const [username, setUsername] = useState(currentUsername);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm text-gray-400 block mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-2">Display name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How your name appears to others"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Profile updated!</p>}

      <button
        type="submit"
        disabled={saving}
        className="border rounded-lg px-4 py-2 bg-white text-black font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}