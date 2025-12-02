// api/ai.ts
const BASE = "https://api.curizm.io";

// 전시 채팅
export async function chatWithExhibition(exhibitionId: string, question: string) {
  const res = await fetch(`${BASE}/api/v1/exhibitions/${exhibitionId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }), // ← Swagger의 필드명이 prompt면 prompt로 바꿔
  });
  if (!res.ok) throw new Error(`chatWithExhibition ${res.status}`);
  return res.json(); // { answer: string, ... } 라고 가정
}

// (선택) 작품 채팅이 따로 있다면
export async function chatWithArtwork(artworkId: string, question: string) {
  const res = await fetch(`${BASE}/api/v1/artworks/${artworkId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`chatWithArtwork ${res.status}`);
  return res.json();
}

// subjectType에 따라 자동 라우팅
export async function chatAuto(
  note: { subjectType?: string; subjectId?: string; exhibitionId?: string },
  question: string
) {
  if (note.subjectType === "EXHIBITION" && note.subjectId) {
    return chatWithExhibition(note.subjectId, question);
  }
  if (note.subjectType === "ARTWORK" && note.subjectId) {
    // 작품 채팅 엔드포인트가 없으면 전시로 폴백
    try {
      return await chatWithArtwork(note.subjectId, question);
    } catch {
      // 폴백: 작품이 속한 전시로 질문
      if (note.exhibitionId) return chatWithExhibition(note.exhibitionId, question);
      throw new Error("작품/전시 식별자가 없습니다.");
    }
  }
  // subjectType이 불확실하면 exhibitionId로 시도
  if (note.exhibitionId) return chatWithExhibition(note.exhibitionId, question);
  throw new Error("질의에 필요한 ID가 없습니다.");
}
