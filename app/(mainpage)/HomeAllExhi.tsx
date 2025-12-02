import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BASE_URL = "https://api.curizm.io"; // 필요시 .com 으로 변경

export default function HomeAllExhi() {
  const [paid, setPaid] = useState([]);
  const [free, setFree] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- API Fetch ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paidRes, freeRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/home/exhibitions/paid`),
          fetch(`${BASE_URL}/api/v1/home/exhibitions/free`),
        ]);
        const paidData = await paidRes.json();
        const freeData = await freeRes.json();
        setPaid(paidData);
        setFree(freeData);
      } catch (e) {
        console.error("전시 데이터 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={S.loadingWrap}>
        <ActivityIndicator size="large" color="#FF6A3D" />
      </View>
    );
  }

  // ---------------- 렌더링 함수 ----------------
  const renderExhibitionCard = ({ item }) => (
    <TouchableOpacity style={S.card} activeOpacity={0.85}>
      <View style={S.thumbWrap}>
        <Image
          source={{ uri: item.coverImage }}
          style={S.thumb}
          resizeMode="cover"
        />

        {item.priceCoins > 0 && (
          <View style={S.coinTag}>
            <Text style={S.coinTxt}>{item.priceCoins} 코인</Text>
          </View>
        )}

        {/* 구매완료 표시 (나중에 상태 확인으로 교체) */}
        {/* <View style={S.soldTag}><Text style={S.soldTxt}>구매완료</Text></View> */}
      </View>

      <Text style={S.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={S.place} numberOfLines={1}>
        {item.organizer}
      </Text>
      <View style={S.metaRow}>
        <Text style={S.meta}>❤️ {item.likes}</Text>
        <Text style={S.meta}>· 생각 {item.thoughts}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, data, isPaid) => (
    <View style={S.section}>
      <View style={S.sectionHeader}>
        <Text
          style={[
            S.sectionTitle,
            { color: isPaid ? "#FF5B55" : "#F05B3C" },
          ]}
        >
          {title}
        </Text>
        <TouchableOpacity>
          <Text style={S.moreBtn}>전체보기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderExhibitionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 6 }}
      />
    </View>
  );

  return (
    <ScrollView style={S.container}>
      {renderSection("유료 전시", paid, true)}
      {renderSection("무료 전시", free, false)}
    </ScrollView>
  );
}

// ---------------- 스타일 ----------------
const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: 16.5,
  },
  moreBtn: {
    backgroundColor: "#FF6A3D",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 12.5,
  },
  card: {
    width: 145,
    marginRight: 14,
  },
  thumbWrap: {
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },
  coinTag: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "#FF6A3D",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coinTxt: {
    color: "#fff",
    fontSize: 11.5,
    fontWeight: "bold",
  },
  soldTag: {
    position: "absolute",
    alignSelf: "center",
    top: 12,
    backgroundColor: "#3338",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soldTxt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11.5,
  },
  title: {
    fontWeight: "800",
    fontSize: 13.8,
    marginTop: 8,
    color: "#0F172A",
  },
  place: {
    fontSize: 12.2,
    color: "#6B7280",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  meta: {
    fontSize: 11.8,
    color: "#9CA3AF",
    marginRight: 6,
  },
});
