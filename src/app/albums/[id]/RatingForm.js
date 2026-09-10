"use client";

import { useState } from "react";
import RatingModal from "./RatingModal";

export default function RatingForm({ albumId, tracks, currentRating, currentFavouriteTrack, currentReviewText }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mt-6">
      {currentRating ? (
        <div className="text-sm space-y-1">
          <p>Your rating: <span className="font-medium">{currentRating}/10</span></p>
          {currentFavouriteTrack && <p className="text-gray-500">Favourite: {currentFavouriteTrack}</p>}
          {currentReviewText && <p className="text-gray-400 italic mt-1">"{currentReviewText}"</p>}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">You haven't rated this album yet.</p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="mt-3 border rounded-lg px-4 py-2 text-sm bg-white text-black font-medium"
      >
        {currentRating ? "Edit Rating" : "Create Rating"}
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