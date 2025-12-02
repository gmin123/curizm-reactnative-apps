// app/(mainpage)/(maincontents)/(Exhi)/ExhiPageModal.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Detail = {
  id?: string;
  title?: string | null;
  organizer?: string | null;
  coverImage?: string | null; // 이미지는 사용 안 함
  viewingTime?: string | null;
  address?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  introduction?: string | null;
  likes?: number;
  likesCount?: number;
  thoughts?: number;
  thoughtsCount?: number;
  sound?: string | null;
  durationTime?: number | null;
  price?: string | null;
  priceCoins?: number | null;
  tts?: string | null;
  subtitles?: string | null;
  memberLike?: boolean | null;
};

const hasText = (v?: string | null) => typeof v === "string" && v.trim().length > 0;
const hasNum = (v?: number | null) => typeof v === "number" && Number.isFinite(v);

function fmtDate(v?: string | null) {
  if (!hasText(v)) return "";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}년 ${mm}월 ${dd}일`;
}

interface ExhiPageModalProps {
  visible: boolean;
  onClose: () => void;
  detail: Detail;
}

export default function ExhiPageModal({ visible, onClose, detail }: ExhiPageModalProps) {
  if (!visible || !detail) {
    return null;
  }

  // 기간 문자열 (둘 다 없으면 섹션 숨김)
  const from = fmtDate(detail.startDate);
  const to = fmtDate(detail.endDate);
  const period = hasText(from) || hasText(to) ? `${from}${hasText(from) && hasText(to) ? " ~ " : ""}${to}` : "";

  // 입장료 문자열 (둘 다 없으면 섹션 숨김)
  const hasPrice = hasText(detail.price) || hasNum(detail.priceCoins);
  const priceLine = hasPrice
    ? [
        hasText(detail.price) ? String(detail.price)!.trim() : "",
        hasNum(detail.priceCoins) ? `${Number(detail.priceCoins)} 코인` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <View style={S.modalContainer}>
      {/* 상단 바 */}
      <View style={S.topBar}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={S.topTitle}>전시 정보</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        {/* 제목 */}
        {hasText(detail.title) && <Section label="전시 제목" value={String(detail.title)} />}

        {/* 소개 */}
        {hasText(detail.introduction) && (
          <Section label="전시 소개" value={String(detail.introduction)} multiline />
        )}

        {/* 주최 */}
        {hasText(detail.organizer) && <Section label="주최" value={String(detail.organizer)} />}

        {/* 주소 */}
        {hasText(detail.address) && <Section label="주소" value={String(detail.address)} />}

        {/* 기간 */}
        {hasText(period) && <Section label="기간" value={period} />}

        {/* 관람 시간 */}
        {hasText(detail.viewingTime) && <Section label="관람 시간" value={String(detail.viewingTime)} />}

        {/* 입장료 */}
        {hasText(priceLine) && <Section label="입장료" value={priceLine} />}
      </ScrollView>
    </View>
  );
}

function Section({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={S.label}>{label}</Text>
      <Text style={[S.value, multiline && { lineHeight: 22 }]}>{value}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  topTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 6, marginTop: 8 },
  value: { fontSize: 14, color: "#111" },
});
