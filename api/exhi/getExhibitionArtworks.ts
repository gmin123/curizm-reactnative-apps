// app/api/exhi/getExhibitionArtworks.ts
export interface ArtworkItem {
  id: string;
  name: string;
  thumbnail: string;
  sound: string;
  durationTime: number;
  artistName: string;
  groupOrder?: number;
  groupName?: string | null;
}

export interface ExhibitionArtworksResponse {
  artworks: ArtworkItem[];
  total: number;
}

/**
 * 전시의 작품 목록 가져오기
 */
export const getExhibitionArtworks = async (
  exhibitionId: string,
  page = 1
): Promise<ExhibitionArtworksResponse> => {
  try {
    const cleanId = exhibitionId.trim(); // ✅ 인코딩 제거 (Postman과 동일)
    const url = `https://api.curizm.io/api/v1/exhibition/artworks/${cleanId}?page=${page}`;

    console.log("📡 [API 요청] Exhibition Artworks:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ http ${res.status}: ${text}`);
      // 실패 시에도 안전한 빈 구조 반환
      return { artworks: [], total: 0 };
    }

    const data = await res.json();

    // ✅ 구조 검증
    if (!data || !Array.isArray(data.artworks)) {
      console.warn("⚠️ artworks 데이터가 배열이 아님:", data);
      return { artworks: [], total: 0 };
    }

    console.log("🎨 [API 응답] artworks 개수:", data.artworks.length);

    return {
      artworks: data.artworks.map((art: any) => ({
        id: art.id || "",
        name: art.name || "제목 없음",
        thumbnail: art.thumbnail || "",
        sound: art.sound || "",
        durationTime: art.durationTime ?? 0,
        artistName: art.artistName || "작가 미상",
        groupOrder: art.groupOrder ?? 0,
        groupName: art.groupName ?? null,
      })),
      total: typeof data.total === "number" ? data.total : 0,
    };
  } catch (err: any) {
    console.error("🚨 Error fetching artworks:", err);
    return { artworks: [], total: 0 }; // ✅ 에러 방어
  }
};
