// app/api/exhi/getExhibitionDetailData.ts

export interface AudioItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  sound: string;
  exhibitionId: string;
  durationTime?: number;
  subtitlesUrl?: string;
}

export interface ExhibitionDetailResponse {
  id: string;
  title: string;
  organizer: string;
  coverImage?: string | null;
  startDate: string;
  endDate: string;
  introduction?: string;
  likes?: number;
  likesCount?: number;
  thoughts?: number;
  thoughtsCount?: number;
  subtitlesUrl?: string;
  artworks: AudioItem[];
}

/**
 * 전시 상세 데이터 가져오기
 * (오류가 있어도 가능한 데이터는 최대한 반환)
 */
export const getExhibitionDetailData = async (
  exhibitionId: string
): Promise<ExhibitionDetailResponse> => {
  try {
    const encodedId = encodeURIComponent(exhibitionId.trim());
    console.log("📡 [API 요청] Exhibition ID:", encodedId);

    // ✅ player API 호출 (기존 유지)
    const res = await fetch(
      `https://api.curizm.io/api/v1/exhibition/player?exhibitionId=${encodedId}&type=exhibition`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    let data: any = {};
    if (res.ok) {
      try {
        data = await res.json();
        console.log("✅ [player API 응답]:", data);
      } catch (e) {
        console.warn("⚠️ player JSON 파싱 실패:", e);
      }
    } else {
      console.error("❌ player 응답 상태:", res.status);
    }

    // ✅ detail API 추가 호출 (likes, thoughts를 위함)
    let detailData: any = {};
    try {
      const detailRes = await fetch(`https://api.curizm.io/api/v1/exhibition/detail/${encodedId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (detailRes.ok) {
        detailData = await detailRes.json();
        console.log("✅ [detail API 응답]:", detailData);
        console.log("✅ [detail likes]:", detailData.likes, "detail thoughts:", detailData.thoughts);
      }
    } catch (e) {
      console.warn("⚠️ detail API 호출 실패:", e);
    }

    // ✅ detail의 likes, thoughts를 우선 사용
    const likesValue = detailData.likes ?? data.likes ?? data.likesCount ?? 0;
    const thoughtsValue = detailData.thoughts ?? data.thoughts ?? data.thoughtsCount ?? 0;
    
    console.log("📥 [최종 likes]:", likesValue, "최종 thoughts:", thoughtsValue);
    
    const formatted: ExhibitionDetailResponse = {
      id: String(data.id || exhibitionId || "unknown"),
      title: String(data.title || "제목 없음"),
      organizer: String(data.name || data.organizer || "정보 없음"),
      coverImage: detailData.coverImage || data.coverImage || data.image || data.thumbnail || null,
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      introduction:
        data.introduction ||
        data.ttsVoices?.[0]?.description ||
        "소개 정보가 없습니다.",
      likes: Number(likesValue),
      likesCount: Number(likesValue),
      subtitlesUrl: data.subtitles || data.subtitlesUrl || "",
      thoughts: Number(thoughtsValue),
      thoughtsCount: Number(thoughtsValue),

      // ✅ artworks가 없으면 단일 오디오 데이터를 artworks로 변환
      artworks: Array.isArray(data.artworks)
        ? data.artworks.map((art: any) => ({
            id: String(art.id || exhibitionId),
            title: art.name || art.title || data.title || "무제",
            artist: art.artistName || data.name || "작가 미상",
            thumbnail: art.thumbnail || art.image || data.image || "",
            sound: art.sound || "",
            exhibitionId: String(exhibitionId),
            durationTime: art.durationTime ?? data.durationTime ?? 0,
            subtitlesUrl: art.subtitlesUrl || data.subtitles || "",
          }))
        : [
            {
              id: String(exhibitionId),
              title: data.title || "무제",
              artist: data.name || "작가 미상",
              thumbnail: data.thumbnail || data.image || "",
              sound: data.sound || "",
              exhibitionId: String(exhibitionId),
              durationTime: data.durationTime ?? 0,
              subtitlesUrl: data.subtitles || "",
            },
          ],
    };

    console.log("✅ [API 변환 완료] Exhibition Detail:", formatted);
    return formatted;
  } catch (err: any) {
    console.error("🚨 getExhibitionDetailData 실패:", err.message || err);
    // ❗ 실패해도 최소 구조 반환
    return {
      id: exhibitionId,
      title: "데이터 로드 실패",
      organizer: "정보 없음",
      coverImage: null,
      startDate: "",
      endDate: "",
      introduction: "데이터를 불러오지 못했습니다.",
      likes: 0,
      likesCount: 0,
      thoughts: 0,
      thoughtsCount: 0,
      subtitlesUrl: "",
      artworks: [],
    };
  }
};
