// components/HorizontalCardSlider.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";

// 서버 응답을 camelCase로 매핑해주는 fetcher를 사용하세요.
import { getExhibitionBanner } from "../../../api/homethisexhi";

type BannerItem = {
  id: string | number;
  title: string;
  introduction: string;
  coverImage: string;
  likes?: number;         // 0 또는 undefined면 숨김
  thoughts?: number;      // 0 또는 undefined면 숨김
  durationTime?: string;  // 없으면 숨김
};

type Props = {
  data?: BannerItem[];
  fetcher?: () => Promise<BannerItem[]>;
  gap?: number;
  peek?: number;
  title?: string;
};

export default function HorizontalCardSlider({
  data: dataProp,
  fetcher = getExhibitionBanner,
  gap = 14,
  peek = 18,
  title = "요즘 이 전시",
}: Props) {
  const [containerW, setContainerW] = useState<number | null>(null);
  const [data, setData] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(!dataProp);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (dataProp && dataProp.length) {
        setData(dataProp);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await (fetcher?.() ?? Promise.resolve([]));
        if (mounted) setData(Array.isArray(res) ? res : []);
      } catch (e) {
        if (mounted) setData([]);
        console.warn("[HorizontalCardSlider] fetch error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dataProp, fetcher]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w && w !== containerW) setContainerW(w);
  };

  const cardW = useMemo(() => {
    if (!containerW) return 0;
    return containerW - peek * 2;
  }, [containerW, peek]);

  const snapInterval = useMemo(() => cardW + gap, [cardW, gap]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems?.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index!);
      }
    }
  );

  return (
    <View style={s.wrap} onLayout={onLayout}>
      <Text style={s.sectionTitle}>{title}</Text>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} />}

      {!loading && (!data || data.length === 0) && (
        <Text style={s.empty}>전시를 불러오지 못했어요.</Text>
      )}

      {!loading && data.length > 0 && containerW ? (
        <>
          <FlatList
            horizontal
            data={data}
            keyExtractor={(it) => String(it.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: peek }}
            ItemSeparatorComponent={() => <View style={{ width: gap }} />}
            snapToAlignment="start"
            snapToInterval={snapInterval}
            decelerationRate={Platform.select({ ios: "fast", android: 0.98 }) as any}
            pagingEnabled={false}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item }) => <BannerCard item={item} width={cardW} />}
          />

          <View style={s.dots}>
            {data.map((_, i) => (
              <View
                key={i}
                style={[s.dot, currentIndex === i ? s.dotActive : s.dotInactive]}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function BannerCard({ item, width }: { item: BannerItem; width: number }) {
  const goDetail = () =>
    router.push({
      pathname: "/Exhipage",

      params: {
        id: String(item.id),
        title: item.title,
        introduction: item.introduction,
        coverImage: item.coverImage,
        likes: String(item.likes ?? 0),
        thoughts: String(item.thoughts ?? 0),
        durationTime: String(item.durationTime ?? ""),
      },
    });

  const clamp = (s: any, n: number) => {
    const str = String(s ?? "");
    return str.length > n ? str.slice(0, n).trim() + "..." : str;
  };

  const title30 = clamp(item.title, 30);           // 30자 제한
  const intro24 = clamp(item.introduction, 24);    // 24자 제한

  // 표시할 메타만 모아두고 사이에만 구분점 출력
  const metaNodes: React.ReactNode[] = [];
  if (typeof item.likes === "number" && item.likes > 0) {
    metaNodes.push(
      <View key="likes" style={s.metaLikeRow}>
        <Ionicons name="heart" size={12} color="rgba(255,255,255,0.9)" />
        <Text style={[s.meta, { marginLeft: 4 }]}>{item.likes}</Text>
      </View>
    );
  }
  if (typeof item.thoughts === "number" && item.thoughts > 0) {
    metaNodes.push(
      <Text key="thoughts" style={s.meta}>생각 {item.thoughts}</Text>
    );
  }
  if (item.durationTime) {
    metaNodes.push(
      <Text key="dur" style={s.meta}>{item.durationTime}</Text>
    );
  }

  return (
    <Pressable onPress={goDetail} style={{ width }}>
      <View style={[s.card, { width, height: Math.round(width * 1.2) }]}>
        <ImageBackground
          source={{ uri: item.coverImage }}
          resizeMode="cover"
          style={s.bg}
          imageStyle={s.bgImage}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.85)"]}
            style={s.gradient}
          />

          <View style={s.textBox}>
            <Text
              style={s.title}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title30}
            </Text>

            <Text
              style={s.desc}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {intro24}
            </Text>

            {metaNodes.length > 0 && (
              <View style={s.metaRow}>
                {metaNodes.map((node, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <Text style={s.metaDot}>·</Text>}
                    {node}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>

          <Pressable onPress={goDetail} style={s.playBtn} hitSlop={8}>
            <View style={s.playCircle}>
              <Ionicons name="play" size={20} color="#fff" style={{ left: 1 }} />
            </View>
          </Pressable>
        </ImageBackground>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: 6, width: "100%" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginLeft: 18,
    marginBottom: 10,
  },
  empty: { marginTop: 12, color: "#888", marginLeft: 18 },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#eaeaea",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bg: { flex: 1 },
  bgImage: { width: "100%", height: "100%" },
  gradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },

  textBox: { position: "absolute", left: 16, right: 70, bottom: 16 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 21, // 두 줄 레이아웃 안정화
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    marginBottom: 10,
  },

  metaRow: { flexDirection: "row", alignItems: "center" },
  metaLikeRow: { flexDirection: "row", alignItems: "center" },
  meta: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  metaDot: { color: "rgba(255,255,255,0.6)", marginHorizontal: 6 },

  playBtn: { position: "absolute", right: 14, bottom: 14 },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff6a3d",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  // 하단 페이지 인디케이터
  dots: {
    marginTop: 10,
    marginBottom: 4,
    alignSelf: "center",
    flexDirection: "row",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: "#6b7cff" },
  dotInactive: { backgroundColor: "#d0d4e0" },
});
