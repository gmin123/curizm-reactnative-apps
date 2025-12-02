// src/hooks/useLikeFollow.ts
import { toggleArtworkLike } from "../../api/like";
import { useAuth } from "../context/AuthContext";

export function useLikeFollow() {
  const { user } = useAuth();
  const token = user?.token ?? "";

  const toggleLikeArtwork = async (artworkId: string, currentLiked: boolean) => {
    if (!token) return { success: false };
    const res = await toggleArtworkLike(token, artworkId);
    return { success: true, liked: !currentLiked };
  };

  const getLikedArtworks = async () => {
    // TODO: 좋아요 목록 가져오는 API 연결 시 작성
    return [];
  };

  return { toggleLikeArtwork, getLikedArtworks, loading: false };
}
