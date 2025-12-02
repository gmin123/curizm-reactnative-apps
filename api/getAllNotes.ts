// api/getAllNotes.ts
export interface ChatNote {
  id: string;
  exhibitionName: string;
  artistName: string;
  question: string;
  thumbnail: string;
  nickname: string;
  createdAt: string;

  // ✅ 서버 답변
  answer?: string;
}

const COLOR_POOL = [
  "#7DB9B6", "#E36D5B", "#C7DCA7", "#F6C85F", "#A3D9FF", "#EFA7A7", "#B4A7D6",
];

const formatDate = (iso: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff === 0 ? "오늘" : `${diff}일 전`;
};

export const getAllNotes = async (): Promise<(ChatNote & { color: string })[]> => {
  try {
    const res = await fetch("https://api.curizm.io/api/v1/home/all/chats?page=1", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    return (json?.chats ?? []).map((item: any, index: number) => ({
      id: String(item.id),
      exhibitionName: item.exhibitionName ?? item.title ?? "",
      // 서버 케이스에 따라 organizerOrCreator가 작가명으로 들어오는 경우가 있어 우선 사용
      artistName: item.organizerOrCreator ?? item.artistName ?? "",
      question: item.question ?? "",
      thumbnail: item.thumbnail ?? item.image ?? "",
      nickname: item.memberName || item.nickname || "익명",
      createdAt: formatDate(item.createdAt),
      answer: item.answer ?? "", // ✅ 포함
      color: COLOR_POOL[index % COLOR_POOL.length],
    }));
  } catch (err) {
    console.error("❌ 생각노트 API 요청 실패:", err);
    return [];
  }
};
