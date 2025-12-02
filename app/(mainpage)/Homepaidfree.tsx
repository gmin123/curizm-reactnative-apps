import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// API
import {
  getPaidExhibitions,
  getFreeExhibitions,
  type HomeExhibitionCard,
} from "../../api/paidfree";

type SectionProps = {
  title: string;                 // 섹션 제목 (유료 전시 / 무료 전시)
  color?: string;                // 제목 색상
  data: HomeExhibitionCard[];
  loading: boolean;
  onMore: () => void;            // 전체보기
  onPressCard: (item: HomeExhibitionCard) => void;
};

function Section({
  title,
  color = "#FF6A3D",
  data,
  loading,
  onMore,
  onPressCard,
}: SectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      {/* 섹션 헤더 */}
      <View style={S.headerRow}>
        <Text style={[S.sectionTitle, { color }]}>{title}</Text>
        <TouchableOpacity style={S.moreBtn} onPress={onMore} activeOpacity={0.9}>
          <Text style={S.moreTxt}>전체보기</Text>
        </TouchableOpacity>
      </View>

      {/* 리스트 */}
      {loading ? (
        <View style={{ paddingVertical: 18 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(it) => it.id}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => <Card item={item} onPress={() => onPressCard(item)} />}
        />
      )}
    </View>
  );
}

function Card({ item, onPress }: { item: HomeExhibitionCard; onPress: () => void }) {
  const isPaid = (item.priceCoins ?? 0) > 0;

  // '좋아요/생각' 0이면 안보이게
  const likeText = typeof item.likes === "number" && item.likes > 0 ? `${item.likes}` : "";
  const thoughtText =
    typeof item.thoughts === "number" && item.thoughts > 0 ? `${item.thoughts}` : "";

  return (
    <Pressable style={S.card} onPress={onPress}>
      {/* 썸네일 */}
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} style={S.image} />
      ) : (
        <View style={[S.image, { backgroundColor: "#EEE" }]} />
      )}

      {/* 가격 배지(유료) */}
      {isPaid && (
        <View style={S.priceBadge}>
          <Ionicons name="logo-usd" size={12} color="#fff" />
          <Text style={S.priceTxt}>{item.priceCoins}</Text>
        </View>
      )}

      {/* 본문 */}
      <View style={{ paddingHorizontal: 8, paddingVertical: 10 }}>
        <Text style={S.title} numberOfLines={1}>
          {item.title || "전시 제목"}
        </Text>
        <Text style={S.place} numberOfLines={1}>
          {item.organizer || "전시 장소"}
        </Text>

        {/* 메타: 좋아요/생각 (조건부) */}
        {(likeText || thoughtText) && (
          <View style={S.metaRow}>
            {!!likeText && (
              <View style={S.metaItem}>
                <Ionicons name="heart" size={12} color="#6B7280" />
                <Text style={S.metaTxt}> {likeText}</Text>
              </View>
            )}
            {!!likeText && !!thoughtText && <Text style={S.metaDot}>·</Text>}
            {!!thoughtText && (
              <View style={S.metaItem}>
                <Ionicons name="chatbubble-ellipses" size={12} color="#6B7280" />
                <Text style={S.metaTxt}> 생각 {thoughtText}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function Homepaidfree() {
  const router = useRouter();

  const [paid, setPaid] = useState<HomeExhibitionCard[]>([]);
  const [free, setFree] = useState<HomeExhibitionCard[]>([]);
  const [loadingPaid, setLoadingPaid] = useState(true);
  const [loadingFree, setLoadingFree] = useState(true);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoadingPaid(true);
        const p = await getPaidExhibitions(ac.signal);
        setPaid(p);
      } catch (e) {
        setPaid([]);
      } finally {
        setLoadingPaid(false);
      }
    })();

    (async () => {
      try {
        setLoadingFree(true);
        const f = await getFreeExhibitions(ac.signal);
        setFree(f);
      } catch (e) {
        setFree([]);
      } finally {
        setLoadingFree(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const goMorePaid = () =>
    router.push({
      // 전시 목록 화면(탭)으로. paid 초기 탭 파라미터만 전달
      pathname: "/(mainpage)/(Discover)/HomeExhi",
      params: { tab: "paid" },
    });

  const goMoreFree = () =>
    router.push({
      pathname: "/(mainpage)/(Discover)/HomeExhi",
      params: { tab: "free" },
    });

  const goDetail = (item: HomeExhibitionCard) => {
    // 상세에서 API 재호출하더라도 UX 빠르게 하려고 프리필 전달
    const prefill = JSON.stringify({
      title: item.title,
      coverImage: item.coverImage,
      organizer: item.organizer ?? "",
      priceCoins: item.priceCoins ?? 0,
    });

    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
      params: { id: String(item.id), prefill },
    });
  };

  // 빈 배열일 때 스켈레톤 3개
  const paidData = useMemo(() => paid.slice(0, 10), [paid]);
  const freeData = useMemo(() => free.slice(0, 10), [free]);

  return (
    <View style={S.container}>
      <Section
        title="유료 전시"
        color="#FF6A3D"
        data={paidData}
        loading={loadingPaid}
        onMore={goMorePaid}
        onPressCard={goDetail}
      />

      <Section
        title="무료 전시"
        color="#FF6A3D"
        data={freeData}
        loading={loadingFree}
        onMore={goMoreFree}
        onPressCard={goDetail}
      />
    </View>
  );
}

const S = StyleSheet.create({
  container: { backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900" },
  moreBtn: {
    marginLeft: "auto",
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  moreTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },

  card: {
    width: 160,
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EEE",
  },
  image: { width: "100%", height: 160, backgroundColor: "#EEE" },

  priceBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },

  title: { fontSize: 13, fontWeight: "800", color: "#111" },
  place: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaTxt: { fontSize: 11, color: "#6B7280" },
  metaDot: { marginHorizontal: 6, color: "#9CA3AF" },
});
 