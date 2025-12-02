export const getExhibitionBanner = async () => {
  const res = await fetch("https://api.curizm.io/api/v1/home/exhibitions/banner", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("배너 데이터 가져오기 실패");
  }

  // ✅ 응답을 먼저 파싱
  const data = await res.json();

  // ✅ 실제 데이터를 콘솔에 출력


  return data; // 배열로 리턴됨
};
