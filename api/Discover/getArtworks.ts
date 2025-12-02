// 파일: api/Discover/getArtworks.ts

export type HomeArtwork = {
  id: string;
  thumbnail: string;
  name: string;
  artistName: string;
  sound?: string;
  year?: string;
  durationTime?: number;
  memberLike?: boolean;
  numberOfLikes?: number;
  numberOfChats?: number;
  groupOrder?: number;
  groupName?: string;
  subtitlesUrl?: string;
};

// 서버 응답: { allArtworks: HomeArtwork[], total: number }
export async function getAllArtworks(page = 1, sortBy: string = "name") {
  const url = `https://api.curizm.io/api/v1/home/all/artworks?page=${page}&sortBy=${encodeURIComponent(sortBy)}`;

  console.log("[getAllArtworks] GET", url);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    console.log("[getAllArtworks] !ok", res.status, text);
    throw new Error(`all artworks api failed (${res.status})`);
  }

  const data = await res.json();
  console.log("[getAllArtworks] raw response:", data);

  // ✅ 서버 포맷에 정확히 맞춰 파싱
  const items: HomeArtwork[] =
    data?.allArtworks ?? data?.data ?? data?.items ?? [];
  const total: number = data?.total ?? items.length;

  return { items, total, page };
}
