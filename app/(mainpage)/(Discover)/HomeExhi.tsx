import { listExhibitions } from "@/api/Discover/getExhi";
import * as LikeAPI from "@/api/like";
import { useAuth } from "@/app/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type TabKey = "all" | "paid" | "free";
type SortKey = "latest" | "oldest" | "nameAsc" | "nameDesc" | "popular";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "전체 전시" },
  { key: "paid", label: "유료 전시" },
  { key: "free", label: "무료 전시" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신 등록순" },
  { key: "oldest", label: "오래된 순" },
  { key: "nameAsc", label: "이름순 (가 → Z)" },
  { key: "nameDesc", label: "이름역순 (Z → 가)" },
  { key: "popular", label: "인기순 (좋아요 많은 순)" },
];

const cat = (c: string) => {
  if (!c) return 0;
  const code = c.charCodeAt(0);
  if (c >= "0" && c <= "9") return 1;
  if (
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0x3131 && code <= 0x318e) ||
    (code >= 0x1100 && code <= 0x11ff)
  )
    return 2;
  if (c >= "A" && c <= "Z") return 3;
  if (c >= "a" && c <= "z") return 4;
  return 0;
};

const cmpNameAsc = (a: string, b: string) => {
  const A = (a ?? "").trim();
  const B = (b ?? "").trim();
  const ca = cat(A[0]);
  const cb = cat(B[0]);
  if (ca !== cb) return ca - cb;
  return A.localeCompare(B, "ko-KR", { numeric: true, sensitivity: "base" });
};
const cmpNameDesc = (a: string, b: string) => -cmpNameAsc(a, b);
const toTs = (it: any) => {
  const s = it.createdAt ?? it.startDate;
  const t = s ? Date.parse(s) : NaN;
  return Number.isNaN(t) ? 0 : t;
};
const likeCount = (it: any) =>
  (it.likes ?? it.likesCount ?? it.numberOfLikes ?? 0) as number;

