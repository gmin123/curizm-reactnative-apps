// app/api/search.ts
const BASE_URL = "https://api.curizm.io/api/v1";

const headers = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function getRecommendedTags() {
  const res = await fetch(`${BASE_URL}/search/recommended-tags`);
  if (!res.ok) throw new Error("추천 검색어 실패");
  return res.json();
}

export async function getRecentKeywords(token?: string) {
  const res = await fetch(`${BASE_URL}/search/recent-keywords`, {
    headers: headers(token),
  });
  if (!res.ok) throw new Error("최근 검색어 실패");
  return res.json();
}

export async function saveRecentKeyword(keyword: string, token?: string) {
  const res = await fetch(`${BASE_URL}/search/recent-keywords`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ keyword }),
  });
  if (!res.ok) throw new Error("검색어 저장 실패");
  return res.json();
}

export async function searchAll(keyword: string, token?: string) {
  const res = await fetch(
    `${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error("검색 실패");
  return res.json();
}

export async function searchArtists(keyword: string, page = 1, token?: string) {
  const res = await fetch(
    `${BASE_URL}/search/artists?keyword=${encodeURIComponent(keyword)}&page=${page}`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error("작가 검색 실패");
  return res.json();
}

export async function searchArtworks(keyword: string, page = 1, token?: string) {
  const res = await fetch(
    `${BASE_URL}/search/artworks?keyword=${encodeURIComponent(keyword)}&page=${page}`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error("작품 검색 실패");
  return res.json();
}

export async function searchExhibitions(keyword: string, page = 1, token?: string) {
  const res = await fetch(
    `${BASE_URL}/search/exhibitions?keyword=${encodeURIComponent(keyword)}&page=${page}`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error("전시 검색 실패");
  return res.json();
}
