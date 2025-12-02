// api/homeArtworks.ts
export type SharedArtworkRow = {
  id: string;
  name?: string;             // ← 작품 제목
  thumbnail?: string;        // ← 작품 썸네일
  sound?: string;
  artistName?: string;       // ← 작가명
  memberLike?: boolean;
  chatId?: string;
  question?: string;
  createdAt?: string;
};

export type SharedArtworkNote = {
  id: string;
  title: string;             // ← 화면에서 사용
  artistName: string;
  imageUrl?: string;
  sound?: string;
  chatId?: string;
  question?: string;
  liked?: boolean;
  createdAt?: string;
  raw?: SharedArtworkRow;    // 디버깅용
};

function mapRow(r: SharedArtworkRow): SharedArtworkNote {
  return {
    id: String(r.id),
    title: r.name ?? "",                // ★ name → title
    artistName: r.artistName ?? "",     // ★ artistName 그대로
    imageUrl: r.thumbnail ?? "",        // ★ thumbnail → imageUrl
    sound: r.sound,
    chatId: r.chatId,
    question: r.question,
    liked: !!r.memberLike,
    createdAt: r.createdAt,
    raw: r,
  };
}

export async function getSharedArtworks(): Promise<SharedArtworkNote[]> {
  const res = await fetch("https://api.curizm.io/api/v1/home/artworks/list");
  if (!res.ok) throw new Error("home/artworks/list 요청 실패");
  const json = await res.json();
  const arr: SharedArtworkRow[] = Array.isArray(json) ? json : [];
  return arr.map(mapRow);
}
