"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// add an entry here (and a matching type in /api/search) to add a new results tab
const TABS = [
  { type: "albums", label: "Albums" },
  { type: "users", label: "Users" },
];

const emptyResults = Object.fromEntries(TABS.map((tab) => [tab.type, []]));

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(emptyResults);
  const [activeTab, setActiveTab] = useState(TABS[0].type);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigatingId, setNavigatingId] = useState(null);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    const entries = await Promise.all(
      TABS.map(async ({ type }) => {
        const response = await fetch(`/api/search?type=${type}&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return [type, data[type] ?? []];
      })
    );

    const nextResults = Object.fromEntries(entries);
    setResults(nextResults);
    setSearched(true);
    setLoading(false);

    // jump to the first tab with results if the current one is empty
    if (nextResults[activeTab].length === 0) {
      const firstWithResults = TABS.find((tab) => nextResults[tab.type].length > 0);
      if (firstWithResults) setActiveTab(firstWithResults.type);
    }
  };

  const handleViewAlbum = async (album) => {
    setNavigatingId(album.spotifyId);

    const response = await fetch("/api/get-or-create-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(album),
    });

    const data = await response.json();

    if (response.status === 401) {
      router.push("/login");
      return;
    }

    if (!response.ok) {
      setNavigatingId(null);
      return;
    }

    router.push(`/albums/${data.id}`);
  };

  const activeResults = results[activeTab];

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6 w-full sm:max-w-md">
      Welcome to MusicRate! Search for albums and people, and add albums to your collection.
      </h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search albums or users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1 min-w-0"
        />
        <button
          type="submit"
          className="border rounded-lg px-4 py-2 bg-white text-black font-medium"
        >
          Search
        </button>
      </form>

      {loading && <p>Searching...</p>}

      {searched && !loading && (
        <>
          <div className="flex gap-6 border-b border-gray-800 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={
                  activeTab === tab.type
                    ? "border-b-2 border-white pb-2 font-medium text-sm -mb-px"
                    : "pb-2 text-sm text-gray-500 hover:text-gray-300"
                }
              >
                {tab.label} ({results[tab.type].length})
              </button>
            ))}
          </div>

          {activeResults.length === 0 && (
            <p className="text-gray-500 text-sm">No {activeTab} found for &ldquo;{query}&rdquo;.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTab === "albums" &&
              results.albums.map((album) => (
                <div
                  key={album.spotifyId}
                  onClick={() => handleViewAlbum(album)}
                  className="border rounded-lg p-4 flex gap-3 items-center cursor-pointer hover:bg-gray-900"
                >
                  {album.coverUrl && (
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-16 h-16 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="font-semibold">{album.title}</h2>
                    <p className="text-sm text-gray-500">
                      {album.artist} · {album.year}
                    </p>
                  </div>
                  {navigatingId === album.spotifyId && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </div>
              ))}

            {activeTab === "users" &&
              results.users.map((user) => (
                <Link
                  key={user.username}
                  href={`/users/${user.username}`}
                  className="border rounded-lg p-4 flex gap-3 items-center hover:bg-gray-900"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">?</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{user.displayName || user.username}</h2>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </main>
  );
}
