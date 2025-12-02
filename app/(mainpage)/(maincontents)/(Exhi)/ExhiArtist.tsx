import { useAuth } from "@/app/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ExhibitionArtist,
  getExhibitionArtists,
} from "../../../../api/exhi/getExhibitionArtists";
import { toggleArtistFollow } from "../../../../api/like";

const BASE_URL = "https://api.curizm.io"; // ✅ 실제 서버 주소

type Props = {
  exhibitionId: string;
};

// ✅ 간단한 URL 유효성 검사
function isValidHttpUrl(s?: string) {
  if (!s || typeof s !== "string") return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ✅ 공통 선택 함수: a 우선, 없으면 b
function pick(a?: string, b?: string) {
  const aClean = (a ?? "").trim();
  const bClean = (b ?? "").trim();
  return aClean !== "" ? aClean : bClean !== "" ? bClean : "";
}

export const ArtistList: React.FC<Props> = ({ exhibitionId }) => {
  const [artists, setArtists] = useState<ExhibitionArtist[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const token = user?.token ?? "";
  const router = useRouter();

  // ✅ 작가 목록 불러오기
  useEffect(() => {
    let isMounted = true;
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const { artists: fetched, total } = await getExhibitionArtists(
          exhibitionId,
          page
        );
        if (!isMounted) return;
        setArtists((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
        setTotal(total);
      } catch (e) {
        console.error("❌ 전시 작가 목록 로드 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
    return () => {
      isMounted = false;
    };
  }, [exhibitionId, page]);

  // ✅ 더 불러오기
  const onLoadMore = () => {
    if (!loading && artists.length < total) {
      setPage((prev) => prev + 1);
    }
  };

  // ✅ 로그인 필요 알림
  const requireLogin = () => {
    Alert.alert("로그인이 필요합니다", "해당 기능은 로그인 후 이용할 수 있습니다.");
  };

  // ✅ 팔로우 토글
  const handleFollow = async (id: string) => {
    if (!token) return requireLogin();

    setArtists((prev) =>
      prev.map((artist) =>
        artist.id === id
          ? { ...artist, memberFollow: !artist.memberFollow }
          : artist
      )
    );

    try {
      const result = await toggleArtistFollow(token, id);
      console.log("✅ 팔로우 토글 성공:", result);
    } catch (e) {
      console.error("❌ 팔로우 토글 실패:", e);
      // 실패 시 롤백
      setArtists((prev) =>
        prev.map((artist) =>
          artist.id === id
            ? { ...artist, memberFollow: !artist.memberFollow }
            : artist
        )
      );
      Alert.alert("실패", "팔로우 변경에 실패했습니다.");
    }
  };
// ✅ 오디오 플레이어 이동
const goToAudioPlayer = async (artist: ExhibitionArtist) => {
  try {
    const artworkId = artist.artworkId || artist.id;
    if (!artworkId) {
      Alert.alert("안내", "이 작가의 도슨트 음성이 없습니다.");
      return;
    }

    const playerUrl = `${BASE_URL}/api/v1/exhibition/player?artworkId=${encodeURIComponent(
      artworkId
    )}&type=artwork`;

    console.log("📡 player API 요청:", playerUrl);

    const res = await fetch(playerUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("⚠️ player API 호출 실패:", res.status, text);
      Alert.alert("오디오 정보를 불러오지 못했습니다.");
      return;
    }

    const playerData = await res.json();
    console.log("✅ playerData 응답:", JSON.stringify(playerData, null, 2));

    const defaultVoice =
      playerData?.ttsVoices?.find((v: any) => v?.isDefault) ||
      playerData?.ttsVoices?.[0];

    // ✅ HomeArtistRecommend의 Artwork 스키마 그대로 맞추기
    const soundUrl =
      (defaultVoice?.audioUrl && defaultVoice.audioUrl.trim() !== "")
        ? defaultVoice.audioUrl
        : (playerData?.sound && playerData.sound.trim() !== "")
        ? playerData.sound
        : "";

    // Artwork 형식: { id, thumbnail, title, artistName, sound, exhibitionId }
    const artworkPayload = {
      id: String(artworkId),
      thumbnail: playerData?.thumbnail || playerData?.image || artist.profileImg || "",
      title: playerData?.title || playerData?.name || "제목 미상",
      artistName: playerData?.artistName || playerData?.name || artist.name || "작가 미상",
      sound: soundUrl,
      exhibitionId: String(exhibitionId),
    };

    console.log("🎧 Artwork payload (recommend 동일 스키마):", artworkPayload);

    // 🔒 한글/특수문자 안전 전송
    const payload = encodeURIComponent(JSON.stringify(artworkPayload));

    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
      params: {
        singleWork: payload, // ✅ recommend와 동일 스키마
        visible: "true",
      },
    });
  } catch (e) {
    console.error("❌ 오디오 재생 실패:", e);
    Alert.alert("오류", "오디오를 불러오는 중 문제가 발생했습니다.");
  }
};


  // ✅ 렌더링
  const renderItem = ({ item }: { item: ExhibitionArtist }) => (
    <TouchableOpacity
      style={S.row}
      activeOpacity={0.85}
      onPress={() => goToAudioPlayer(item)}
    >
      <Image
        source={
          item.profileImg
            ? { uri: item.profileImg }
            : require("../../../../assets/images/icon.png")
        }
        style={S.avatar}
      />

      <View style={S.meta}>
        <Text style={S.name}>{item.name}</Text>
        <Text style={S.sub}>작품 {item.numberOfArtworks ?? 0}</Text>
      </View>

      <TouchableOpacity
        style={[S.followBtn, item.memberFollow && S.followBtnActive]}
        onPress={() => handleFollow(item.id)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={item.memberFollow ? "checkmark" : "add"}
          size={14}
          color="#fff"
          style={{ marginRight: 3 }}
        />
        <Text style={S.followText}>
          {item.memberFollow ? "팔로우중" : "팔로우"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color="#fb5a2a"
            />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: "#777" }}>참여 작가가 없습니다.</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const S = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 70,
    backgroundColor: "#fff",
    borderBottomWidth: 0.6,
    borderColor: "#f2f2f2",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  meta: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
  },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fb5a2a",
    justifyContent: "center",
  },
  followBtnActive: {
    backgroundColor: "#ff7644",
  },
  followText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
  },
});
