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

const BASE_URL = "https://api.curizm.io";

/* =======================
   타입 정의
======================= */

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
  followCount?: number;
  artworks: Artwork[];
};

/* =======================
   컴포넌트
======================= */

export default function ArtistList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const token = user?.token ?? "";
  const router = useRouter();

  /* =======================
     추천 작가 불러오기
  ======================= */

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/home/artists`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(await res.text());

        const raw: Artist[] = await res.json();
        const mapped = raw.map((a) => ({
          ...a,
          follow: a.memberFollow ?? a.follow ?? false,
          followCount: a.followCount ?? 0,
          artworks: a.artworks ?? [],
        }));

        setArtists(mapped);
      } catch (e) {
        console.error("❌ 추천 작가 로드 실패:", e);
        Alert.alert("오류", "추천 작가를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [token]);

  /* =======================
     로그인 필요 처리
  ======================= */

  const requireLogin = () => {
    Alert.alert("로그인이 필요합니다", "로그인 후 이용 가능합니다.");
  };

  /* =======================
     작품 클릭 → 오디오 플레이어
     🔥 핵심 수정 부분
  ======================= */

const goArtworkPage = (artwork: Artwork) => {
  router.push({
    pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
    params: {
      singleWork: JSON.stringify({
        id: artwork.id,
        title: artwork.name,
        artist: artwork.artistName,
        thumbnail: artwork.thumbnail,

        // 🔥 중요: 아래 두 개는 비워둠
        sound: "",
        subtitlesUrl: "",

        // 🔥 중요: exhibitionId도 비워둔다
        exhibitionId: "",
      }),
      visible: "false",
    },
  });
};


  /* =======================
     로딩
  ======================= */

  if (loading) {
    return (
      <View style={styles.center}>
        <CustomText>로딩 중...</CustomText>
      </View>
    );
  }

  /* =======================
     렌더링
  ======================= */

  return (
    <ScrollView style={styles.container}>
      <CustomText style={styles.header}>
        취향을 저격하는{"\n"}
        <CustomText style={{ color: "#FF4D00" }}>
          작가를 만나보세요
        </CustomText>
      </CustomText>

      {artists.map((artist) => (
        <View key={artist.id} style={styles.artistBlock}>
          {/* 작가 정보 */}
          <View style={styles.artistHeader}>
            <View style={styles.artistInfo}>
              <Image source={{ uri: artist.profileImg }} style={styles.avatar} />
              <View style={{ marginLeft: 8 }}>
                <CustomText style={styles.artistName}>
                  {artist.name}
                </CustomText>
                <CustomText style={styles.followerCount}>
                  팔로워 {artist.followCount}명
                </CustomText>
              </View>
            </View>
          </View>

          {/* 작품 리스트 */}
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

/* =======================
   스타일
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 24,
  },
  artistBlock: {
    marginBottom: 32,
  },
  artistHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  artistInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  artistName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  followerCount: {
    fontSize: 12,
    color: "#888",
  },
  artworkItem: {
    width: 120,
    marginRight: 12,
  },
  artworkImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  artworkTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "bold",
  },
  artworkInfo: {
    fontSize: 12,
    color: "#555",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
