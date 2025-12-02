// api/home/artists.ts
export type HomeArtistArtwork = {
    id: string;                // encryptedArtworkId
    thumbnail: string;
    name: string;              // 작품명
    sound?: string;
    artistName?: string;
    likes?: number;
    thoughts?: number | boolean; // 스키마가 불리언일 수도 있으니 number | boolean
  };
  
  export type HomeArtist = {
    id: string;                // encryptedArtistId
    name: string;
    profileImg?: string;
    follow?: boolean;          // 사용자가 팔로우 중인지
    artworks?: HomeArtistArtwork[];
  };
  
  const API_BASE = "https://api.curizm.io"; // 필요 시 환경변수로 대체
  
  export async function getRecommendedArtists(
    signal?: AbortSignal
  ): Promise<HomeArtist[]> {
    const res = await fetch(`${API_BASE}/api/v1/home/artists`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const json = await res.json();
    if (!Array.isArray(json)) return [];
  
    // 서버 스키마 그대로(필요 최소 매핑)
    return json as HomeArtist[];
  }
  