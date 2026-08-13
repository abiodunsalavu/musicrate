"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCollectionButton({ albumId }) {
  const [status, setStatus] = useState("idle"); // idle | loading | added
  const router = useRouter();

  const handleAdd = async () => {
    setStatus("loading");

    const response = await fetch("/api/add-to-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId }),
    });

    if (response.ok) {
      setStatus("added");
      router.refresh();
    } else {
      setStatus("idle");
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={status !== "idle"}
      className="border rounded-lg px-4 py-2 text-sm bg-white text-black font-medium disabled:opacity-50"
    >
      {status === "loading" && "Adding..."}
      {status === "added" && "Added ✓"}
      {status === "idle" && "Add to Collection"}
    </button>
  );
}