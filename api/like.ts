// app/api/likes.ts
const BASE_URL = "https://api.curizm.io"; // 필요 시 .com 유지

/** 
 * 공통 헤더 생성 함수 
 */
const makeHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

/** 
 * 공통 응답 핸들러 
 */
async function handleResponse(res: Response, action: string) {
  const text = await res.text();
  let data: any = null;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    console.warn(`❌ [${action}] 실패:`, data);
    throw new Error(`${action} failed`);
  }

  console.log(`✅ [${action}] 성공 (${res.status})`, data);
  return data.message || `${action} succeeded`;
}

// ----------------------
// 🎨 작품 좋아요 토글
// ----------------------
export async function toggleArtworkLike(token: string, artworkId: string) {
  if (!token) throw new Error("인증 토큰이 없습니다.");
  if (!artworkId) throw new Error("artworkId가 없습니다.");

  console.log("📤 [작품 좋아요 요청]", artworkId);

  const res = await fetch(`${BASE_URL}/api/v1/member/like/artwork/${artworkId}`, {
    method: "PUT",
    headers: makeHeaders(token),
  });

  return await handleResponse(res, "Artwork like toggle");
}

// ----------------------
// 👤 작가 팔로우 토글
// ----------------------
export async function toggleArtistFollow(token: string, artistId: string) {
  if (!token) throw new Error("인증 토큰이 없습니다.");
  if (!artistId) throw new Error("artistId가 없습니다.");

  console.log("📤 [작가 팔로우 요청]", artistId);

  const res = await fetch(`${BASE_URL}/api/v1/member/follow/artist/${artistId}`, {
    method: "PUT",
    headers: makeHeaders(token),
  });

  return await handleResponse(res, "Artist follow toggle");
}

// ----------------------
// 🖼️ 전시 좋아요 토글
// ----------------------
export async function toggleExhibitionLike(token: string, exhibitionId: string) {
  if (!token) throw new Error("인증 토큰이 없습니다.");
  if (!exhibitionId) throw new Error("exhibitionId가 없습니다.");

  console.log("📤 [전시 좋아요 요청]", exhibitionId);

  const res = await fetch(`${BASE_URL}/api/v1/member/like/exhibition/${exhibitionId}`, {
    method: "PUT",
    headers: makeHeaders(token),
  });

  return await handleResponse(res, "Exhibition like toggle");
}

// ----------------------
// 🧩 좋아요 / 팔로우 일괄 처리용 헬퍼 (선택적 사용)
// ----------------------
export async function toggleLikeOrFollow(
  type: "artwork" | "artist" | "exhibition",
  token: string,
  id: string
) {
  switch (type) {
    case "artwork":
      return toggleArtworkLike(token, id);
    case "artist":
      return toggleArtistFollow(token, id);
    case "exhibition":
      return toggleExhibitionLike(token, id);
    default:
      throw new Error(`Invalid toggle type: ${type}`);
  }
}
