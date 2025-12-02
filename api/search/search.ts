// api/search/search.ts
// 서버 검색 API 호출 + 공통 뷰모델 매핑 (fetch 전용)

export type SearchType = "artwork" | "artist" | "exhibition";

export type SearchResultItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  thumbnail?: string;
};

export type SearchResultBlock = {
  type: SearchType;
  items: SearchResultItem[];
  total?: number;
};

export type SearchAllResponse = {
  blocks: SearchResultBlock[];
  exactMatch?: { type: SearchType; data: any };
};

export type SearchByTypeResponse = {
  items: SearchResultItem[];
  total: number;
  hasMore: boolean;
};

// ──────────────────────────────────────────────────────────────
// 0) 서버 기본
// ──────────────────────────────────────────────────────────────
const BASE = "https://api.curizm.io";
const ZERO_BASED_PAGE = false; // 서버가 0-based면 true

// 쿼리스트링
function qs(obj: Record<string, any>) {
  const q = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
}

// 공통 fetch
type HttpInit = Omit<RequestInit, "body"> & {
  body?: any;
  timeoutMs?: number;
  token?: string;
};

async function http<T = any>(path: string, init: HttpInit = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 15000);

  const headers: Record<string, string> = { ...(init.headers as any) };
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData) headers["Content-Type"] = "application/json";
  if (init.token) headers["Authorization"] = `Bearer ${init.token}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      body: init.body && !isFormData ? JSON.stringify(init.body) : init.body,
      signal: controller.signal,
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : (null as T);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} :: ${url}`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// ──────────────────────────────────────────────────────────────
// 1) 초기 검색: GET /api/v1/search?keyword=...
//    (정확일치 + 각 카테고리 상위 3개)
// ──────────────────────────────────────────────────────────────
export type InitialSearchResp = {
  exactMatch?: { type: SearchType; data: any };
  artists?: any[];
  artworks?: any[];
  exhibitions?: any[];
};
export async function getInitialSearch(keyword: string, opts?: { token?: string }) {
  return http<InitialSearchResp>(`/api/v1/search${qs({ keyword })}`, opts);
}

// ──────────────────────────────────────────────────────────────
// 2) 페이징 검색 3종: keyword, page
//    응답: { total: number, data: [...] }
// ──────────────────────────────────────────────────────────────
export type Paginated<T> = { total: number; data: T[] };

export async function getArtists(keyword: string, page = 1, opts?: { token?: string }) {
  const pageParam = ZERO_BASED_PAGE ? Math.max(0, page - 1) : page;
  return http<Paginated<any>>(`/api/v1/search/artists${qs({ keyword, page: pageParam })}`, opts);
}
export async function getArtworks(keyword: string, page = 1, opts?: { token?: string }) {
  const pageParam = ZERO_BASED_PAGE ? Math.max(0, page - 1) : page;
  return http<Paginated<any>>(`/api/v1/search/artworks${qs({ keyword, page: pageParam })}`, opts);
}
export async function getExhibitions(keyword: string, page = 1, opts?: { token?: string }) {
  const pageParam = ZERO_BASED_PAGE ? Math.max(0, page - 1) : page;
  return http<Paginated<any>>(`/api/v1/search/exhibitions${qs({ keyword, page: pageParam })}`, opts);
}

// ──────────────────────────────────────────────────────────────
// 3) 뷰모델 매핑
// ──────────────────────────────────────────────────────────────
function mapArtworkList(json: Paginated<any>): SearchResultItem[] {
  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((a) => ({
    id: a.id,
    title: a.name ?? "",
    subtitle: [a.artistName, a.year].filter(Boolean).join(" · ") || undefined,
    thumbnail: a.thumbnail ?? a.coverImage ?? a.image,
  }));
}
function mapArtistList(json: Paginated<any>): SearchResultItem[] {
  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((a) => ({
    id: a.id,
    title: a.name ?? "",
    subtitle: a.numberOfArtworks != null ? `작품 ${a.numberOfArtworks}점` : undefined,
    thumbnail: a.profileImg ?? a.thumbnail ?? a.image,
  }));
}
function mapExhibitionList(json: Paginated<any>): SearchResultItem[] {
  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((a) => ({
    id: a.id,
    title: a.title ?? "",
    subtitle: a.organizer ?? undefined,
    thumbnail: a.coverImage ?? a.thumbnail ?? a.image,
  }));
}

const LIST_MAPPER: Record<SearchType, (json: Paginated<any>) => SearchResultItem[]> = {
  artwork: mapArtworkList,
  artist: mapArtistList,
  exhibition: mapExhibitionList,
};

// ──────────────────────────────────────────────────────────────
// 4) 공개 API
// ──────────────────────────────────────────────────────────────
export async function searchByType(
  type: SearchType,
  keyword: string,
  page: number,
  opts?: { token?: string }
): Promise<SearchByTypeResponse> {
  const pageParam = ZERO_BASED_PAGE ? Math.max(0, page - 1) : page;

  const json =
    type === "artwork"
      ? await getArtworks(keyword, page, opts)
      : type === "artist"
      ? await getArtists(keyword, page, opts)
      : await getExhibitions(keyword, page, opts);

  const items = LIST_MAPPER[type](json);
  const total = Number(json?.total ?? 0);
  const perPage = Array.isArray(json?.data) ? json.data.length : items.length || 0;
  const hasMore = perPage > 0 ? pageParam * perPage + perPage < total : false;

  return { items, total, hasMore };
}

export async function searchAll(keyword: string, opts?: { token?: string }): Promise<SearchAllResponse> {
  const init = await getInitialSearch(keyword, opts);

  const artists = (init?.artists ?? []).map((a: any) => ({
    id: a.id,
    title: a.name ?? "",
    subtitle: a.numberOfArtworks != null ? `작품 ${a.numberOfArtworks}점` : undefined,
    thumbnail: a.profileImg ?? a.thumbnail ?? a.image,
  }));
  const artworks = (init?.artworks ?? []).map((a: any) => ({
    id: a.id,
    title: a.name ?? "",
    subtitle: [a.artistName, a.year].filter(Boolean).join(" · ") || undefined,
    thumbnail: a.thumbnail ?? a.coverImage ?? a.image,
  }));
  const exhibitions = (init?.exhibitions ?? []).map((a: any) => ({
    id: a.id,
    title: a.title ?? "",
    subtitle: a.organizer ?? undefined,
    thumbnail: a.coverImage ?? a.thumbnail ?? a.image,
  }));

  return {
    blocks: [
      { type: "artwork", items: artworks },
      { type: "artist", items: artists },
      { type: "exhibition", items: exhibitions },
    ],
    exactMatch: init?.exactMatch,
  };
}
