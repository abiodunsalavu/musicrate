"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navigatingId, setNavigatingId] = useState(null);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setResults(data.albums);
    setLoading(false);
  };

  const handleViewAlbum = async (album) => {
    setNavigatingId(album.spotifyId);

    const response = await fetch("/api/get-or-create-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(album),
    });

    const data = await response.json();
    router.push(`/albums/${data.id}`);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Musicrate</h1>
      <h1>
      <Link href="/collection" className="text-2xl font-bold mb-6 text-blue-500 hover:underline">
      My Collection
      </Link>
      </h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1"
        />
        <button type="submit" className="border rounded-lg px-4 py-2 bg-white text-black font-medium">
          Search
        </button>
      </form>

      {loading && <p>Searching...</p>}

      <div className="grid grid-cols-2 gap-4">
        {results.map((album) => (
          <div
            key={album.spotifyId}
            onClick={() => handleViewAlbum(album)}
            className="border rounded-lg p-4 flex gap-3 items-center cursor-pointer hover:bg-gray-900"
          >
            {album.coverUrl && (
              <img src={album.coverUrl} alt={album.title} className="w-16 h-16 rounded" />
            )}
            <div className="flex-1">
              <h2 className="font-semibold">{album.title}</h2>
              <p className="text-sm text-gray-500">{album.artist} · {album.year}</p>
            </div>
            {navigatingId === album.spotifyId && (
              <span className="text-xs text-gray-500">Loading...</span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}