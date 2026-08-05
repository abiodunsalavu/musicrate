"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setResults(data.albums);
    setLoading(false);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Musicrate</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1"
        />
        <button
          type="submit"
          className="border rounded-lg px-4 py-2 bg-white text-black font-medium"
        >
          Search
        </button>
      </form>

      {loading && <p>Searching...</p>}

      <div className="grid grid-cols-2 gap-4">
        {results.map((album) => (
          <div key={album.spotifyId} className="border rounded-lg p-4 flex gap-3">
            {album.coverUrl && (
              <img src={album.coverUrl} alt={album.title} className="w-16 h-16 rounded" />
            )}
            <div>
              <h2 className="font-semibold">{album.title}</h2>
              <p className="text-sm text-gray-500">{album.artist} · {album.year}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}