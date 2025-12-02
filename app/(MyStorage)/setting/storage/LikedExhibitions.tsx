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
import { toggleExhibitionLike } from "../../../../api/like"; // ✅ like.ts 안에 추가 필요 (아래 참고)

const BASE_URL = "https://api.curizm.io";

export default function LikedExhibitions() {
  const { user } = useAuth();
  const router = useRouter();
  const token = user?.token ?? "";
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // ✅ 좋아요한 전시 목록 불러오기
  // ----------------------------
  const fetchLikedExhibitions = async () => {
    try {
      console.log("🎟️ 좋아요 전시 목록 요청 시작");
      const res = await fetch(`${BASE_URL}/api/v1/member/exhibitions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("🎟️ 좋아요 전시 목록 응답:", json);

      setData(json.likedExhibitions ?? []);
    } catch (err) {
      console.error("❌ 좋아요 전시 목록 불러오기 실패:", err);
      Alert.alert("오류", "좋아요한 전시를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLikedExhibitions();
  }, [token]);

  // ----------------------------
  // ✅ 좋아요 해제
  // ----------------------------
  const handleToggleLike = async (exhibitionId: string, e: any) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    try {
      console.log("❤️ 좋아요 해제 요청:", exhibitionId);
      await toggleExhibitionLike(token, exhibitionId);
      console.log("✅ 좋아요 해제 성공");

      // UI에서도 즉시 제거
      setData((prev) => prev.filter((item) => item.id !== exhibitionId));
    } catch (err) {
      console.error("❌ 좋아요 해제 실패:", err);
      Alert.alert("실패", "좋아요 해제에 실패했습니다.");
    }
  };

  // ----------------------------
  // ✅ 전시 상세 페이지로 이동
  // ----------------------------
  const goToExhibitionDetail = (exhibition: any) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
      params: {
        id: exhibition.id,
        coverImage: exhibition.coverImage || "",
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
        <Text style={styles.emptyMessage}>좋아요한 전시가 없습니다.</Text>
      </View>
    );
  }

  // ----------------------------
  // ✅ 렌더링
  // ----------------------------
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cardRow}
      onPress={() => goToExhibitionDetail(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.coverImage }} style={styles.thumbSquare} />
      <View style={{ flex: 1, marginLeft: 9 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSub}>{item.organizer}</Text>
      </View>

      <TouchableOpacity 
        onPress={(e) => handleToggleLike(item.id, e)} 
        activeOpacity={0.8}
      >
        <MaterialIcons name="favorite" size={23} color="#FF6A3D" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      <Text style={styles.listCount}>총 {data.length} 전시</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
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
  thumbSquare: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
  },
  cardTitle: {
    fontWeight: "900",
    fontSize: 14.5,
    color: "#181926",
    marginBottom: 1,
  },
  cardSub: {
    fontSize: 12.2,
    color: "#A6ADB8",
    fontWeight: "600",
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
