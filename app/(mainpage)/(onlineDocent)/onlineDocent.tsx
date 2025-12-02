import CustomText from "@/app/components/CustomeText";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { getRecentExhibitions } from "../../../api/onlinedocent";

type Exhibition = {
  id: string;
  title: string;
  organizer: string;
  coverImage: string;
  priceCoins: number;
  likesCount: number; // ✅ 추가
  memberLike: boolean;
};

export default function OnlineDocent() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecentExhibitions();
        setExhibitions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("🔥 전시 불러오기 실패:", error);
      }
    })();
  }, []);

  const goExhibition = (item: Exhibition) => {
    router.push({
      pathname: "/(mainpage)/(maincontents)/(Exhi)/Exhipage",
      params: {
        id: String(item.id ?? ""),
        prefill: JSON.stringify({
          title: item.title,
          coverImage: item.coverImage,
          organizer: item.organizer,
        }),
      },
    });
  };

  return (
    <View style={{ marginVertical: 24 }}>
      <CustomText style={styles.sectionTitle}>
        직접 가보지 않아도 실감 나는
      </CustomText>
      <CustomText style={styles.highlight}>온라인 도슨트</CustomText>

      <FlatList
        horizontal
        data={exhibitions}
        keyExtractor={(item) => String(item.id ?? item.title)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => goExhibition(item)}
          >
            {item.coverImage ? (
              <Image
                source={{ uri: item.coverImage }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.image, { backgroundColor: "#eee" }]} />
            )}

            {/* 전시 제목 */}
            <CustomText style={styles.title} numberOfLines={1}>
              {item.title || "제목 없음"}
            </CustomText>

            {/* 주최자 */}
            <CustomText style={styles.place} numberOfLines={1}>
              {item.organizer || "주최 미정"}
            </CustomText>

            {/* 좋아요 + 가격 코인 */}
            <View style={styles.metaRow}>
              <CustomText
                style={[
                  styles.meta,
                  item.memberLike && { color: "#e84118" }, // ❤️ 좋아요 시 빨간색
                ]}
              >
                ♡ {item.likesCount?.toLocaleString?.() ?? 0}
              </CustomText>
              <CustomText style={styles.metaDot}>·</CustomText>
              <CustomText style={styles.meta}>
                💰 {item.priceCoins?.toLocaleString?.() ?? 0}
              </CustomText>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 16,
  },
  highlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e84118",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    width: 160,
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#ccc",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  place: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: "#555",
  },
  metaDot: {
    fontSize: 12,
    color: "#aaa",
    marginHorizontal: 4,
  },
});
