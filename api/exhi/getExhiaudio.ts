
export const getExhibitionArtworks = async (exhibitionId: string) => {
    const url = `https://api.curizm.io/api/v1/exhibition/artworks/${exhibitionId}?page=1`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("작품 목록 불러오기 실패");
    const data = await res.json();
    return data.artworks; // 배열 반환!
  };
  