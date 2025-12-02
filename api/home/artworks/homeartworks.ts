// api/home/artworks.ts
export type SharedArtwork = {
    id: string;               // encryptedArtworkId
    thumbnail: string;        // 썸네일 URL
    name: string;             // 작품명
    sound?: string;           // 음성 URL(있으면)
    artistName: string;       // 작가명
    memberLike?: boolean;     // 사용자가 좋아요 했는지
    chatId?: string;          // 생각 채팅 ID
    question?: string;        // 최근 공유된 대표 질문
  };
  
  const API_BASE = "https://api.curizm.io"; // 프로젝트에 맞게 수정
  
  export async function getMostSharedArtworks(
    signal?: AbortSignal
  ): Promise<SharedArtwork[]> {
    const res = await fetch(`${API_BASE}/api/v1/home/artworks/list`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) {
      throw new Error(`API 실패: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    if (!Array.isArray(json)) return [];
    // 스키마 그대로 반환
    return json as SharedArtwork[];
  }
  