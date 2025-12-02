import CustomText from "@/app/components/CustomeText";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { toggleArtistFollow } from "../../../api/like";

const BASE_URL = "https://api.curizm.io";

type Artwork = {
  id: string;
  thumbnail: string;
  name: string;
  artistName: string;
};

type Artist = {
  id: string;
  name: string;
  profileImg: string;
  follow?: boolean;
  memberFollow?: boolean;
  editor?: boolean;
  followCount?: number;
  artworks: Artwork[];
};

export default function ArtistList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const token = user?.token ?? "";
  const router = useRouter();

  // --------------------------
  // 팔로우 상태 확인 (로그 확인용)
  // --------------------------
  const checkFollowedArtists = async () => {
    if (!token) return;
    console.log("📡 팔로우 목록 조회 요청 시작");
    const res = await fetch(`${BASE_URL}/api/v1/member/artists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    console.log("📡 팔로우 목록 응답:", text);
  };

  // --------------------------
  // 추천 작가 데이터 가져오기
  // --------------------------
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/home/artists`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const raw: Artist[] = await res.json();

        const mapped = (raw || []).map((a) => ({
          ...a,
          follow: a.memberFollow ?? a.follow ?? false,
          followCount: a.followCount ?? 0,
          artworks: (a.artworks || []).map((w) => ({
            ...w,
          })),
        }));

        setArtists(mapped);
      } catch (e) {
        console.error("추천 작가 로드 실패:", e);
        Alert.alert("오류", "추천 작가를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [token]);

  const requireLogin = () => {
    Alert.alert("로그인이 필요합니다", "로그인 후 이용 가능합니다.");
  };

  // --------------------------
  // 작가 팔로우 토글
  // --------------------------
  const onToggleFollow = async (artistId: string) => {
    if (!token) return requireLogin();

    // 낙관적 업데이트
    setArtists((prev) =>
      prev.map((a) =>
        a.id === artistId
          ? {
              ...a,
              follow: !a.follow,
              followCount: a.follow
                ? (a.followCount || 0) - 1
                : (a.followCount || 0) + 1,
            }
          : a
      )
    );

    try {
      const result = await toggleArtistFollow(token, artistId);
      console.log("✅ 팔로우 토글 성공:", result);
      await checkFollowedArtists();
    } catch (e) {
      console.error("❌ 팔로우 토글 실패:", e);
      // 롤백
      setArtists((prev) =>
        prev.map((a) =>
          a.id === artistId
            ? {
                ...a,
                follow: !a.follow,
                followCount: a.follow
                  ? (a.followCount || 0) + 1
                  : (a.followCount || 0) - 1,
              }
            : a
        )
      );
      Alert.alert("실패", "팔로우 변경에 실패했습니다.");
    }
  };

  // --------------------------
  // 페이지 이동 함수
  // --------------------------
  const goArtistPage = (artist: Artist) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Artist)/ArtistDetail",
      params: {
        id: artist.id,
        name: artist.name,
        profileImg: artist.profileImg,
        numberOfArtworks: String(artist.artworks.length),
      },
    });
  };

  const goArtworkPage = (artwork: Artwork) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
      params: {
        singleWork: JSON.stringify(artwork),
        visible: "false",
      },
    });
  };

  // --------------------------
  // 로딩 중 화면
  // --------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <CustomText>로딩 중...</CustomText>
      </View>
    );
  }

  // --------------------------
  // 실제 렌더링
  // --------------------------
  return (
    <ScrollView style={styles.container}>
      <CustomText style={styles.header}>
        취향을 저격하는{"\n"}
        <CustomText style={{ color: "#FF4D00" }}>작가를 만나보세요</CustomText>
      </CustomText>

      {artists.map((artist) => (
        <View key={artist.id} style={styles.artistBlock}>
          {/* ✅ 작가 헤더 (클릭 시 작가 상세로 이동) */}
          <TouchableOpacity
            style={styles.artistHeader}
            activeOpacity={0.9}
            onPress={() => goArtistPage(artist)}
          >
            <View style={styles.artistInfo}>
              <Image source={{ uri: artist.profileImg }} style={styles.avatar} />
              <View style={{ marginLeft: 8 }}>
                <CustomText style={styles.artistName}>{artist.name}</CustomText>
                <CustomText style={styles.followerCount}>
                  팔로워 {artist.followCount ?? 0}명
                </CustomText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.followButton, artist.follow && styles.following]}
              onPress={() => onToggleFollow(artist.id)}
            >
              <CustomText
                style={[
                  styles.followButtonText,
                  artist.follow && styles.followingText,
                ]}
              >
                {artist.follow ? "✓ 팔로잉" : "+ 팔로우"}
              </CustomText>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* ✅ 작품 리스트 (클릭 시 작품 상세 이동) */}
          <FlatList
            data={artist.artworks}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.artworkItem}
                activeOpacity={0.8}
                onPress={() => goArtworkPage(item)}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.artworkImage}
                />
                <CustomText style={styles.artworkTitle}>
                  {item.name}
                </CustomText>
                <CustomText style={styles.artworkInfo}>
                  {item.artistName}
                </CustomText>
              </TouchableOpacity>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 20, lineHeight: 24 },
  artistBlock: { marginBottom: 32 },
  artistHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  artistInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  artistName: { fontSize: 14, fontWeight: "bold" },
  followerCount: { fontSize: 12, color: "#888" },
  followButton: {
    backgroundColor: "#FF4D00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  following: { backgroundColor: "#eee" },
  followingText: { color: "#333" },
  artworkItem: { width: 120, marginRight: 12 },
  artworkImage: { width: "100%", height: 120, borderRadius: 8, backgroundColor: "#f2f2f2" },
  artworkTitle: { marginTop: 4, fontSize: 13, fontWeight: "bold" },
  artworkInfo: { fontSize: 12, color: "#555" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
