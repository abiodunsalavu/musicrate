"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveFromCollectionButton({ albumId, hasRating }) {
  const [status, setStatus] = useState("idle"); // idle | loading
  const router = useRouter();

  const handleRemove = async () => {
    const message = hasRating
      ? "Remove this album from your collection? Your rating and review will be deleted."
      : "Remove this album from your collection?";

    if (!window.confirm(message)) return;

    setStatus("loading");

    const response = await fetch("/api/remove-from-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId }),
    });

    setStatus("idle");

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={status !== "idle"}
      className="mt-3 text-sm text-gray-500 hover:text-red-400 disabled:opacity-50"
    >
      {status === "loading" ? "Removing..." : "Remove from Collection"}
    </button>
  );
}
