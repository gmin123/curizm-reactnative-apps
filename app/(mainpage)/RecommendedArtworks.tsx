import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext"; // ✅ AuthProvider 연결
// ⚠️ 경로는 실제 AuthContext 파일 위치에 맞게 수정하세요.

interface Artwork {
  id: string;
  name: string;
  thumbnail: string;
  artistName: string;
  thoughts: number;
  likes: number;
  sound?: string;
  exhibitionId?: string;
  subtitlesUrl?: string;
}

const BASE_URL = "https://api.curizm.io"; // ✅ 실제 서버 주소

export default function RecommendedArtworks() {
  const { user, isLoading: authLoading } = useAuth(); // ✅ 로그인 정보 가져오기
  const router = useRouter();
  const [data, setData] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.token) {
      fetchRecommendations(user.token);
    } else {
      setLoading(false); // 비로그인 시 로딩 바로 해제
    }
  }, [user]);

  const fetchRecommendations = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/v1/home/recommendations?page=1&sessionId=${user?.email ?? "guest"}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await res.json();
      console.log("✅ 추천 작품 데이터:", json);
      console.log("✅ 첫 번째 작품 예시:", json.recommendations?.[0]);
      setData(json.recommendations || []);
    } catch (error) {
      console.error("❌ 추천 작품 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 비로그인 시 섹션 숨기기
  if (!user && !authLoading) {
    return null;
  }

  if (loading || authLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#FF4E21" />
      </View>
    );
  }

  if (data.length === 0) {
    return null; // 데이터 없으면 표시하지 않음
  }

  const goToPlayer = async (artwork: Artwork) => {
    try {
      console.log("🎵 작품 클릭됨:", artwork);
      
      // ✅ player API로 작품 상세 정보를 먼저 가져오기
      let audioItem: {
        id: string;
        title: string;
        artist: string;
        thumbnail: string;
        sound: string;
        exhibitionId: string;
        subtitlesUrl: string;
        durationTime?: number;
      } = {
        id: artwork.id,
        title: artwork.name,
        artist: artwork.artistName,
        thumbnail: artwork.thumbnail,
        sound: artwork.sound || "",
        exhibitionId: artwork.exhibitionId || artwork.id,
        subtitlesUrl: artwork.subtitlesUrl || "",
      };

      try {
        console.log("📡 player API 호출 중...");
        console.log("📡 artwork.id:", artwork.id);
        const playerUrl = `${BASE_URL}/api/v1/exhibition/player?artworkId=${encodeURIComponent(artwork.id)}&type=artwork`;
        console.log("📡 playerUrl:", playerUrl);
        
        const playerRes = await fetch(playerUrl, {
          headers: {
            Authorization: user?.token ? `Bearer ${user.token}` : "",
            "Content-Type": "application/json",
          },
        });
        
        console.log("📡 playerRes.status:", playerRes.status);
        
        if (playerRes.ok) {
          const playerData = await playerRes.json();
          console.log("✅ player API 응답:", JSON.stringify(playerData, null, 2));
          console.log("✅ playerData.sound:", playerData.sound);
          console.log("✅ playerData.subtitles:", playerData.subtitles);
          console.log("✅ playerData.ttsVoices:", playerData.ttsVoices);
          
          // ttsVoices에서 기본 음성 선택 (isDefault가 true인 것 우선)
          const defaultVoice = playerData.ttsVoices?.find((v: any) => v.isDefault) || playerData.ttsVoices?.[0];
          
          console.log("🎤 선택된 TTS:", defaultVoice);
          console.log("🎤 defaultVoice.audioUrl:", defaultVoice?.audioUrl);
          
          // player API 응답으로 완전한 데이터 구성
          const newSound = playerData.sound || defaultVoice?.audioUrl || "";
          console.log("🎵 새로운 sound URL:", newSound);
          
          audioItem = {
            id: artwork.id,
            title: playerData.title || artwork.name,
            artist: playerData.name || artwork.artistName,
            thumbnail: playerData.thumbnail || playerData.image || artwork.thumbnail,
            sound: newSound,
            exhibitionId: artwork.exhibitionId || artwork.id, // 단일 작품이므로 artwork.id 사용
            subtitlesUrl: playerData.subtitles || playerData.subtitlesUrl || defaultVoice?.subtitlesUrl || "",
            durationTime: playerData.durationTime || playerData.duration,
          };
        } else {
          const errorText = await playerRes.text();
          console.warn("⚠️ player API 응답 실패:", playerRes.status, errorText);
        }
      } catch (apiErr) {
        console.error("⚠️ player API 호출 실패:", apiErr);
        // 실패해도 기본 데이터로 진행
      }

      console.log("🎵 최종 오디오 아이템:", audioItem);
      console.log("🎵 sound URL:", audioItem.sound);

      router.push({
        pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
        params: {
          singleWork: JSON.stringify(audioItem),
          visible: "true",
        },
      });
    } catch (err) {
      console.error("❌ 오디오 플레이어 이동 오류:", err);
    }
  };

  const renderItem = ({ item }: { item: Artwork }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => goToPlayer(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.artworkTitle} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.artistName}>{item.artistName}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>💙 {item.likes}</Text>
        <Text style={styles.stat}>· 생각 {item.thoughts}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {user?.name ? `${user.name}님을 위한` : "사용자님을 위한"}
      </Text>
      <Text style={styles.sectionSubtitle}>오늘의 추천 작품</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#FF4E21",
    marginTop: 4,
    marginBottom: 14,
  },
  listContainer: {
    paddingRight: 16,
  },
  card: {
    width: 140,
    marginRight: 14,
  },
  thumbnail: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#f2f2f2",
  },
  artworkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  artistName: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
    color: "#666",
    marginRight: 6,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});
