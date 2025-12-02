// app/(mainpage)/(Discover)/HomeArtworks.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { getAllArtworks } from "../../../api/Discover/getArtworks";
import { toggleArtworkLike } from "../../../api/like";
import { useAuth } from "../../context/AuthContext";

type ArtworkRow = {
  id: string;
  thumbnail: string;
  name: string;
  artistName: string;
  createdAt?: string | number;
  followersCount?: number;
  memberLike?: boolean;
  sound?: string;
};

type SortMode = "latest" | "oldest" | "name" | "nameDesc" | "popular";

export default function HomeArtworks() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [items, setItems] = useState<ArtworkRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const didInitRef = useRef(false);
  const currentSortRef = useRef<SortMode>(sortMode);
  useEffect(() => {
    currentSortRef.current = sortMode;
  }, [sortMode]);

  const collator = useMemo(
    () => new Intl.Collator("ko-KR", { sensitivity: "case", caseFirst: "upper", numeric: true }),
    []
  );

  const namePriority = (s?: string) => {
    const ch = (s ?? "").charAt(0);
    if (!ch) return [0, "" as string] as const;
    const code = ch.codePointAt(0) ?? 0;
    const isDigit = ch >= "0" && ch <= "9";
    const isHangul =
      (code >= 0xac00 && code <= 0xd7a3) || (code >= 0x3130 && code <= 0x318f);
    const isUpper = ch >= "A" && ch <= "Z";
    const isLower = ch >= "a" && ch <= "z";
    const isAscii = code < 128;
    const group = isDigit ? 1 : isHangul ? 2 : isUpper ? 3 : isLower ? 4 : isAscii ? 0 : 5;
    return [group, s ?? ""] as const;
  };

  /** ✅ 작품 목록 불러오기 */
  const fetchPage = useCallback(
    async (nextPage: number, replace = false) => {
      try {
        if (replace) setLoading(true);
        const resp = await getAllArtworks(nextPage, currentSortRef.current);

        const mapped: ArtworkRow[] = (resp.items ?? []).map((a: any) => ({
          id: String(a.id),
          thumbnail: a.thumbnail,
          name: a.name,
          artistName: a.artistName,
          createdAt: a.createdAt ?? a.created_at ?? undefined,
          followersCount: a.followersCount ?? a.likesCount ?? 0,
          memberLike: Boolean(a.memberLike),
          sound: a.soundUrl ?? a.audio ?? undefined,
        }));

        const sorted = clientSort(mapped, currentSortRef.current, collator, namePriority);

        if (replace) {
          setItems(sorted);
          setPage(nextPage);
        } else {
          setItems((prev) => [...prev, ...sorted]);
          setPage(nextPage);
        }
        setTotal(Number(resp.total ?? (replace ? sorted.length : total)));
      } catch (e) {
        console.error("[HomeArtworks] fetch error:", e);
        if (replace) setItems([]);
      } finally {
        if (replace) setLoading(false);
        setRefreshing(false);
        setFetchingMore(false);
      }
    },
    [collator, total]
  );

  // 최초 1회 로드
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchPage(1, true);
  }, [fetchPage]);

  // 정렬 변경 시 새로고침
  useEffect(() => {
    setDropdownOpen(false);
    fetchPage(1, true);
  }, [sortMode]);

  /** ✅ 좋아요 토글 */
  const handleLikeToggle = async (artworkId: string, currentLiked: boolean) => {
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }
    try {
      setLikeLoading(true);
      await toggleArtworkLike(token, artworkId);
      setItems((prev) =>
        prev.map((it) =>
          String(it.id) === String(artworkId)
            ? { ...it, memberLike: !currentLiked }
            : it
        )
      );
    } catch (err) {
      console.error("❌ 좋아요 실패:", err);
      Alert.alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || fetchingMore) return;
    if (items.length >= total) return;
    setFetchingMore(true);
    await fetchPage(page + 1, false);
  };

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchPage(1, true);
  };

  const sortLabel =
    sortMode === "latest"
      ? "최신 등록순"
      : sortMode === "oldest"
      ? "오래된 순"
      : sortMode === "name"
      ? "이름순 (가 → Z)"
      : sortMode === "nameDesc"
      ? "이름순 (Z → 가)"
      : "인기순";

  const goPlay = (row: ArtworkRow) => {
    const work = {
      id: row.id,
      title: row.name,
      artist: row.artistName,
      thumbnail: row.thumbnail,
      sound: row.sound,
    };
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
      params: {
        work: JSON.stringify(work),
        trackId: String(row.id),
        autoplay: "1",
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작품</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* 메타 영역 */}
      <View style={styles.metaWrap}>
        <TouchableOpacity
          style={styles.metaBtn}
          onPress={() => setDropdownOpen((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.subHeaderText}>
            총 {total} 작품 · {sortLabel}
          </Text>
          <MaterialIcons
            name={dropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdown}>
            <DropItem label="최신 등록순" active={sortMode === "latest"} onPress={() => setSortMode("latest")} />
            <DropItem label="오래된 순" active={sortMode === "oldest"} onPress={() => setSortMode("oldest")} />
            <DropItem label="이름순 (가 → Z)" active={sortMode === "name"} onPress={() => setSortMode("name")} />
            <DropItem label="이름순 (Z → 가)" active={sortMode === "nameDesc"} onPress={() => setSortMode("nameDesc")} />
            <DropItem label="인기순" active={sortMode === "popular"} onPress={() => setSortMode("popular")} />
          </View>
        )}
      </View>

      {/* 리스트 */}
      <TouchableWithoutFeedback onPress={() => dropdownOpen && setDropdownOpen(false)}>
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                fetchingMore ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => goPlay(item)} activeOpacity={0.85}>
                  <View style={styles.cardRow}>
                    <Image source={{ uri: item.thumbnail }} style={styles.cardImg} />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardDesc}>{item.artistName}</Text>
                    </View>

                    {/* ❤️ 좋아요 버튼 */}
                    <TouchableOpacity
                      style={styles.heartBtn}
                      onPress={() => handleLikeToggle(item.id, !!item.memberLike)}
                      disabled={likeLoading}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name="favorite"
                        size={24}
                        color={item.memberLike ? "#FF5A4A" : "#CBD5E1"}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

