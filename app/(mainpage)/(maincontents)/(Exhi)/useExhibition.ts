import { getExhibitionArtworks } from "../../../../api/exhi/getExhibitionArtworks";
import { getExhibitionArtists } from "../../../../api/exhi/getExhibitionArtists";
import { getExhibitionDetailData } from "../../../../api/exhi/getExhibitionDetail";
import { apiToggleLikeExhibition } from "../../../../api/like";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// 문자열 정규화: 앞/뒤 슬래시 제거 + 디코딩 + 다시 인코딩 없이 원본 유지
function normalizeId(raw: string) {
  if (!raw) return "";
  // 1) 앞/뒤 슬래시 제거
  let s = raw.replace(/^\/+|\/+$/g, "");
  // 2) 이미 인코딩된 흔적(%XX)이 있으면 그대로 두고, 없으면 decode 시도
  try {
    if (!/%[0-9A-Fa-f]{2}/.test(s)) {
      s = decodeURIComponent(s);
    }
  } catch {}
  return s;
}

// JSON 문자열 비교로 setState 최소화
function stableSet<T>(set: (v: T) => void, prevRef: React.MutableRefObject<string>, next: T) {
  const nextStr = JSON.stringify(next ?? null);
  if (prevRef.current === nextStr) return;
  prevRef.current = nextStr;
  set(next);
}

export function useExhibition(exhibitionId: string, token?: string) {
  type TabKey = "docent" | "artist" | "community";
  const [tab, setTab] = useState<TabKey>("docent");
  const BASE = "https://api.curizm.io";

  const [detail, _setDetail] = useState<any>(null);
  const [artists, _setArtists] = useState<any[]>([]);
  const [artworks, _setArtworks] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [artworksLoading, setArtworksLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [descVisible, setDescVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [showPip, setShowPip] = useState(false);

  // 이전값 보관(중복 setState 방지)
  const prevDetailStr = useRef<string>("");
  const prevArtistsStr = useRef<string>("");
  const prevArtworksStr = useRef<string>("");

  // 동일 id 재요청 방지 + 개발모드 이펙트 2회 방지
  const fetchedIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const normId = normalizeId(String(exhibitionId || ""));
    if (!normId) {
      setLoading(false);
      setArtworksLoading(false);
      return;
    }
    // 이미 이 id로 데이터를 채워두었으면, 절대 재요청하지 않음
    if (fetchedIdRef.current === normId) {
      setLoading(false);
      setArtworksLoading(false);
      return;
    }

    fetchedIdRef.current = normId;

    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    (async () => {
      try {
        setLoading(true);
        setArtworksLoading(true);
        const [d, a, w] = await Promise.all([
          getExhibitionDetail(normId),
          getExhibitionArtists(normId),
          getExhibitionArtworks(normId),
        ]);
        if (ac.signal.aborted) return;

        stableSet(_setDetail, prevDetailStr, d);
        setLiked(!!d?.memberLike);
        setLikeCount(Number(d?.likeCount ?? 0));

        stableSet(_setArtists, prevArtistsStr, Array.isArray(a) ? a : []);
        stableSet(_setArtworks, prevArtworksStr, Array.isArray(w) ? w : []);
      } catch (e) {
        if (!ac.signal.aborted) {
          console.error("[useExhibition] fetch failed:", e);
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
          setArtworksLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [exhibitionId]);

  // 좋아요 토글(낙관적)
  const onToggleLike = useCallback(async () => {
    if (!token || !fetchedIdRef.current) return;
    setLiked((p) => !p);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      await apiToggleLikeExhibition(token, fetchedIdRef.current);
    } catch (e) {
      setLiked((p) => !p);
      setLikeCount((c) => c + (liked ? 1 : -1));
      console.error("[useExhibition] toggle like failed:", e);
    }
  }, [token, liked]);

  return {
    detail,
    artists,
    artworks,
    loading,
    artworksLoading,
    liked,
    likeCount,
    tab,
    setTab,
    descVisible,
    setDescVisible,
    playerVisible,
    setPlayerVisible,
    showPip,
    setShowPip,
    onToggleLike,
  };
}