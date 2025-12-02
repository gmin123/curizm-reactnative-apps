// app/api/player.ts
const API_BASE = "https://api.curizm.io";

export type PlayerType = "exhibition" | "artwork" | "artist" | "recommended";

export type TTSVoice = {
  id: string;
  voiceType: string;          // 예: despina
  description?: string;
  audioUrl: string;           // 실제 재생 파일
  subtitlesUrl?: string;      // 선택
  duration?: number;          // 초/밀리초 서버 스펙에 따라 숫자
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PlayerResponse = {
  title: string;
  name?: string;              // 아티스트명
  artistId?: string;
  image?: string;
  thumbnail?: string;
  durationTime?: number;
  sound?: string;             // 서버가 직접 sound를 줄 수도 있음
  subtitles?: string;
  previousId?: string;
  nextId?: string;
  memberLike?: boolean;
  ttsVoices?: TTSVoice[];
  subtitlesUrl?: string;
};

export type GetPlayerParams = {
  exhibitionId?: string;      // 암호화된 ID
  artworkId?: string;         // 암호화된 ID
  artistId?: string;          // 암호화된 ID
  type?: PlayerType;          // 기본값: "exhibition"
  sessionId?: string;
  subtitlesUrl?: string;
};

export async function getExhibitionPlayer(
  params: GetPlayerParams,
  token?: string
): Promise<PlayerResponse> {
  const qs = new URLSearchParams();
  if (params.exhibitionId) qs.set("exhibitionId", params.exhibitionId);
  if (params.artworkId) qs.set("artworkId", params.artworkId);
  if (params.artistId) qs.set("artistId", params.artistId);
  if (params.type) qs.set("type", params.type);
  else qs.set("type", "exhibition");
  if (params.sessionId) qs.set("sessionId", params.sessionId);

  const url = `${API_BASE}/api/v1/exhibition/player?${qs.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`GET /exhibition/player ${res.status} ${text}`);
  }
  return text ? JSON.parse(text) as PlayerResponse : ({} as PlayerResponse);
}

/** ttsVoices 중 기본 오디오(없으면 첫 번째) 고르기 */
export function pickDefaultVoice(resp: PlayerResponse): TTSVoice | null {
  const arr = resp.ttsVoices ?? [];
  if (!arr.length) return null;
  return arr.find(v => v.isDefault) ?? arr[0];
}

/** ExhiAudioPlayer의 AudioItem 형태로 변환 */
export type AudioItemLike = {
  id?: string;
  title: string;
  artist: string;
  thumbnail?: string;
  sound?: string;
};

export function toAudioItem(resp: PlayerResponse): AudioItemLike {
  const v = pickDefaultVoice(resp);
  return {
    id: resp.previousId ? resp.previousId + "_next" : undefined, // 식별자 없으면 임시
    title: resp.title ?? "",
    artist: resp.name ?? "",
    thumbnail: resp.thumbnail || resp.image,
    sound: resp.sound || v?.audioUrl, // 서버가 sound를 주면 우선
  };
}
