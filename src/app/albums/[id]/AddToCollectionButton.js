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
      className="btn-primary mt-4 w-full"
    >
      {status === "loading" && "Adding…"}
      {status === "added" && "Added"}
      {status === "idle" && "Add to collection"}
    </button>
  );
}