export default function HomeExhi() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [tab, setTab] = useState<TabKey>("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [sortOpen, setSortOpen] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const likeBusy = useRef<Record<string, boolean>>({});

  // 데이터 로드
  const resetAndLoad = useCallback(async (nextTab: TabKey) => {
    setLoading(true);
    setPage(1);
    setItems([]);
    try {
      const { items: list, total } = await listExhibitions({
        type: nextTab === "all" ? "ALL" : nextTab === "paid" ? "PAID" : "FREE",
        page: 1,
      });
      setItems(list ?? []);
      setTotal(total ?? 0);
    } catch {
      Alert.alert("오류", "전시 목록을 불러오지 못했어요.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resetAndLoad(tab);
  }, [tab, resetAndLoad]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || (total != null && items.length >= total)) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { items: list } = await listExhibitions({
        type: tab === "all" ? "ALL" : tab === "paid" ? "PAID" : "FREE",
        page: nextPage,
      });
      if (!list?.length) return;
      setItems((prev) => [...prev, ...list]);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [items.length, loading, loadingMore, page, tab, total]);

  // 정렬 적용
  const sorted = useMemo(() => {
    const arr = [...(items ?? [])];
    if (sort === "latest") arr.sort((a, b) => toTs(b) - toTs(a));
    else if (sort === "oldest") arr.sort((a, b) => toTs(a) - toTs(b));
    else if (sort === "nameAsc") arr.sort((a, b) => cmpNameAsc(a.title, b.title));
    else if (sort === "nameDesc") arr.sort((a, b) => cmpNameDesc(a.title, b.title));
    else
      arr.sort((a, b) => {
        const la = likeCount(a);
        const lb = likeCount(b);
        if (lb !== la) return lb - la;
        return cmpNameAsc(a.title, b.title);
      });
    return arr;
  }, [items, sort]);

  // 좋아요 토글
  const toggleLike = async (row: any) => {
    if (!token) {
      Alert.alert("로그인이 필요합니다", "좋아요는 로그인 후 사용할 수 있어요.");
      return;
    }
    if (likeBusy.current[row.id]) return;
    likeBusy.current[row.id] = true;
    const optimistic = !row.memberLike;
    setItems((list) =>
      list.map((x) =>
        x.id === row.id
          ? {
              ...x,
              memberLike: optimistic,
              likesCount: Math.max(0, (x.likesCount ?? 0) + (optimistic ? 1 : -1)),
            }
          : x
      )
    );

    try {
      const fn =
        LikeAPI.toggleExhibitionLike ||
        LikeAPI.apiToggleLikeExhibition ||
        LikeAPI.setExhibitionLike;
      if (!fn) throw new Error("toggle like API not found");
      await fn(token, String(row.id), optimistic);
    } catch {
      Alert.alert("실패", "좋아요 처리에 실패했어요.");
    } finally {
      likeBusy.current[row.id] = false;
    }
  };

  const goDetail = (row: any) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
      params: {
        id: String(row.id),
        title: row.title,
        coverImage: row.coverImage,
        organizer: row.organizer ?? "",
        priceCoins: row.priceCoins ?? 0,
      },
    });
  };

  const Row = ({ item }: { item: any }) => (
    <TouchableOpacity style={S.row} activeOpacity={0.8} onPress={() => goDetail(item)}>
      <Image source={{ uri: item.coverImage }} style={S.thumb} />
      <View style={S.textBox}>
        <Text numberOfLines={1} style={S.title}>
          {item.title ?? "전시 제목"}
        </Text>
        <Text style={S.location}>{item.organizer ?? "전시 장소"}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleLike(item)} hitSlop={10}>
        <Ionicons
          name={item.memberLike ? "heart" : "heart-outline"}
          size={20}
          color={item.memberLike ? "#FF6A3D" : "#D1D5DB"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={S.container}>
      {/* 헤더 */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>전시</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* 상단 정보 */}
      <View style={S.subHeader}>
        <Text style={S.countText}>총 {sorted?.length ?? 0}건 전시</Text>
        <Text style={S.dot}> · </Text>
        <TouchableOpacity style={S.sortBtn} onPress={() => setSortOpen(true)}>
          <Text style={S.sortText}>
            {SORT_OPTIONS.find((s) => s.key === sort)?.label ?? "정렬"}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={S.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[S.tabBtn, tab === t.key && S.tabActive]}
          >
            <Text style={tab === t.key ? S.tabActiveText : S.tabText}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 리스트 */}
      {loading ? (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={sorted ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <Row item={item} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}

      {/* 정렬 드롭다운 */}
      <Modal transparent visible={sortOpen} animationType="fade">
        <Pressable style={S.dim} onPress={() => setSortOpen(false)} />
        <View style={S.dropdown}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[S.ddItem, sort === opt.key && S.ddActive]}
              onPress={() => {
                setSort(opt.key);
                setSortOpen(false);
              }}
            >
              <Text style={[S.ddText, sort === opt.key && S.ddTextActive]}>
                {opt.label}
              </Text>
              {sort === opt.key && (
                <Ionicons name="checkmark" size={18} color="#FF6A3D" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#111" },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  countText: { fontSize: 13, color: "#6B7280" },
  dot: { fontSize: 13, color: "#6B7280", marginHorizontal: 4 },
  sortBtn: { flexDirection: "row", alignItems: "center" },
  sortText: { fontSize: 13, color: "#6B7280" },

  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F2F4F7",
  },
  tabActive: { backgroundColor: "#FF6A3D" },
  tabText: { color: "#111", fontWeight: "800", fontSize: 12 },
  tabActiveText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  thumb: { width: 54, height: 54, borderRadius: 8, backgroundColor: "#EEE" },
  textBox: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: "800", color: "#111" },
  location: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  // 드롭다운
  dim: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.1)" },
  dropdown: {
    position: "absolute",
    right: 16,
    top: 88,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    width: 240,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ddItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ddActive: { backgroundColor: "#FFF5F2" },
  ddText: { fontSize: 14, color: "#111" },
  ddTextActive: { color: "#FF6A3D", fontWeight: "800" },
});
