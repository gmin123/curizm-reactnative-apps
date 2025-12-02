import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ✅ 안전한 텍스트 렌더링 컴포넌트
const SafeText = ({
  children,
  fallback = "",
  style,
  numberOfLines,
  ...props
}: {
  children: any;
  fallback?: string;
  style?: any;
  numberOfLines?: number;
  [key: string]: any;
}) => {
  let safeValue: string;
  if (children === null || children === undefined) safeValue = fallback;
  else if (typeof children === "boolean") safeValue = children.toString();
  else if (typeof children === "number") safeValue = children === 0 ? "0" : String(children);
  else if (Array.isArray(children)) safeValue = children.join(", ");
  else if (typeof children === "object") {
    try {
      safeValue = JSON.stringify(children);
    } catch {
      safeValue = fallback;
    }
  } else {
    safeValue = String(children);
  }
  return (
    <Text style={style} numberOfLines={numberOfLines} {...props}>
      {safeValue}
    </Text>
  );
};

// ✅ 타입 정의
type OfflineArtwork = {
  id: string;
  title?: string;
  artist?: string;
  localThumbUri?: string;
  localAudioUri?: string;
  durationTime?: number;
};

type ExhibitionArtwork = {
  id: string;
  name: string;
  artistName: string;
  thumbnail: string;
  sound: string;
  durationTime: number;
  memberLike?: boolean;
};

type Props = {
  exhibitionId: string;
  artworks?: (OfflineArtwork | ExhibitionArtwork)[];
  onSyncWorks?: (works: ExhibitionArtwork[]) => void;
  onSelectWork?: (workIndex: number) => void;
  listHeader?: React.ReactNode;
  style?: any;
};

const ROW_H = 60;

export const OffExhiArtworks: React.FC<Props> = ({
  exhibitionId,
  artworks = [],
  onSyncWorks,
  onSelectWork,
  listHeader,
  style,
}) => {
  const [likedArtworks, setLikedArtworks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [convertedArtworks, setConvertedArtworks] = useState<ExhibitionArtwork[]>([]);
  const hasSynced = useRef(false); // ✅ 무한 루프 방지

  // ✅ artworks → ExhibitionArtwork 구조로 변환 (최초 1회만)
  useEffect(() => {
    if (!artworks?.length || hasSynced.current) return;

    const mapped = artworks.map((art: any) => ({
      id: art.id,
      name: art.name || art.title || "무제",
      artistName: art.artistName || art.artist || "작가 미상",
      thumbnail: art.thumbnail || art.localThumbUri || "",
      sound: art.sound || art.localAudioUri || "",
      durationTime: typeof art.durationTime === "number" ? art.durationTime : 0,
      memberLike: art.memberLike || false,
    }));

    setConvertedArtworks(mapped);
    hasSynced.current = true;

    // ✅ 상위로 1회만 동기화
    if (typeof onSyncWorks === "function") {
      onSyncWorks(mapped);
    }
  }, [artworks]);

  // ❤️ 좋아요 토글
  const toggleLike = useCallback((id: string) => {
    setLikedArtworks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // 🎧 작품 선택
  const handleSelectWork = (index: number) => {
    console.log("🎨 [OffExhiArtworks] 작품 선택:", index);
    onSelectWork?.(index);
  };

  // 🎨 리스트 아이템 렌더링
  const renderItem = ({ item, index }: { item: ExhibitionArtwork; index: number }) => (
    <Pressable onPress={() => handleSelectWork(index)} style={S.row}>
      <View style={S.indexBlock}>
        <SafeText style={S.index}>{index + 1}</SafeText>
      </View>

      <Image
        source={
          item.thumbnail
            ? { uri: item.thumbnail }
            : require("../../../../assets/images/icon.png")
        }
        style={S.thumb}
      />

      <View style={S.meta}>
        <SafeText style={S.title} numberOfLines={1} fallback="작품 제목">
          {item.name}
        </SafeText>

        <SafeText style={S.sub} fallback="작가 이름 · 1분">
          {`${item.artistName || "작가 이름"} · ${
            item.durationTime && item.durationTime > 0
              ? `${Math.ceil(item.durationTime / 60)}분`
              : "1분"
          }`}
        </SafeText>
      </View>

      <Pressable onPress={() => toggleLike(item.id)} style={S.heartWrap}>
        <Ionicons
          name={likedArtworks[item.id] ? "heart" : "heart-outline"}
          size={22}
          color={likedArtworks[item.id] ? "#ef4444" : "#9ca3af"}
        />
      </Pressable>
    </Pressable>
  );

  // 로딩 표시
  if (loading) {
    return (
      <View style={[style, S.center]}>
        <ActivityIndicator />
        <SafeText>작품을 불러오는 중...</SafeText>
      </View>
    );
  }

  // 최종 렌더링
  return (
    <View style={[style, { flex: 1 }]}>
      {listHeader}
      <FlatList
        data={convertedArtworks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center" }}>
            <SafeText>작품이 없습니다.</SafeText>
          </View>
        }
      />
    </View>
  );
};

// ✅ 스타일 정의
const S = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_H,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  indexBlock: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  index: {
    fontSize: 12,
    color: "#9ca3af",
    width: 18,
    textAlign: "right",
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },
  meta: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  sub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  heartWrap: {
    padding: 8,
    marginLeft: 8,
  },
});
