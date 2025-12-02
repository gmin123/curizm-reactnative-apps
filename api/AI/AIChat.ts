// 파일: api/AI/AIChat.ts

export async function askExhibitionQuestion(
  exhibitionId: string,
  question: string,
  token?: string
) {
  try {
    const url = `https://api.curizm.io/api/v1/exhibition/chat/${exhibitionId}`;
    const headers: Record<string, string> = { 
      "Content-Type": "application/json" 
    };
    
    // ✅ 토큰이 있으면 헤더에 추가
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const body = JSON.stringify({ question });

    // [디버깅] 요청 정보 콘솔 출력!
    console.log("[askExhibitionQuestion] 요청 URL:", url);
    console.log("[askExhibitionQuestion] headers:", headers);
    console.log("[askExhibitionQuestion] body:", body);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    
    // ✅ 에러 응답 처리 개선
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[askExhibitionQuestion] API 에러 응답:", res.status, errorText);
      throw new Error(`질문 API 호출 실패: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("[askExhibitionQuestion] response:", data);
    return data;
  } catch (e) {
    console.error("AI 질문 API 오류:", e);
    throw e;
  }
}

export async function getExhibitionChatHistory({
  exhibitionId,
  artworkId,
}: { exhibitionId: string; artworkId?: string }) {
  try {
    const url = `https://api.curizm.io/api/v1/exhibition/chat/${exhibitionId}`
      + (artworkId ? `?artworkId=${artworkId}` : "");
    const res = await fetch(url);
    if (!res.ok) throw new Error("이전 대화 이력 조회 실패");
    const data = await res.json();
    console.log("[getExhibitionChatHistory] response:", data); // ✅ 추가
    return data; // { chats, messagesLeft }
  } catch (e) {
    console.error("AI 대화 이력 오류:", e);
    return { chats: [], messagesLeft: 0 };
  }
}