/** 드롭다운 아이템 */
function DropItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.dropRow, active && styles.dropRowActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.dropTxt, active && styles.dropTxtActive]}>{label}</Text>
      {active && <MaterialIcons name="check" size={16} color="#ff5b55" />}
    </TouchableOpacity>
  );
}

/* ---------- 클라이언트 정렬 ---------- */
function clientSort(
  list: ArtworkRow[],
  mode: SortMode,
  collator: Intl.Collator,
  namePriority: (s?: string) => readonly [number, string]
) {
  const arr = [...list];
  if (mode === "latest" || mode === "oldest") {
    arr.sort((a, b) => {
      const ta = toTime(a.createdAt);
      const tb = toTime(b.createdAt);
      if (ta === null || tb === null) return 0;
      return mode === "latest" ? tb - ta : ta - tb;
    });
    return arr;
  }
  if (mode === "popular") {
    arr.sort((a, b) => (b.followersCount ?? 0) - (a.followersCount ?? 0));
    return arr;
  }
  arr.sort((a, b) => {
    const [ga, sa] = namePriority(a.name);
    const [gb, sb] = namePriority(b.name);
    const base = ga !== gb ? ga - gb : collator.compare(sa, sb);
    return mode === "name" ? base : -base;
  });
  return arr;
}

function toTime(v?: string | number) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const t = Date.parse(v);
  return isNaN(t) ? null : t;
}

/* ---------- 스타일 ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  metaWrap: { position: "relative", backgroundColor: "#fff", zIndex: 10 },
  metaBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingVertical: 6 },
  subHeaderText: { fontSize: 13, color: "#6B7280", fontWeight: "700", marginRight: 4 },
  dropdown: {
    position: "absolute",
    top: 32, left: 0, width: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6, paddingHorizontal: 8,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#eee",
  },
  dropRow: {
    paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: 8, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  dropRowActive: { backgroundColor: "#FFE9E7" },
  dropTxt: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  dropTxtActive: { color: "#ff5b55" },
  cardRow: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 16, backgroundColor: "#fff",
    borderRadius: 12, padding: 7,
    shadowColor: "#ddd", shadowOpacity: 0.07, shadowRadius: 2, shadowOffset: { width: 1, height: 2 },
    elevation: 2,
  },
  cardImg: { width: 56, height: 56, borderRadius: 8, marginRight: 12, backgroundColor: "#eee" },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 2, color: "#222" },
  cardDesc: { fontSize: 12, color: "#666" },
  heartBtn: {
    marginLeft: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
