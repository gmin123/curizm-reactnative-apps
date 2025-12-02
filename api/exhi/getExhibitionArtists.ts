  export type ExhibitionArtist = {
  id: string; // encrypted artist id
  name: string;
  profileImg?: string | null;
  memberFollow?: boolean;
  numberOfArtworks?: number;
  artworkId?: string;

  // ✅ 추가 (서버에서 넘어올 수 있는 필드)
  sound?: string;
  subtitlesUrl?: string;
  thumbnail?: string;
};

export type ExhibitionArtistsResponse = {
  artists: ExhibitionArtist[];
  total: number;
};

const APIBASE = "https://api.curizm.io";

async function authHeaders(): Promise<HeadersInit> {
  return {
    "Content-Type": "application/json",
    // 필요시 Authorization, etc.
  };
}

export async function getExhibitionArtists(
  exhibitionId: string,
  page: number = 1
): Promise<ExhibitionArtistsResponse> {
  const url = `${APIBASE}/api/v1/exhibition/artists/${encodeURIComponent(
    exhibitionId
  )}?page=${page}`;

  const res = await fetch(url, {
    headers: await authHeaders(),
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`getExhibitionArtists ${res.status}: ${text}`);
  }

  const json = (await res.json()) as ExhibitionArtistsResponse;

  // ✅ 콘솔 출력 (API 응답 구조 확인용)
  console.log("🎨 전시추천API 응답:", JSON.stringify(json, null, 2));

  return {
    artists: Array.isArray(json?.artists) ? json.artists : [],
    total: typeof json?.total === "number" ? json.total : 0,
  };
}

