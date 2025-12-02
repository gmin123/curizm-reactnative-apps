// app/(mainpage)/(askquri)/AskQuri.tsx
import CustomText from "@/app/components/CustomeText";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

type BannerRes = {
  id: string;
  thumbnail: string;
  sound?: string;
};

export default function AskQuri() {
  const router = useRouter();
  const [artData, setArtData] = useState<BannerRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtData = async () => {
      try {
        const response = await fetch("https://api.curizm.io/api/v1/home/artwork/banner");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json: BannerRes = await response.json();
        setArtData(json);
      } catch (error) {
        console.error("작품 배너 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtData();
  }, []);

  const onPressAskQuri = () => {
    if (!artData) return;

    const work = {
      id: artData.id,
      title: "오늘의 배너 작품",
      artist: "",
      thumbnail: artData.thumbnail,   // ✅ 서버 이미지 그대로 사용
      sound: artData.sound,
    };

    try {
      // ✅ () 그룹명은 URL에 포함되지 않으므로, 루트 기준 경로로 푸시하는 게 안전함
      router.push({
        pathname: "/ExhiAudioPlayer",
        params: {
          work: JSON.stringify(work),
          initialTrackId: String(artData.id),
          autoplay: "1",
          isexhitrue: "false", // 요청 플래그
        },
      });
      console.log("➡️ push to /ExhiAudioPlayer with params:", {
        work, initialTrackId: String(artData.id), autoplay: "1", isexhitrue: "false",
      });
    } catch (e: any) {
      console.error("❌ router.push 실패:", e?.message || e);
      Alert.alert("이동 오류", "오디오 플레이어 화면으로 이동하지 못했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 카드 전체를 눌러도 이동되도록 터치 영역 확장 (UX 개선) */}
      <TouchableOpacity onPress={onPressAskQuri} activeOpacity={0.9}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <CustomText style={styles.title}>보고있는 이 작품,</CustomText>
            <CustomText style={styles.subtitle}>궁금한게 있다면 바로 물어보세요</CustomText>
          </View>

          {loading ? (
            <View style={[styles.artImage, { alignItems: "center", justifyContent: "center" }]}>
              <ActivityIndicator />
            </View>
          ) : (
            <Image
              source={{
                uri: artData?.thumbnail
                  ?? "https://dummyimage.com/100x100/eeeeee/000000&text=No+Image",
              }}
              style={styles.artImage}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* 별도 버튼 유지 (둘 중 아무거나 눌러도 이동) */}
      <TouchableOpacity
        style={styles.button}
        onPress={onPressAskQuri}
        disabled={!artData || loading}
      >
        <CustomText style={styles.buttonText}>Curi에게 물어보기</CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  artImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: "#EEE",
  },
  button: {
    backgroundColor: "#FF5630",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});
