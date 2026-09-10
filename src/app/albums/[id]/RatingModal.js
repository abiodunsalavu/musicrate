"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RatingModal({
  albumId,
  tracks,
  currentRating,
  currentFavouriteTrack,
  currentReviewText,
  onClose,
}) {
  const [rating, setRating] = useState(currentRating || 5);
  const [favouriteTrack, setFavouriteTrack] = useState(currentFavouriteTrack || "");
  const [reviewText, setReviewText] = useState(currentReviewText || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/rate-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId, rating, favouriteTrack, reviewText }),
    });

    setSaving(false);
    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Rate this album</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Rating: <span className="text-white font-medium">{rating}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Favourite song</label>
            <select
              value={favouriteTrack}
              onChange={(e) => setFavouriteTrack(e.target.value)}
              className="w-full border border-gray-700 bg-gray-900 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a track...</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.name}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Review <span className="text-gray-600">({reviewText.length}/140)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, 140))}
              maxLength={140}
              rows={3}
              placeholder="What did you think?"
              className="w-full border border-gray-700 bg-gray-900 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="border rounded-lg px-4 py-2 bg-white text-black font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Rating"}
          </button>
        </form>
      </div>
    </div>
  );
}