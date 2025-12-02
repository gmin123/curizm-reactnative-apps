// api/exhi/getExhibitionPlayer.ts
const BASE_URL = "https://api.curizm.io";

export async function getExhibitionPlayer(
  exhibitionId: string,
  artworkId: string
) {
  const url = `${BASE_URL}/api/v1/exhibition/player?exhibitionId=${encodeURIComponent(
    exhibitionId
  )}&artworkId=${encodeURIComponent(artworkId)}&type=artwork`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load player: ${res.status}`);
  }

  const data = await res.json();
  // 안전하게 기본 구조 확인
  return {
    sound: data.sound,
    subtitles: data.subtitles,
    tts: data.ttsVoices?.[0] ?? null,
  };
}
