// app/api/homeArtists.ts

export interface Artwork {
  id: string;
  thumbnail: string;
  name: string;
  artistName: string;
  likes: number;
  thoughts: boolean;
}

export interface Artist {
  id: string;
  name: string;
  profileImg: string;
  follow: boolean;
  artworks: Artwork[];
}

export const getRecommendedArtists = async (): Promise<Artist[]> => {
  try {
    const res = await fetch("https://api.curizm.io/api/v1/home/artists", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`작가 추천 데이터를 불러오는 데 실패했습니다. 상태코드: ${res.status}`);
    }

    const data = await res.json();
    console.log("추천 작가 데이터:", data); // ✅ 정상 로딩 확인 로그

    return data as Artist[];
  } catch (error) {
    console.error("🔥 작가 추천 API 호출 오류:", error);
    return [];
  }
};
