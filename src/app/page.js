"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "./components/Avatar";

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
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <section className="pt-10 pb-8 sm:pt-16 sm:pb-10">
        <p className="eyebrow text-accent-text">Your music diary</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold sm:text-6xl">
          Rate what you&apos;re listening to.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Search any album, score it out of 10, and see what everyone else thinks.
        </p>

        <form onSubmit={handleSearch} className="mt-8 flex max-w-xl gap-2">
          <label htmlFor="search" className="sr-only">Search albums or users</label>
          <input
            id="search"
            type="search"
            placeholder="Search albums or users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input min-h-13 rounded-2xl text-lg"
          />
          <button type="submit" className="btn-primary min-h-13 rounded-2xl px-6">
            Search
          </button>
        </form>
      </section>

      {loading && <ResultsSkeleton />}

      {searched && !loading && (
        <>
          <div role="tablist" className="mb-6 flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.type}
                role="tab"
                aria-selected={activeTab === tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.type
                    ? "bg-fg text-bg"
                    : "border border-border text-muted hover:text-fg"
                }`}
              >
                {tab.label} <span className="opacity-70">{results[tab.type].length}</span>
              </button>
            ))}
          </div>

          {activeResults.length === 0 && (
            <p className="text-muted">No {activeTab} found for &ldquo;{query}&rdquo;.</p>
          )}

          {activeTab === "albums" && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
              {results.albums.map((album) => (
                <button
                  key={album.spotifyId}
                  onClick={() => handleViewAlbum(album)}
                  className="group text-left"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2">
                    {album.coverUrl && (
                      <img
                        src={album.coverUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    {navigatingId === album.spotifyId && (
                      <div className="absolute inset-0 grid place-items-center bg-overlay text-sm font-semibold text-white">
                        Opening…
                      </div>
                    )}
                  </div>
                  <h2 className="mt-2.5 truncate font-sans text-sm font-semibold tracking-normal group-hover:text-accent-text">
                    {album.title}
                  </h2>
                  <p className="truncate text-sm text-muted">
                    {album.artist} · {album.year}
                  </p>
                </button>
              ))}
            </div>
          )}

          {activeTab === "users" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.users.map((user) => (
                <Link
                  key={user.username}
                  href={`/users/${user.username}`}
                  className="card flex items-center gap-3 p-4 transition-colors hover:bg-surface-2"
                >
                  <Avatar url={user.avatarUrl} name={user.displayName || user.username} />
                  <div className="min-w-0">
                    <h2 className="truncate font-sans text-base font-semibold tracking-normal">
                      {user.displayName || user.username}
                    </h2>
                    <p className="truncate text-sm text-muted">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5" aria-label="Loading results">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-xl bg-surface-2" />
          <div className="mt-3 h-3.5 w-3/4 rounded bg-surface-2" />
          <div className="mt-2 h-3 w-1/2 rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
