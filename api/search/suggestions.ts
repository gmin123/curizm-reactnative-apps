// 실제 API 엔드포인트로 교체하세요.
// 예시: GET https://api.curizm.io/api/v1/search/suggestions
//      GET https://api.curizm.io/api/v1/search/trending
const BASE = "https://api.curizm.io";

export type SuggestKeyword = {
  id: string | number;
  label: string;
  // 옵션: 서버가 이미지 제공하면 썸네일 표시
  thumbnail?: string;
};

export async function fetchSuggestedKeywords(): Promise<SuggestKeyword[]> {
  const res = await fetch(`${BASE}/api/v1/search/suggestions`);
  if (!res.ok) throw new Error("추천 검색어 조회 실패");
  const json = await res.json();
  // 서버 응답 형태에 맞춰 map
  return (json.keywords ?? json.data ?? []).map((k: any, i: number) => ({
    id: k.id ?? i,
    label: k.label ?? k.keyword ?? String(k),
    thumbnail: k.thumbnail ?? k.image ?? undefined,
  }));
}

export async function fetchTrendingKeywords(): Promise<SuggestKeyword[]> {
  const res = await fetch(`${BASE}/api/v1/search/trending`);
  if (!res.ok) throw new Error("트렌드 검색어 조회 실패");
  const json = await res.json();
  return (json.keywords ?? json.data ?? []).map((k: any, i: number) => ({
    id: k.id ?? i,
    label: k.label ?? k.keyword ?? String(k),
    thumbnail: k.thumbnail ?? k.image ?? undefined,
  }));
}
