// app/api/onlinedocent.ts
export const getRecentExhibitions = async () => {
  const url = `https://api.curizm.io/api/v1/home/all/exhibitions`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("❌ 전시 데이터를 불러오지 못했습니다.");

    const json = await res.json();
    const exhibitions = Array.isArray(json.exhibitions) ? json.exhibitions : [];

    // ✅ 필요한 필드 매핑
    const top10 = exhibitions.slice(0, 10).map((ex: any) => ({
      id: ex.id ?? "",
      title: ex.title ?? "제목 없음",
      organizer: ex.organizer ?? "주최 미정",
      coverImage: ex.coverImage ?? "",
      priceCoins: ex.priceCoins ?? 0,
      likesCount: ex.likesCount ?? ex.likes ?? 0,
      memberLike: ex.memberLike ?? false,
    }));

    return top10;
  } catch (error) {
    console.error("🔥 API 에러:", error);
    return [];
  }
};
