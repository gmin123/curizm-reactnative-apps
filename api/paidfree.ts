// api/paidfree.ts
export type HomeExhibitionCard = {
    id: string;
    title: string;
    organizer?: string;
    coverImage?: string;
    likes?: number;
    thoughts?: number;
    priceCoins?: number;     // 0 또는 undefined면 무료
    link?: string;
  };
  
  const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "https://api.curizm.io";
  
  function mapRow(r: any): HomeExhibitionCard {
    return {
      id: String(r?.id ?? r?.exhibitionId ?? ""),
      title: r?.title ?? "-",
      organizer: r?.organizer ?? r?.place ?? r?.gallery ?? "",
      coverImage: r?.coverImage ?? r?.imageUrl ?? r?.image ?? undefined,
      likes: typeof r?.likes === "number" ? r.likes : undefined,
      thoughts: typeof r?.thoughts === "number" ? r.thoughts : undefined,
      priceCoins:
        typeof r?.priceCoins === "number"
          ? r.priceCoins
          : typeof r?.price === "number"
          ? r.price
          : undefined,
      link: r?.link,
    };
  }
  
  /** GET /api/v1/home/exhibitions/paid */
  export async function getPaidExhibitions(signal?: AbortSignal): Promise<HomeExhibitionCard[]> {
    const res = await fetch(`${API_BASE}/api/v1/home/exhibitions/paid`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} (paid exhibitions)`);
    const json = await res.json();
    return (Array.isArray(json) ? json : []).map(mapRow);
  }
  
  /** GET /api/v1/home/exhibitions/free */
  export async function getFreeExhibitions(signal?: AbortSignal): Promise<HomeExhibitionCard[]> {
    const res = await fetch(`${API_BASE}/api/v1/home/exhibitions/free`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} (free exhibitions)`);
    const json = await res.json();
    return (Array.isArray(json) ? json : []).map(mapRow);
  }
  