// app/(MyStroage)/setting/ViewHistory.tsx
import { useAuth } from "../../context/AuthContext";

import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* =========================
   설정 & 타입
========================= */
const API_BASE = "https://api.curizm.io";

/** 감상 기록(작품/전시) */
const EP_WATCHED_ART = `${API_BASE}/api/v1/member/artworks/watched`;
const EP_WATCHED_EXHI = `${API_BASE}/api/v1/member/exhibitions/watched`;

/** 좋아요 토글(필요 시 서버에 맞게 수정) */
const EP_LIKE_ART_BASE = `${API_BASE}/api/v1/member/like/artwork`;      // + /:id
const EP_LIKE_EXHI_BASE = `${API_BASE}/api/v1/member/like/exhibition`;  // + /:id

type TabKey = "art" | "exhi";

type HistoryItem = {
  id: string;
  title: string;
  sub?: string;         // 작가명 / 전시장소 등
  thumb?: string;
  liked?: boolean;
};

type HistoryRes = {
  items: HistoryItem[];
  page: number;   // 1-based
  total: number;
};

/* =========================
   유틸
========================= */
async function authedGetJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} :: ${text.slice(0, 180)}`);
  try { return JSON.parse(text); } catch { return {}; }
}

function normArtHistory(raw: any): HistoryRes {
  // 스웨거 예시: { artworks: [], total: 10 }
  const list: any[] =
    raw?.artworks ?? raw?.items ?? raw?.content ?? raw?.data ?? [];
  const items: HistoryItem[] = list.map((it) => ({
    id: String(it?.id ?? it?.artworkId ?? it?.workId ?? Math.random()),
    title:
      it?.title ?? it?.artworkTitle ?? it?.name ?? "작품 제목",
    sub: it?.artistName ?? it?.artist ?? it?.author ?? "",
    thumb: it?.thumbnail ?? it?.imageUrl ?? it?.poster ?? it?.coverImage ?? "",
    liked: !!(it?.liked ?? it?.isLiked ?? it?.memberLike),
  }));
  const total = Number(raw?.total ?? raw?.totalCount ?? items.length) || items.length;
  // watched API는 page 파라미터만 받고 size 고정일 수도 있으니 1-based로 표기
  const page = Number(raw?.page ?? 1) || 1;
  return { items, page, total };
}

function normExhiHistory(raw: any): HistoryRes {
  // 스웨거 예시: { exhibitions: [], total: 5 }
  const list: any[] =
    raw?.exhibitions ?? raw?.items ?? raw?.content ?? raw?.data ?? [];
  const items: HistoryItem[] = list.map((it) => ({
    id: String(it?.id ?? it?.exhibitionId ?? Math.random()),
    title: it?.title ?? it?.name ?? it?.exhibitionTitle ?? "전시 제목",
    sub: it?.place ?? it?.venue ?? it?.location ?? "",
    thumb: it?.thumbnail ?? it?.imageUrl ?? it?.poster ?? it?.coverImage ?? "",
    liked: !!(it?.liked ?? it?.isLiked ?? it?.memberLike),
  }));
  const total = Number(raw?.total ?? raw?.totalCount ?? items.length) || items.length;
  const page = Number(raw?.page ?? 1) || 1;
  return { items, page, total };
}

/* =========================
   API 호출
========================= */
async function getWatchedArt(token: string, page1Based: number) {
  const url = `${EP_WATCHED_ART}?page=${page1Based}`;
  const raw = await authedGetJson(url, token);
  return normArtHistory(raw);
}
async function getWatchedExhi(token: string, page1Based: number) {
  const url = `${EP_WATCHED_EXHI}?page=${page1Based}`;
  const raw = await authedGetJson(url, token);
  return normExhiHistory(raw);
}

async function putToggleLike(
  token: string,
  kind: TabKey,
  id: string,
  next: boolean
) {
  const base = kind === "art" ? EP_LIKE_ART_BASE : EP_LIKE_EXHI_BASE;
  const url = `${base}/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ like: next }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} :: ${t.slice(0, 160)}`);
  }
}

/* =========================
   컴포넌트
========================= */
export default function ViewHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [tab, setTab] = useState<TabKey>("art");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);            // 1-based
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pending = useRef<Set<string>>(new Set());

  const load = useCallback(
    async (p: number, replace: boolean) => {
      if (!token) return;
      if (p === 1) setLoading(true);
      try {
        const res =
          tab === "art" ? await getWatchedArt(token, p) : await getWatchedExhi(token, p);
        setTotal(res.total);
        setPage(p);
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
      } catch (e) {
        console.warn("[ViewHistory] load error:", e);
        if (p === 1) Alert.alert("오류", "감상 기록을 불러오지 못했어요.");
      } finally {
        if (p === 1) setLoading(false);
      }
    },
    [token, tab]
  );

  // 최초 & 탭 변경 시
  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotal(0);
    load(1, true);
  }, [tab, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await load(1, true); } finally { setRefreshing(false); }
  };

  const onEndReached = async () => {
    if (loading || loadingMore) return;
    if (items.length >= total) return; // 더 없음
    setLoadingMore(true);
    try { await load(page + 1, false); } finally { setLoadingMore(false); }
  };

  // 좋아요 토글
  const toggleLike = async (item: HistoryItem) => {
    if (!token) {
      Alert.alert("로그인이 필요합니다", "좋아요 기능은 로그인 후 이용할 수 있어요.");
      return;
    }
    if (pending.current.has(item.id)) return;

    const idx = items.findIndex((x) => x.id === item.id);
    if (idx < 0) return;

    const next = !items[idx].liked;
    const copy = [...items];
    copy[idx] = { ...copy[idx], liked: next };
    setItems(copy);

    pending.current.add(item.id);
    try {
      await putToggleLike(token, tab, item.id, next);
    } catch (e) {
      // 롤백
      copy[idx] = { ...copy[idx], liked: !next };
      setItems(copy);
      console.warn("[ViewHistory] like toggle fail:", e);
    } finally {
      pending.current.delete(item.id);
    }
  };

  // 아이템 클릭 → 네비게이션
  const onPressItem = (item: HistoryItem) => {
    if (tab === "art") {
      router.push({
        pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
        params: {
          artworkId: item.id,
          autoplay: "1",
        },
      });
    } else {
      router.push({
        pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiPage",
        params: { exhibitionId: item.id },
      });
    }
  };

  const Header = useMemo(
    () => (
      <>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={S.back}>←</Text>
          </TouchableOpacity>
          <Text style={S.headerTitle}>감상 기록</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={S.tabs}>
          {([
            { key: "art", label: "작품" },
            { key: "exhi", label: "전시" },
          ] as { key: TabKey; label: string }[]).map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={S.tabBtn}
              >
                <Text style={[S.tabTxt, active && S.tabTxtActive]}>{t.label}</Text>
                {active && <View style={S.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={S.countRow}>
          <Text style={S.countTxt}>
            총 {total.toLocaleString()} {tab === "art" ? "작품" : "전시"}
          </Text>
        </View>
      </>
    ),
    [router, tab, total]
  );

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={S.row}
      activeOpacity={0.85}
      onPress={() => onPressItem(item)}
    >
      <Image source={{ uri: item.thumb }} style={S.thumb} />
      <View style={S.rowCenter}>
        <Text style={S.title} numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.sub && (
          <Text style={S.sub} numberOfLines={1}>
            {item.sub}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => toggleLike(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[S.heart, item.liked ? S.heartOn : S.heartOff]}>
          {item.liked ? "❤" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {Header}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={S.sep} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

/* =========================
   스타일
========================= */
const THUMB = 48;

const S = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  back: { fontSize: 18, color: "#111" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111" },

  tabs: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eaeaea",
  },
  tabBtn: { paddingVertical: 12, marginRight: 18 },
  tabTxt: { fontSize: 15, color: "#6B7280", fontWeight: "700" },
  tabTxtActive: { color: "#111" },
  tabUnderline: {
    height: 2,
    marginTop: 8,
    backgroundColor: "#111",
    borderRadius: 2,
  },

  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  countTxt: { fontSize: 12, color: "#6B7280" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 6,
    backgroundColor: "#eee",
    marginRight: 12,
  },
  rowCenter: { flex: 1 },
  title: { fontSize: 14, fontWeight: "800", color: "#111" },
  sub: { marginTop: 2, fontSize: 12, color: "#6B7280" },

  heart: { fontSize: 18 },
  heartOn: { color: "#ff5b55" },
  heartOff: { color: "#c7c7c7" },

  sep: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee" },
});


