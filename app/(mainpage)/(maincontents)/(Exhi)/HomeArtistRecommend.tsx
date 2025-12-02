// app/(mainpage)/(maincontents)/(Exhi)/HomeArtistRecommend.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../../components/CustomeText";
import { useLikeFollow } from "../../../hooks/useLikeFollow";

type Artwork = {
  id: string;
  thumbnail?: string;
  title: string;
  artistName: string;
  sound?: string;
  exhibitionId?: string;
};

type Artist = {
  id: string;
  name: string;
  profileImg?: string;
  follow?: boolean;
  artworks: Artwork[];
};

function dedupeArtists(raw: any[]): Artist[] {
  const artistMap = new Map<string, any>();
  for (const a of raw ?? []) {
    const key = String(a?.id ?? "");
    if (!key) continue;
    if (!artistMap.has(key)) artistMap.set(key, a);
  }

  const uniq: Artist[] = [];
  for (const [, a] of artistMap) {
    const works = Array.isArray(a?.artworks) ? a.artworks : [];
    const workMap = new Map<string, any>();

    for (const w of works) {
      const wk = String(w?.id ?? "");
      if (!wk) continue;
      if (!workMap.has(wk)) workMap.set(wk, w);
    }

    uniq.push({
      id: String(a.id),
      name: a.name ?? "-",
      profileImg: a.profileImg ?? undefined,
      follow: !!a.follow,
      artworks: Array.from(workMap.values()).map((w: any) => ({
        id: String(w.id),
        thumbnail: w.thumbnail ?? "",
        title: w.name ?? "",
        artistName: w.artistName ?? a.name ?? "",
        sound: w.sound ?? undefined,
        exhibitionId: w.exhibitionId ?? undefined,
      })),
    });
  }
  return uniq;
}

export default function HomeArtistRecommend() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const { toggleFollowArtist, getFollowedArtists, loading: followLoading } = useLikeFollow();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://api.curizm.io/api/v1/home/artists");
        const data = await res.json();
        const deduped = dedupeArtists(Array.isArray(data) ? data : []);

        if (mounted) {
          const followedArtistIds = await getFollowedArtists();
          const followedArtistIdSet = new Set(followedArtistIds);

          const updatedArtists = deduped.map((artist) => ({
            ...artist,
            follow: artist.follow || followedArtistIdSet.has(artist.id),
          }));

          setArtists(updatedArtists);
        }
      } catch (e) {
        console.error("작가 추천 데이터 로딩 실패:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getFollowedArtists]);

  const list = useMemo(() => artists, [artists]);

  const handleFollowToggle = async (artistId: string, currentFollowed: boolean) => {
    const newFollowState = await toggleFollowArtist(artistId, currentFollowed);
    setArtists((prev) =>
      prev.map((artist) =>
        artist.id === artistId ? { ...artist, follow: newFollowState } : artist
      )
    );
  };

  const goArtist = (artist: Artist) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Artist)/ArtistDetail",
      params: {
        id: artist.id,
        name: artist.name,
        profileImg: artist.profileImg ?? "",
        numberOfArtworks: String(artist.artworks?.length ?? 0),
        headerImage: artist.profileImg ?? "",
      },
    });
  };

  const goArtworkDetail = (aw: Artwork) => {
    try {
      router.push({
        pathname: "/(mainpage)/(maincontents)/(Exhi)/ExhiAudioPlayer",
        params: {
          singleWork: JSON.stringify(aw),
          visible: "false",
        },
      });
    } catch (err) {
      console.error("작품 페이지 이동 오류:", err);
    }
  };

  const renderArtworkCard = ({ item }: { item: Artwork }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => goArtworkDetail(item)}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: "#EEE" }]} />
      )}
      <CustomText style={styles.cardTitle} numberOfLines={1}>
        {item.title || "작품 제목"}
      </CustomText>
      <CustomText style={styles.cardArtist} numberOfLines={1}>
        {item.artistName || "작가 이름"}
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <View>
      {list.map((artist) => {
        const five = (artist.artworks ?? []).slice(0, 5);
        return (
          <View key={artist.id} style={styles.artistBlock}>
            {/* 헤더 */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => goArtist(artist)}
              style={styles.headerRow}
            >
              {artist.profileImg ? (
                <Image source={{ uri: artist.profileImg }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: "#EEE" }]} />
              )}
              <View style={{ flex: 1 }}>
                <CustomText style={styles.artistName}>{artist.name}</CustomText>
                <CustomText style={styles.recoBadge}>에디터 추천</CustomText>
              </View>
              <TouchableOpacity
                style={styles.followBtn}
                onPress={() => handleFollowToggle(artist.id, !!artist.follow)}
                disabled={followLoading}
              >
                <CustomText style={styles.followText}>
                  {artist.follow ? "✓ 팔로잉" : "+ 팔로우"}
                </CustomText>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 가로 스크롤: 최대 5개 */}
            <FlatList
              horizontal
              data={five}
              keyExtractor={(it) => it.id}
              renderItem={renderArtworkCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        );
      })}
    </View>
  );
}

const CARD_W = 128;
const CARD_IMG = 128;
const GAP = 12;

const styles = StyleSheet.create({
  artistBlock: {
    marginTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  artistName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  recoBadge: {
    fontSize: 12,
    color: "#8E8E8E",
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: "#FF5630",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  followText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  horizontalList: {
    paddingHorizontal: 8,
    gap: GAP,
  },
  card: {
    width: CARD_W,
  },
  cardImage: {
    width: CARD_IMG,
    height: CARD_IMG,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  cardArtist: {
    fontSize: 11,
    color: "#666",
  },
});
