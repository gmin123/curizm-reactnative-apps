import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getExhibitionArtworks } from "../../../../api/exhi/getExhibitionArtworks";

// 타입 정의
export interface ExhibitionArtwork {
  id: string;
  name: string;
  thumbnail: string;
  sound: string;
  durationTime: number;
  artistName: string;
  memberLike?: boolean;
  groupOrder?: number;
  groupName?: string | null;
}

// 안전한 텍스트 렌더링 컴포넌트
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

type Props = {
  exhibitionId: string;
  onSyncWorks?: (works: ExhibitionArtwork[]) => void;
  onSelectWork?: (workIndex: number) => void;
  listHeader?: React.ReactNode;
  style?: any;
};

const ROW_H = 60;

export const ExhiArtworks: React.FC<Props> = ({
  exhibitionId,
  onSyncWorks,
  onSelectWork,
  listHeader,
  style,
}) => {
  const [likedArtworks, setLikedArtworks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<ExhibitionArtwork[]>([]);

  const toggleLike = useCallback((id: string) => {
    setLikedArtworks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSelectWork = (index: number) => {
    console.log("📥 ExhiArtworks: handleSelectWork 수신", index);
    if (typeof onSelectWork === "function") onSelectWork(index);
  };

  useEffect(() => {
    if (!exhibitionId) return;
    setLoading(true);

    getExhibitionArtworks(exhibitionId)
      .then((result) => {
        console.log("🎨 ExhiArtworks fetched result:", result);

        // ✅ getExhibitionArtworks는 { artworks, total } 구조이므로 분리
        const artworks = Array.isArray(result.artworks) ? result.artworks : [];

        setWorks(artworks);
        if (onSyncWorks) onSyncWorks(artworks);
      })
      .catch((error) => {
        console.error("❌ Error fetching artworks:", error);
        setWorks([]);
      })
      .finally(() => setLoading(false));
  }, [exhibitionId]); // ✅ onSyncWorks dependency 제거 (무한 루프 방지)

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
            typeof item.durationTime === "number" && item.durationTime > 0
              ? `${item.durationTime}초`
              : "60초"
          }`}
        </SafeText>
      </View>

      <Pressable onPress={() => toggleLike(item.id)} style={S.heartWrap}>
        <Ionicons
          name={
            (likedArtworks[item.id] ?? item.memberLike)
              ? "heart"
              : "heart-outline"
          }
          size={22}
          color={
            (likedArtworks[item.id] ?? item.memberLike)
              ? "#ef4444"
              : "#9ca3af"
          }
        />
      </Pressable>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[style, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
        <SafeText>작품을 불러오는 중...</SafeText>
      </View>
    );
  }

  return (
    <View style={[style, { flex: 1 }]}>
      {listHeader}
      <FlatList
        data={works}
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

const S = StyleSheet.create({
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
