export async function getSpotifyToken() {
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

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export async function getAlbumTracks(spotifyId) {
  const accessToken = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/albums/${spotifyId}/tracks?limit=50`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await response.json();

  return data.items.map((track) => ({
    id: track.id,
    name: track.name,
    trackNumber: track.track_number,
    durationMs: track.duration_ms,
  }));
}