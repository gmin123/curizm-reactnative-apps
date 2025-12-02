import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_H = width * 1.1;

// ✅ HEX → RGBA 변환 함수
const hexToRgba = (hex: string, alpha: number) => {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const isValidUrl = (v?: any) =>
  typeof v === "string" &&
  v.trim() !== "" &&
  v.trim().toLowerCase() !== "string" &&
  /^https?:\/\//.test(v);

export default function FirstartworkDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let note: any = null;
  try {
    note = params.note ? JSON.parse(String(params.note)) : null;
  } catch {
    note = null;
  }
  if (!note) {
    return (
      <View style={[S.screen, { backgroundColor: "#000" }]}>
        <SafeAreaView>
          <StatusBar barStyle="light-content" />
          <Text style={{ color: "#fff", padding: 16 }}>노트 데이터가 없습니다.</Text>
        </SafeAreaView>
      </View>
    );
  }

  // 데이터 정리
  const imageUrl: string =
    note.imageUrl ||
    note.thumbnail ||
    note.coverImage ||
    note.artwork?.thumbnail ||
    note.exhibition?.coverImage ||
    "";
  const artistName: string = note.artistName || note.artist?.name || note.artist || "";
  const artworkTitle: string = note.title || note.artworkTitle || note.artwork?.title || note.label || "";
  const topLine = [artistName, artworkTitle].filter(Boolean).join(", ");
  const subLine: string = note.source || note.groupName || "AWA";
  const question: string = note.question || note.q || note.prompt || "";

  const userName: string = note.memberName || note.nickname || "사용자 이름";
  const profileImg: string | undefined = [note.memberProfileImg, note.profileImg, note.userImage, note.memberImage].find(isValidUrl);

  const bg = (typeof params.bg === "string" && params.bg) || note.color || "#1e2329";
  const accent = (typeof params.accent === "string" && params.accent) || "#6aa8b3";
  const initial = (userName?.trim()?.[0] ?? "A").toUpperCase();

  const normalized = {
    imageUrl,
    artistName,
    title: artworkTitle,
    source: subLine,
    question,
    memberName: userName,
    memberProfileImg: profileImg,
  };

  const goSecond = () => {
    router.push({
      pathname: "/(mainpage)/(tabbar)/(notelist)/SecondartworkDetail",
      params: { note: JSON.stringify({ ...note, ...normalized }), bg, accent },
    });
  };

  return (
    <View style={[S.screen, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView>
        <View style={S.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={S.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ 이미지 섹션 */}
        <View style={S.imageSection}>
          {!!imageUrl && <Image source={{ uri: imageUrl }} style={S.image} />}

          {/* ✅ bgColor 기반 그라데이션 */}
          <LinearGradient
            pointerEvents="none"
            colors={[
              hexToRgba(bg, 0),   // 완전 투명
              hexToRgba(bg, 0.2),
              hexToRgba(bg, 0.5),
              hexToRgba(bg, 0.85),
              hexToRgba(bg, 1),   // 완전 배경색
            ]}
            locations={[0, 0.45, 0.7, 0.85, 1]}
            style={S.gradientOverlay}
          />
        </View>

        {/* ✅ 텍스트 섹션 */}
        <View style={[S.textSection, { backgroundColor: bg }]}>
          {!!topLine && <Text style={S.topLine}>{topLine}</Text>}
          {!!subLine && <Text style={S.subLine}>{subLine}</Text>}
          {!!question && <Text style={S.bigQ}>{question}</Text>}

          <View style={S.bottomRow}>
            <View style={S.userChip}>
              {isValidUrl(profileImg) ? (
                <Image source={{ uri: profileImg! }} style={S.avatarImg} />
              ) : (
                <View style={[S.avatarLetter, { backgroundColor: accent }]}>
                  <Text style={S.avatarLetterTxt}>{initial}</Text>
                </View>
              )}
              <Text style={S.userName}>{userName}</Text>
            </View>

            <TouchableOpacity onPress={goSecond} style={S.ctaBtn}>
              <Text style={S.ctaText}>Curi 답변 보기  〉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  closeIcon: { fontSize: 20, color: "#fff" },

  imageSection: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    height: IMAGE_H,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    zIndex: 2,
  },

  textSection: {
    flexDirection: "column",
    paddingHorizontal: 22,
    paddingVertical: 38,
    marginTop: 0,
  },
  topLine: {
    color: "#E6EDF5",
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.95,
  },
  subLine: {
    color: "#D0D7E2",
    fontSize: 11,
    marginTop: 4,
    opacity: 0.82,
    textTransform: "uppercase",
  },
  bigQ: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "800",
    marginTop: 18,
  },
  bottomRow: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "62%",
  },
  avatarImg: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#00000022" },
  avatarLetter: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", opacity: 0.98 },
  avatarLetterTxt: { color: "#fff", fontWeight: "900", fontSize: 11 },
  userName: { color: "#F2F5FA", fontSize: 12, opacity: 0.95 },
  ctaBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  ctaText: { color: "#F2F5FA", fontSize: 13, fontWeight: "800", opacity: 0.98 },
});
