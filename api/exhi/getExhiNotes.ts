// 파일: src/api/exhi/getExhibitionNotes.ts

export type ExhibitionNote = {
    id: string;
    subjectId: string;
    subjectType: string;
    exhibitionId: string;
    exhibitionName: string;
    isPaidExhibition: boolean;
    memberProfileImg?: string;
    memberName: string;
    image?: string;
    thumbnail?: string;
    title?: string;
    artistId?: string;
    organizerOrCreator?: string;
    question?: string;
    answer?: string;
    isPublic: boolean;
    createdAt: string; // ISO 날짜
  };
  
  export type ExhibitionNotesResponse = {
    chats: ExhibitionNote[];
    total: number;
  };
  
  /**
   * 특정 전시의 커뮤니티 노트(Chats) 가져오기 (fetch 버전)
   * @param exhibitionId 암호화된 전시 ID
   * @param page 페이지 번호 (기본 1)
   */
  export async function getExhibitionNotes(
  exhibitionId: string,
  page: number = 1,
  options?: RequestInit
): Promise<ExhibitionNotesResponse> {
  const url = `https://api.curizm.io/api/v1/exhibition/notes/${encodeURIComponent(
    exhibitionId
  )}?page=${page}`;

  console.log("[getExhibitionNotes] 요청 URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    ...options,
  });
  
    if (!res.ok) {
      console.error("[getExhibitionNotes] 요청 실패:", res.status, res.statusText);
      throw new Error(`노트 요청 실패: ${res.status}`);
    }
  
    const data = (await res.json()) as ExhibitionNotesResponse;
  
    // ✅ 받아온 데이터 콘솔 로그 출력
    console.log("[getExhibitionNotes] 응답 데이터:", JSON.stringify(data, null, 2));
  
    return data;
  }
  