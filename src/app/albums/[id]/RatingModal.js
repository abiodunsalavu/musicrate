"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import { scoreTone } from "@/app/components/ScoreBadge";

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function RatingModal({
  albumId,
  tracks,
  currentRating,
  currentFavouriteTrack,
  currentReviewText,
  onClose,
}) {
  const [rating, setRating] = useState(currentRating || null);
  const [favouriteTrack, setFavouriteTrack] = useState(currentFavouriteTrack || "");
  const [reviewText, setReviewText] = useState(currentReviewText || "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError("Pick a score from 1 to 10.");
      return;
    }

    setSaving(true);
    setError(null);

    const response = await fetch("/api/rate-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId, rating, favouriteTrack, reviewText }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Couldn't save your rating. Try again.");
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <Modal title="Rate this album" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Your score</legend>
          <div role="radiogroup" aria-label="Score out of 10" className="grid grid-cols-5 gap-2">
            {SCORES.map((score) => (
              <button
                key={score}
                type="button"
                role="radio"
                aria-checked={rating === score}
                onClick={() => {
                  setRating(score);
                  setError(null);
                }}
                className={`h-12 rounded-xl font-display text-lg font-bold transition-all ${
                  rating === score
                    ? `${scoreTone(score)} ring-2 ring-accent ring-offset-2 ring-offset-surface`
                    : "bg-surface-2 text-muted hover:text-fg"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="favourite-track" className="mb-2 block text-sm font-semibold">Favourite track</label>
          <select
            id="favourite-track"
            value={favouriteTrack}
            onChange={(e) => setFavouriteTrack(e.target.value)}
            className="input"
          >
            <option value="">Pick a track</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.name}>
                {track.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor="review" className="text-sm font-semibold">Review</label>
            <span className={`text-xs tabular-nums ${reviewText.length >= 130 ? "text-accent-text" : "text-subtle"}`}>
              {reviewText.length}/140
            </span>
          </div>
          <textarea
            id="review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, 140))}
            maxLength={140}
            rows={3}
            placeholder="What did you think?"
            className="input resize-none py-3"
          />
        </div>

        {error && <p className="text-sm text-score-low-fg">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : "Save rating"}
        </button>
      </form>
    </Modal>
  );
}
