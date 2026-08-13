"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RatingForm({ albumId, currentRating }) {
  const [rating, setRating] = useState(currentRating || 0);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const router = useRouter();

  const handleRate = async (value) => {
    setRating(value);
    setSaving(true);

    await fetch("/api/rate-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId, rating: value }),
    });

    setSaving(false);
    router.refresh();
  };

  const handleRemove = async () => {
    const confirmed = confirm("Remove this album from your collection?");
    if (!confirmed) return;

    setRemoving(true);

    await fetch("/api/remove-from-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId }),
    });

    setRemoving(false);
    router.refresh();
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 mb-2">Your rating:</p>
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={saving || removing}
            className="text-2xl"
          >
            {star <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>

      <button
        onClick={handleRemove}
        disabled={removing}
        className="mt-3 text-xs text-gray-500 hover:text-red-400 disabled:opacity-50"
      >
        {removing ? "Removing..." : "Remove from Collection"}
      </button>
    </div>
  );
}
