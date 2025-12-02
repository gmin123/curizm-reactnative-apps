import { useAuth } from "@/app/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  View,
} from "react-native";

type ArtistRow = {
  id: string;
  name: string;
  profileImg?: string;
  artworksCount?: number;
  followers?: number;
  follow?: boolean;
};

type SortKey = "nameAsc" | "nameDesc" | "popular";

// 작가 데이터 불러오는 함수
async function fetchAllArtists(page = 1, signal?: AbortSignal): Promise<ArtistRow[]> {
  const url = `https://api.curizm.io/api/v1/home/all/artists?page=${page}&sortBy=name`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} (home/all/artists)`);
  const json = await res.json();
  
  const list = Array.isArray(json)
    ? json
    : Array.isArray(json?.items)
    ? json.items
    : Array.isArray(json?.artists)
    ? json.artists
    : [];

  return list.map((a: any): ArtistRow => ({
    id: String(a?.id ?? a?.artistId ?? ""),
    name: a?.name ?? a?.artistName ?? "-",
    profileImg: a?.profileImg ?? a?.image ?? a?.avatar ?? undefined,
    artworksCount: a?.artworksCount ?? a?.numberOfArtworks ?? (Array.isArray(a?.artworks) ? a.artworks.length : 0) ?? 0,
    followers: a?.followers ?? a?.followerCount ?? a?.likes ?? 0,
    follow: typeof a?.follow === "boolean" ? a.follow : typeof a?.memberFollow === "boolean" ? a?.memberFollow : undefined,
  }));
}

export default function HomeArtist() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [rows, setRows] = useState<ArtistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("nameAsc");
  const [sortOpen, setSortOpen] = useState(false);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const list = await fetchAllArtists(1, ac.signal);
        setRows(list); // API에서 받은 데이터를 설정
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // 팔로우 토글
  const toggleFollow = async (artist: ArtistRow) => {
    if (!token) {
      Alert.alert("로그인이 필요합니다", "팔로우 기능은 로그인 후 사용할 수 있어요.");
      return;
    }
    if (pending[artist.id]) return;
    const willFollow = !artist.follow;

    setPending((m) => ({ ...m, [artist.id]: true }));
    setRows((list) => list.map((a) => (a.id === artist.id ? { ...a, follow: willFollow } : a)));

    try {
      const resp = await fetch(
        `https://api.curizm.io/api/v1/member/follow/artist/${encodeURIComponent(artist.id)}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!resp.ok) throw new Error();
    } catch (e) {
      setRows((list) => list.map((a) => (a.id === artist.id ? { ...a, follow: !willFollow } : a)));
      Alert.alert("실패", "팔로우 변경에 실패했습니다.");
    } finally {
      setPending((m) => ({ ...m, [artist.id]: false }));
    }
  };

  // 작가 상세 페이지로 이동
  const goDetail = (a: ArtistRow) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Artist)/ArtistDetail",
      params: {
        id: a.id,
        name: a.name,
        profileImg: a.profileImg ?? "",
        numberOfArtworks: String(a.artworksCount ?? 0),
      },
    });
  };

  const total = rows.length;
  const sortLabel =
    sortKey === "nameAsc" ? "이름순 (가 → Z)" : sortKey === "nameDesc" ? "이름역순 (Z → 가)" : "인기순 (팔로우 많은 순)";

  const renderItem = ({ item }: { item: ArtistRow }) => {
    const following = !!item.follow;
    const disabled = !!pending[item.id];

    return (
      <View style={S.row}>
        <Pressable style={S.left} onPress={() => goDetail(item)}>
          {item.profileImg ? (
            <Image source={{ uri: item.profileImg }} style={S.avatar} />
          ) : (
            <View style={[S.avatar, { backgroundColor: "#E5E7EB" }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={S.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={S.meta}>작품 {item.artworksCount ?? 0}</Text>
          </View>
        </Pressable>

        <TouchableOpacity
          onPress={() => toggleFollow(item)}
          activeOpacity={0.9}
          disabled={disabled}
          style={[S.followBtn, following ? S.following : S.follow]}
        >
          <Text style={[S.followTxt, following ? S.followingTxt : S.followTxt]}>
            {following ? "✓ 팔로잉" : "+ 팔로우"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={S.wrap}>
      {/* 헤더 */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>작가</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* 서브헤더 */}
      <View style={S.subHeader}>
        <Text style={S.countText}>총 {total} 작가</Text>
        <Text style={S.dot}> · </Text>
        <Pressable style={S.sortBtn} onPress={() => setSortOpen(true)}>
          <Text style={S.sortText}>{sortLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </Pressable>
      </View>

      {/* 리스트 */}
      {loading ? (
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={S.sep} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 정렬 드롭다운 */}
      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <Pressable style={S.dim} onPress={() => setSortOpen(false)} />
        <View style={S.dropdown}>
          {(
            [
              { k: "nameAsc", label: "이름순 (가 → Z)" },
              { k: "nameDesc", label: "이름역순 (Z → 가)" },
              { k: "popular", label: "인기순 (팔로우 많은 순)" },
            ] as { k: SortKey; label: string }[]
          ).map((opt) => {
            const active = sortKey === opt.k;
            return (
              <TouchableOpacity
                key={opt.k}
                style={[S.ddItem, active && S.ddActive]}
                onPress={() => {
                  setSortKey(opt.k);
                  setSortOpen(false);
                }}
              >
                <Text style={[S.ddText, active && S.ddTextActive]}>{opt.label}</Text>
                {active && <Ionicons name="checkmark" size={18} color="#FF6A3D" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { flex: 1, marginLeft: 8, fontSize: 20, fontWeight: "900", color: "#111" },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  countText: { color: "#6B7280", fontSize: 13 },
  dot: { color: "#6B7280", fontSize: 13 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { color: "#6B7280", fontSize: 13 },

  sep: { height: 1, backgroundColor: "#F2F4F7", marginLeft: 16 },

  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EEE" },
  name: { fontSize: 15, fontWeight: "800", color: "#111" },
  meta: { fontSize: 12, color: "#9AA3AF", marginTop: 2 },

  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
  },
  follow: { backgroundColor: "#FF6A3D" },
  following: { backgroundColor: "#EEF4FF", borderWidth: 1, borderColor: "#DCE7FF" },
  followTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  followingTxt: { color: "#0F172A", fontWeight: "800", fontSize: 13 },

  // 드롭다운
  dim: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.1)" },
  dropdown: {
    position: "absolute",
    right: 16,
    top: 92,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    width: 220,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ddItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ddActive: { backgroundColor: "#FFF5F2" },
  ddText: { fontSize: 14, color: "#111" },
  ddTextActive: { color: "#FF6A3D", fontWeight: "800" },
});
