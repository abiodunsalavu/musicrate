"use client";

import { useState } from "react";
import RatingModal from "./RatingModal";
import ScoreBadge from "@/app/components/ScoreBadge";

export default function RatingForm({ albumId, tracks, currentRating, currentFavouriteTrack, currentReviewText }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-bold">Your rating</h2>

      {currentRating ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <ScoreBadge score={currentRating} size="md" />
            <span className="text-sm text-muted">out of 10</span>
          </div>
          {currentFavouriteTrack && (
            <p className="text-sm text-muted">
              Favourite track: <span className="text-fg">{currentFavouriteTrack}</span>
            </p>
          )}
          {currentReviewText && <p className="text-muted">&ldquo;{currentReviewText}&rdquo;</p>}
        </div>
      ) : (
        <p className="mt-1 text-muted">You haven&apos;t rated this album yet.</p>
      )}

      <button onClick={() => setModalOpen(true)} className="btn-primary mt-4 w-full">
        {currentRating ? "Edit rating" : "Rate this album"}
      </button>

      {modalOpen && (
        <RatingModal
          albumId={albumId}
          tracks={tracks}
          currentRating={currentRating}
          currentFavouriteTrack={currentFavouriteTrack}
          currentReviewText={currentReviewText}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
