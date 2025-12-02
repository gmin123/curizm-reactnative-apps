import { apiGetLikedArtworks, apiToggleLikeArtwork } from "../../api/like";
import { useAuth } from "../context/AuthContext";

import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useArtworkLike(artworkId?: string) {
  const { user } = useAuth();
  const token = user?.token;
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  // 초기 상태 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!artworkId || !token) { setLiked(false); return; }
      try {
        const res = await apiGetLikedArtworks(token);
        const ids: string[] = (res?.likedArtworks ?? []).map((x: any) => String(x.id));
        if (alive) setLiked(ids.includes(String(artworkId)));
      } catch { /* 무시 */ }
    })();
    return () => { alive = false; };
  }, [artworkId, token]);

  const toggle = async () => {
    if (!artworkId) return;                 // 전시설명 등 작품없음
    if (!token) { Alert.alert("로그인이 필요해요"); return; }
    if (busy) return;

    setBusy(true);
    const optimistic = !liked;
    setLiked(optimistic);                    // 낙관적 갱신
    try {
      await apiToggleLikeArtwork(token, String(artworkId));
    } catch {
      setLiked(!optimistic);                 // 롤백
      Alert.alert("오류", "좋아요 처리에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return { liked, busy, toggle };
}
