import { useAuth } from "@/app/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
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
import { toggleArtistFollow } from "../../../../api/like";

const BASE_URL = "https://api.curizm.io";

export default function FollowedArtists() {
  const { user } = useAuth();
  const router = useRouter();
  const token = user?.token ?? "";
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // ✅ 팔로우한 작가 목록 가져오기
  // ----------------------------
  const fetchFollowedArtists = async () => {
    try {
      console.log("📡 팔로우 목록 요청 시작");
      const res = await fetch(`${BASE_URL}/api/v1/member/artists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("📡 팔로우 목록 응답:", json);

      setData(json.likedArtists ?? []);
    } catch (err) {
      console.error("❌ 팔로우 작가 목록 불러오기 실패:", err);
      Alert.alert("오류", "팔로우 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFollowedArtists();
  }, [token]);

  // ----------------------------
  // ✅ 팔로우 취소 시 서버 + 화면에서 제거
  // ----------------------------
  const handleFollowToggle = async (artistId: string, e: any) => {
    e.stopPropagation(); // 부모 TouchableOpacity의 onPress 이벤트 방지
    try {
      const res = await toggleArtistFollow(token, artistId);
      console.log("✅ 팔로우 토글 성공:", res);
      // UI에서도 즉시 제거
      setData((prev) => prev.filter((artist) => artist.id !== artistId));
    } catch (err) {
      console.error("❌ 팔로우 토글 실패:", err);
      Alert.alert("실패", "팔로우 취소에 실패했습니다.");
    }
  };

  // ----------------------------
  // ✅ 작가 상세 페이지로 이동
  // ----------------------------
  const goToArtistDetail = (artist: any) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Artist)/ArtistDetail",
      params: {
        id: artist.id,
        name: artist.name,
        profileImg: artist.profileImg || "",
        numberOfArtworks: artist.numberOfArtworks?.toString() || "0",
        headerImage: artist.headerImage || artist.profileImg || "",
      },
    });
  };

  // ----------------------------
  // ✅ 로딩 중 화면
  // ----------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#232956" />
      </View>
    );
  }

  // ----------------------------
  // ✅ 빈 목록 화면
  // ----------------------------
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyMessage}>팔로우한 작가가 없습니다.</Text>
      </View>
    );
  }

  // ----------------------------
  // ✅ 팔로우 목록 렌더링
  // ----------------------------
  return (
    <>
      <Text style={styles.listCount}>총 {data.length} 작가</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardRow}
            onPress={() => goToArtistDetail(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.profileImg }} style={styles.artistAvatar} />
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={styles.artistName}>{item.name}</Text>
              <Text style={styles.artistSub}>작가</Text>
            </View>
            <TouchableOpacity
              onPress={(e) => handleFollowToggle(item.id, e)}
              style={styles.followBtnFilled}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check" size={16} color="#0F172A" />
              <Text style={styles.followTxtFilled}>팔로잉</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 13, paddingTop: 4, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={styles.hr} />}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listCount: {
    color: "#ABB0BE",
    fontSize: 12.6,
    marginLeft: 20,
    marginTop: 21,
    fontWeight: "700",
    marginBottom: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 13,
    borderRadius: 13,
  },
  artistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECECEC",
  },
  artistName: {
    fontWeight: "800",
    fontSize: 14.2,
    color: "#232956",
    marginBottom: 2,
  },
  artistSub: {
    fontSize: 12,
    color: "#6D7689",
    fontWeight: "600",
  },
  followBtnFilled: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FD",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 6.5,
  },
  followTxtFilled: {
    fontWeight: "800",
    fontSize: 13,
    color: "#0F172A",
    marginLeft: 5,
  },
  hr: {
    height: 1,
    backgroundColor: "#F1F1F6",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyMessage: {
    color: "#ABB0BE",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
