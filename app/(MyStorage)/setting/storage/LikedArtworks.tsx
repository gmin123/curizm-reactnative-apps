import { useAuth } from "@/app/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
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
import ExhiAudioPlayer, { AudioItem } from "../../../(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer";
import { toggleArtworkLike } from "../../../../api/like"; // ✅ 기존 like.ts에 있는 함수 사용

const BASE_URL = "https://api.curizm.io";

export default function LikedArtworks() {
  const { user } = useAuth();
  const token = user?.token ?? "";
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioVisible, setAudioVisible] = useState(false);
  const [singleWork, setSingleWork] = useState<AudioItem | null>(null);

  // ----------------------------
  // ✅ 좋아요한 작품 목록 불러오기
  // ----------------------------
  const fetchLikedArtworks = async () => {
    try {
      console.log("🎨 좋아요 작품 목록 요청 시작");
      const res = await fetch(`${BASE_URL}/api/v1/member/artworks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("🎨 좋아요 작품 목록 응답:", json);
      console.log("🎨 작품 데이터 예시:", json.likedArtworks?.[0]);

      setData(json.likedArtworks ?? []);
    } catch (err) {
      console.error("❌ 좋아요 작품 목록 불러오기 실패:", err);
      Alert.alert("오류", "좋아요한 작품을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLikedArtworks();
  }, [token]);

  // ----------------------------
  // ✅ 좋아요 해제 (토글)
  // ----------------------------
  const handleToggleLike = async (artworkId: string, e: any) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    try {
      console.log("❤️ 좋아요 해제 요청:", artworkId);
      await toggleArtworkLike(token, artworkId); // 서버 요청
      console.log("✅ 좋아요 해제 성공");

      // ✅ UI에서도 제거
      setData((prev) => prev.filter((item) => item.id !== artworkId));
    } catch (err) {
      console.error("❌ 좋아요 해제 실패:", err);
      Alert.alert("실패", "좋아요 해제에 실패했습니다.");
    }
  };

  // ----------------------------
  // ✅ 작품 클릭 시 오디오 플레이어 열기 (현재 데이터만 사용)
  // ----------------------------
  const goToArtworkPlayer = (artwork: any) => {
    try {
      console.log("🎨 작품 선택:", artwork);
      
      // ✅ 작품 데이터로 단일 작품 오디오 플레이어 열기
      const work: AudioItem = {
        id: artwork.id,
        title: artwork.name,
        artist: artwork.artistName,
        thumbnail: artwork.thumbnail || "",
        sound: artwork.sound || "",
        exhibitionId: "single",
        durationTime: artwork.durationTime || 0,
        subtitlesUrl: artwork.subtitlesUrl || "",
      };

      setSingleWork(work);
      setAudioVisible(true);
      
    } catch (err) {
      console.error("❌ 작품 이동 실패:", err);
      Alert.alert("오류", "오디오 플레이어를 열 수 없습니다.");
    }
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
        <Text style={styles.emptyMessage}>좋아요한 작품이 없습니다.</Text>
      </View>
    );
  }

  // ----------------------------
  // ✅ 렌더링
  // ----------------------------
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cardRow}
      onPress={() => goToArtworkPlayer(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbSquare} />
      <View style={{ flex: 1, marginLeft: 9 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.artistName}</Text>
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
      <Text style={styles.listCount}>총 {data.length} 작품</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 13, paddingTop: 4, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={styles.hr} />}
        showsVerticalScrollIndicator={false}
      />
      
      {/* ✅ 단일 작품 오디오 플레이어 */}
      {audioVisible && singleWork && (
        <ExhiAudioPlayer
          visible={audioVisible}
          singleWork={singleWork}
          onClose={() => {
            setAudioVisible(false);
            setSingleWork(null);
          }}
          onMinimize={() => {
            setAudioVisible(false);
            setSingleWork(null);
          }}
        />
      )}
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
