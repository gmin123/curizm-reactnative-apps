// api/exhibitionPlayer.ts
export async function fetchExhibitionPlayer(params: {
  exhibitionId: string;
  artworkId?: string;
  artistId?: string;
  type?: string;
  sessionId?: string;
}) {
  const search = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  const res = await fetch(`https://api.curizm.io/api/v1/exhibition/player?${search}`);
  if (!res.ok) throw new Error("Failed to get exhibition player");
  return await res.json();
}
