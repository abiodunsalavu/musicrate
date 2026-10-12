const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function isValidSpotifyId(id) {
  return typeof id === "string" && SPOTIFY_ID_PATTERN.test(id);
}

// reuse the token until shortly before it expires instead of fetching one per request
let cachedToken = null;
let cachedTokenExpiresAt = 0;

export async function getSpotifyToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    throw new Error(`Spotify token request failed: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  cachedToken = tokenData.access_token;
  cachedTokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;
  return cachedToken;
}

export async function getAlbum(spotifyId) {
  if (!isValidSpotifyId(spotifyId)) return null;

  const accessToken = await getSpotifyToken();

  const response = await fetch(`https://api.spotify.com/v1/albums/${spotifyId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const album = await response.json();

  return {
    spotifyId: album.id,
    title: album.name,
    artist: album.artists?.[0]?.name,
    year: album.release_date ? Number(album.release_date.slice(0, 4)) : null,
    coverUrl: album.images?.[0]?.url,
  };
}

export async function getAlbumTracks(spotifyId) {
  if (!isValidSpotifyId(spotifyId)) return [];

  const accessToken = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/albums/${spotifyId}/tracks?limit=50`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) return [];

  const data = await response.json();

  return (data.items ?? []).map((track) => ({
    id: track.id,
    name: track.name,
    trackNumber: track.track_number,
    durationMs: track.duration_ms,
  }));
}
