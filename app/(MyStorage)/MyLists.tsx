// app/(account)/MyLists.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
// 별칭이 문제면 상대경로로 교체: "../../api/like"
import {
    apiGetFollowedArtists,
    apiGetLikedArtworks,
    apiGetLikedExhibitions,
    apiGetPurchases,
    apiToggleFollowArtist,
    apiToggleLikeArtwork,
    apiToggleLikeExhibition,
    type FollowedArtist,
    type LikedArtwork,
    type LikedExhibition,
    type PurchaseItem,
} from "../../api/like";
import * as SecureStore from "expo-secure-store";
import { styles as s } from "./mylist.style"; // 네가 준 StyleSheet

type Tab = "artworks" | "artists" | "exhibitions" | "purchases";

const toStr = (v: any) => (typeof v === "string" ? v : v == null ? "" : String(v));
const fmtDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${dd}`;
};

export default function MyLists() {
  const listRef = useRef<FlatList<any>>(null);

  const [token, setToken] = useState<string>("");
  const [tab, setTab] = useState<Tab>("artworks");

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 토큰 로드
  useEffect(() => {
    (async () => {
      const t = (await SecureStore.getItemAsync("access_token")) ?? "";
      setToken(t);
    })();
  }, []);

  const scrollTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    setTotal(0);
  }, []);

  // 데이터 로더
  const fetchPage = useCallback(
    async (which: Tab, p: number) => {
      if (!token) return { list: [], total: 0, hasMore: false };
      if (which === "artworks") {
        const res = await apiGetLikedArtworks(token, p);
        const list = res.likedArtworks ?? [];
        return { list, total: res.total ?? list.length, hasMore: list.length > 0 && (p * list.length) < (res.total ?? 0) };
      }
      if (which === "artists") {
        const res = await apiGetFollowedArtists(token, p);
        const list = res.likedArtists ?? [];
        return { list, total: res.total ?? list.length, hasMore: list.length > 0 && (p * list.length) < (res.total ?? 0) };
      }
      if (which === "exhibitions") {
        const res = await apiGetLikedExhibitions(token, p);
        const list = res.likedExhibitions ?? [];
        return { list, total: res.total ?? list.length, hasMore: list.length > 0 && (p * list.length) < (res.total ?? 0) };
      }
      // purchases
      const res = await apiGetPurchases(token, p);
      const list = res.purchases ?? [];
      return { list, total: res.total ?? list.length, hasMore: list.length > 0 && (p * list.length) < (res.total ?? 0) };
    },
    [token]
  );

  // 탭/토큰 변경 시 1페이지 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { list, total, hasMore } = await fetchPage(tab, 1);
        if (!alive) return;
        setItems(list);
        setTotal(total);
        setPage(1);
        setHasMore(hasMore);
        scrollTop();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tab, token, fetchPage, scrollTop]);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (!token || loading || !hasMore) return;
    const next = page + 1;
    setLoading(true);
    try {
      const { list, hasMore: hm } = await fetchPage(tab, next);
      setItems((prev) => [...prev, ...list]);
      setPage(next);
      setHasMore(hm);
    } finally {
      setLoading(false);
    }
  }, [token, loading, hasMore, page, fetchPage, tab]);

  // 새로고침
  const onRefresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const { list, total, hasMore } = await fetchPage(tab, 1);
      setItems(list);
      setTotal(total);
      setPage(1);
      setHasMore(hasMore);
    } finally {
      setRefreshing(false);
    }
  }, [token, tab, fetchPage]);

  // 좋아요/팔로우 토글
  const onToggleLikeArtwork = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const r = await apiToggleLikeArtwork(token, id);
      const liked = !!r.liked;
      setItems((prev) =>
        prev.map((it: LikedArtwork) => (toStr(it.id) === id ? { ...it, memberLike: liked } : it))
      );
    } catch {}
  }, [token]);

  const onToggleFollowArtist = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const r = await apiToggleFollowArtist(token, id);
      const followed = !!r.followed;
      setItems((prev) =>
        prev.map((it: FollowedArtist) => (toStr(it.id) === id ? { ...it, memberFollow: followed } : it))
      );
    } catch {}
  }, [token]);

  const onToggleLikeExhibition = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const r = await apiToggleLikeExhibition(token, id);
      const liked = !!r.liked;
      setItems((prev) =>
        prev.map((it: LikedExhibition) => (toStr(it.id) === id ? { ...it, memberLike: liked } : it))
      );
    } catch {}
  }, [token]);

  // 탭 렌더
  const Tabs = useMemo(() => {
    const entries: { key: Tab; label: string }[] = [
      { key: "artworks", label: "작품" },
      { key: "artists", label: "작가" },
      { key: "exhibitions", label: "전시" },
      { key: "purchases", label: "구매" },
    ];
    return (
      <View style={s.tabs}>
        {entries.map(({ key, label }) => {
          const active = tab === key;
          return (
            <TouchableOpacity key={key} style={s.tabBtn} onPress={() => { setTab(key); reset(); }}>
              <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
              {active && <View style={s.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [tab, reset]);

  // 아이템 렌더러
  const renderItem = ({ item }: { item: any }) => {
    if (tab === "artworks") {
      const it = item as LikedArtwork;
      return (
        <View style={s.row}>
          <Image source={{ uri: it.thumbnail ?? "" }} style={s.rowThumbLg} />
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>{it.name}</Text>
            <Text style={s.rowSub}>{it.artistName ?? ""}</Text>
            {!!it.durationTime && <Text style={s.rowMeta}>{`${it.durationTime}s`}</Text>}
          </View>
          <TouchableOpacity onPress={() => onToggleLikeArtwork(toStr(it.id))}>
            <Text style={[s.heart, it.memberLike && { color: "#FF6A3D" }]}>♥</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (tab === "artists") {
      const it = item as FollowedArtist;
      return (
        <View style={s.artistCard}>
          <View style={s.artistHead}>
            <Image source={{ uri: it.profileImg ?? "" }} style={s.artistAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={s.artistName}>{it.name}</Text>
              {!!it.numberOfArtworks && (
                <Text style={s.artistBadge}>작품 {it.numberOfArtworks}점</Text>
              )}
            </View>
            <TouchableOpacity
              style={[s.followBtn, it.memberFollow && s.following]}
              onPress={() => onToggleFollowArtist(toStr(it.id))}
            >
              <Text style={s.followTxt}>{it.memberFollow ? "팔로잉" : "팔로우"}</Text>
            </TouchableOpacity>
          </View>
          {/* 미리보기 썸네일 3개 등을 보여주고 싶으면 s.previewRow 사용 */}
        </View>
      );
    }
    if (tab === "exhibitions") {
      const it = item as LikedExhibition;
      return (
        <View style={s.exRow}>
          <Image source={{ uri: it.coverImage ?? "" }} style={s.exThumb} />
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>{it.title}</Text>
            {!!it.organizer && <Text style={s.rowSub}>{it.organizer}</Text>}
          </View>
          <TouchableOpacity onPress={() => onToggleLikeExhibition(toStr(it.id))}>
            <Text style={[s.heart, it.memberLike && { color: "#FF6A3D" }]}>♥</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // purchases
    const it = item as PurchaseItem;
    return (
      <View style={s.purchaseRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: it.coverImage ?? "" }} style={s.exThumb} />
          <View style={{ marginLeft: 8 }}>
            <Text style={s.rowTitle}>{it.title}</Text>
            <Text style={s.rowSub}>{fmtDate(it.createdAt)}</Text>
          </View>
        </View>
        <Text style={s.amount}>{it.amountCoins != null ? `${it.amountCoins} 코인` : ""}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {Tabs}
      <View style={s.countBar}>
        <Text style={s.countText}>
          총 {total}개
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(it, idx) => toStr(it?.id ?? `k-${idx}`)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
