import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ArtistIntro() {
  const router = useRouter();
  const { name, intro } = useLocalSearchParams<{ name: string; intro: string }>();

  // 디버깅을 위한 로그
  console.log("🎨 ArtistIntro 파라미터:", { name, intro, nameType: typeof name, introType: typeof intro });

  // 안전하게 문자열로 변환
  const safeName = String(name || "이름 없음");
  const safeIntro = String(intro || "소개 없음");

  console.log("🎨 ArtistIntro 변환된 값:", { safeName, safeIntro });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.topActions}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.actionIcon}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>작가 소개</Text>
        <View style={{ width: 20 }} /> {/* 빈칸 자리 맞춤 */}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8 }}>이름</Text>
        <Text style={{ marginBottom: 20 }}>
          {safeName && safeName !== "undefined" ? safeName : "이름 없음"}
        </Text>

        <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8 }}>소개</Text>
        <Text style={{ lineHeight: 22 }}>
          {safeIntro && safeIntro !== "undefined" ? safeIntro : "소개 없음"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  actionIcon: {
    fontSize: 18,
    color: "#111",
    fontWeight: "600",
  },
});
