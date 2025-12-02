// api/Discover/getExhi.ts
export type DiscoverExhibition = {
  id: string;
  title: string;
  organizer?: string;
  coverImage?: string;
  priceCoins?: number;   // 0 or undefined => 무료
  link?: string;
  memberLike?: boolean;
  likes?: number;
  likesCount?: number;
  numberOfLikes?: number;
  createdAt?: string;
  startDate?: string;
};

export type ExhiType = "ALL" | "FREE" | "PAID";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "https://api.curizm.io";

type Paginated<T> = { items: T[]; total?: number; page?: number };

/** OAS: GET /api/v1/home/all/exhibitions?page=&type=ALL|FREE|PAID&sortBy=name */
export async function listExhibitions(params: {
  page?: number;
  type?: ExhiType;
  sortBy?: string; // 서버 스펙상 name 권장
  signal?: AbortSignal;
}): Promise<Paginated<DiscoverExhibition>> {
  const page = params.page ?? 1;
  const type = params.type ?? "ALL";
  const sortBy = params.sortBy ?? "name";
  const { signal } = params;

  const url =
    `${API_BASE}/api/v1/home/all/exhibitions?` +
    `page=${page}&type=${encodeURIComponent(type)}&sortBy=${encodeURIComponent(sortBy)}`;

  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Exhibitions HTTP ${res.status} ${msg ? `- ${msg}` : ""}`);
  }
  const json = await res.json();

  // 응답이 배열 또는 {items,total} / {exhibitions,total} 모두 수용
  const raw: any[] = Array.isArray(json)
    ? json
    : Array.isArray(json?.items)
    ? json.items
    : Array.isArray(json?.exhibitions)
    ? json.exhibitions
    : [];

  return {
    items: raw.map(mapRow),
    total: json?.total ?? json?.count ?? undefined,
    page: json?.page ?? page,
  };
}

export async function listAllExhibitions(page = 1, signal?: AbortSignal) {
  return listExhibitions({ page, type: "ALL", signal });
}
export async function listFreeExhibitions(page = 1, signal?: AbortSignal) {
  return listExhibitions({ page, type: "FREE", signal });
}
export async function listPaidExhibitions(page = 1, signal?: AbortSignal) {
  return listExhibitions({ page, type: "PAID", signal });
}

/* ---------- mapper ---------- */
function mapRow(r: any): DiscoverExhibition {
  return {
    id: String(r?.id ?? r?.exhibitionId ?? ""),
    title: r?.title ?? "-",
    organizer: r?.organizer ?? r?.place ?? r?.gallery ?? undefined,
    coverImage: r?.coverImage ?? r?.imageUrl ?? r?.image ?? undefined,
    priceCoins:
      typeof r?.priceCoins === "number"
        ? r.priceCoins
        : typeof r?.price === "number"
        ? r.price
        : undefined,
    link: r?.link ?? undefined,
    memberLike:
      typeof r?.memberLike === "boolean"
        ? r.memberLike
        : typeof r?.liked === "boolean"
        ? r.liked
        : undefined,
    likes: r?.likes ?? r?.likesCount ?? r?.numberOfLikes,
    likesCount: r?.likesCount,
    numberOfLikes: r?.numberOfLikes,
    createdAt: r?.createdAt,
    startDate: r?.startDate,
  };
}
