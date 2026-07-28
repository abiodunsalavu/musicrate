"use client";

import { useState } from "react";

const albums = [
  { id: 1, title: "Psychodrama", artist: "Dave", year: 2019, rating: 5 },
  { id: 2, title: "The Off-Season", artist: "J. Cole", year: 2021, rating: 5 },
  { id: 3, title: "Blonde", artist: "Frank Ocean", year: 2016, rating: 5 },
  { id: 4, title: "DAMN.", artist: "Kendrick Lamar", year: 2017, rating: 5 },
];

export default function Home() {
  const [query, setQuery] = useState("");

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Musicrate</h1>

      <input
        type="text"
        placeholder="Search albums..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded-lg px-4 py-2 mb-6 w-full max-w-md"
      />

      <div className="grid grid-cols-2 gap-4">
        {filteredAlbums.map((album) => (
          <div key={album.id} className="border rounded-lg p-4">
            <h2 className="font-semibold">{album.title}</h2>
            <p className="text-sm text-gray-500">{album.artist} · {album.year}</p>
            <p className="text-sm mt-1">{"★".repeat(album.rating)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}