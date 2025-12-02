// api/exhibitions.ts
export interface Exhibition {
    id: string;
    title: string;
    source: string;
    organizer: string | { location?: string };
    coverImage: string;
    startDate: string;
    endDate: string;
    priceCoins: number;
    link?: string;
  }
  
  /**
   * location: "서울", "경기, 인천" 등
   * month: 1~12 숫자
   */
  export const getFilteredExhibitions = async (
    location: string,
    month: number
  ): Promise<Exhibition[][]> => {
    try {
      const query = `?location=${encodeURIComponent(location)}&month=${month}`;
      const res = await fetch(`https://api.curizm.io/api/v1/home/exhibitions/list${query}`);
  
      if (!res.ok) {
        throw new Error(`API 요청 실패: ${res.status}`);
      }
  
      const data: Exhibition[][] = await res.json();
      return data;
    } catch (error) {
      console.error("전시 데이터 불러오기 실패:", error);
      throw error;
    }
  };
  