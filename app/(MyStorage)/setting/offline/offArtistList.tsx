import { Ionicons } from "@expo/vector-icons";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ExhibitionArtist = {
  id: string;
  name: string;
  profileImg?: string;
  memberFollow?: boolean;
};

type Props = {
  exhibitionId: string;
  artists?: ExhibitionArtist[];
};

export const OffArtistList: React.FC<Props> = ({
  exhibitionId,
  artists = [],
}) => {
  const [artistList, setArtistList] = useState<ExhibitionArtist[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ 오프라인 데이터에서 작가명 추출
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);

        if (artists && artists.length > 0) {
          // props로 들어온 artists가 있다면 그대로 사용
          setArtistList(artists);
          setTotal(artists.length);
        } else {
          // AsyncStorage에서 전시 데이터 직접 로드
          const jsonStr = await AsyncStorage.getItem(
            `downloadedExhibition_${exhibitionId}`
          );
          if (!jsonStr) {
            console.warn("⚠️ 오프라인 전시 데이터 없음:", exhibitionId);
            setArtistList([]);
            return;
          }

          const data = JSON.parse(jsonStr);
          const artworks = data.artworks || [];

          // artworks에서 artist 이름 고유 추출
          const uniqueArtists = Array.from(
            new Set(artworks.map((a: any) => a.artist))
          ).filter(Boolean);

          const artistObjects = uniqueArtists.map((name, idx) => ({
            id: `${exhibitionId}_${idx}`,
            name,
            profileImg: "", // 오프라인 데이터엔 프로필 이미지 없음
            memberFollow: false,
          }));

          setArtistList(artistObjects);
          setTotal(artistObjects.length);
          console.log("🎨 [오프라인 작가 목록 로드]", artistObjects);
        }
      } catch (err) {
        console.error("❌ 작가 목록 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, [exhibitionId, artists]);

  const onLoadMore = () => {
    if (!loading && artistList.length < total) {
      setPage((prev) => prev + 1);
    }
  };

  const renderItem = ({ item }: { item: ExhibitionArtist }) => (
    <Pressable style={S.row}>
      <Image
        source={
          item.profileImg
            ? { uri: item.profileImg }
            : require("../../../../assets/images/Cicon.png")
        }
        style={S.avatar}
      />
      <View style={S.meta}>
        <Text style={S.name}>{item.name}</Text>
      </View>
      <Ionicons
        name={item.memberFollow ? "heart" : "heart-outline"}
        size={20}
        color={item.memberFollow ? "#ef4444" : "#9ca3af"}
        style={S.heartWrap}
      />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#6b7280", marginTop: 8 }}>작가 목록 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={artistList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#777" }}>등록된 작가가 없습니다.</Text>
            </View>
          }
          ListFooterComponent={
            loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
          }
        />
      )}
    </View>
  );
};

const S = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  meta: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "column",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  heartWrap: {
    padding: 8,
    marginLeft: 8,
  },
});
