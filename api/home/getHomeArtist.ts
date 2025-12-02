// api/home/artists.ts
export type ArtistListItem = {
  id: string;
  name: string;
  profileImg?: string;
  artworksCount?: number;
  followers?: number;
  follow?: boolean; // 서버가 내려주면 그대로 사용
};

const API = "https://api.curizm.io";

type Paginated<T> = { items: T[]; total?: number; page?: number };

/** [추천 작가] GET /api/v1/home/artists  */
export async function getHomeRecommendedArtists(
  signal?: AbortSignal
): Promise<ArtistListItem[]> {
  const url = `${API}/api/v1/home/artists`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} (home/artists)`);
  const json = await res.json();
  return Array.isArray(json) ? json.map(mapArtist) : [];
}

/** [모든 작가] GET /api/v1/home/all/artists?page=&sortBy=name */
export async function getAllArtists(params?: {
  page?: number;
  sortBy?: "name" | "latest" | string;
  signal?: AbortSignal;
}): Promise<Paginated<ArtistListItem>> {
  const page = params?.page ?? 1;
  const sortBy = params?.sortBy ?? "name";
  const { signal } = params ?? {};

  const url = `${API}/api/v1/home/all/artists?page=${page}&sortBy=${encodeURIComponent(
    sortBy
  )}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} (home/all/artists)`);

  const json = await res.json();

  // 서버가 배열 또는 {items,total} 둘 다 가능하므로 안전하게 매핑
  if (Array.isArray(json)) {
    return { items: json.map(mapArtist), total: undefined, page };
  }
  const items =
    Array.isArray(json?.items)
      ? json.items
      : Array.isArray(json?.artists)
      ? json.artists
      : [];
  return {
    items: items.map(mapArtist),
    total: json?.total ?? json?.count,
    page: json?.page ?? page,
  };
}

/* ---------- mapper ---------- */
function mapArtist(a: any): ArtistListItem {
  return {
    id: String(a?.id ?? a?.artistId ?? ""),
    name: a?.name ?? a?.artistName ?? "-",
    profileImg: a?.profileImg ?? a?.image ?? a?.avatar ?? undefined,
    artworksCount:
      a?.artworksCount ??
      a?.numberOfArtworks ??
      (Array.isArray(a?.artworks) ? a.artworks.length : undefined),
    followers: a?.followers ?? a?.followerCount ?? a?.likes ?? undefined,
    follow:
      typeof a?.follow === "boolean"
        ? a.follow
        : typeof a?.memberFollow === "boolean"
        ? a.memberFollow
        : undefined,
  };
}
