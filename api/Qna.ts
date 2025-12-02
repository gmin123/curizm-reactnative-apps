// src/api/Qna.ts

const API_BASE_URL = "https://api.curizm.io/api/v1/exhibition";

export async function getExhibitionChatHistory(
  exhibitionId: string,
  artworkId?: string,
  token?: string
): Promise<{
  chats: {
    id: string;
    subjectId: string;
    thumbnail: string;
    title: string;
    organizerOrCreator: string;
    question: string;
    answer: string;
    isPublic: boolean;
    createdAt: string;
  }[];
  messagesLeft: number;
}> {
  try {
    let url = `${API_BASE_URL}/chat/${exhibitionId}`;
    if (artworkId) {
      url += `?artworkId=${encodeURIComponent(artworkId)}`;
    }

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getExhibitionChatHistory fetch error:", error);
    throw error;
  }
}
