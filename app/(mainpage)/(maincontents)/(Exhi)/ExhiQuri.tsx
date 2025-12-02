// app/(mainpage)/(maincontents)/(Exhi)/ExhiQuri.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type QuriItem = {
  title: string;
  artist: string;
  thumbnail: string;
  id?: string;
  exhibitionId: string; // 반드시 필요(질문 API가 전시 기준)
};

type Props = {
  /** 현재 재생 중 작품/전시설명 데이터 */
  item: QuriItem;
  /** 확인 버튼을 눌렀을 때 부모가 입력 모달을 보여줄 콜백 */
  onConfirm: (item: QuriItem) => void;
  /** (선택) 컴포넌트 외부에서 모달 오픈을 제어하고 싶으면 true */
  initiallyOpen?: boolean;
};

export default function ExhiQuri({ item, onConfirm, initiallyOpen = false }: Props) {
  const [open, setOpen] = useState(initiallyOpen);

  const handleOpenGuide = () => setOpen(true);
  const handleCloseGuide = () => setOpen(false);
  const handleAgree = () => {
    setOpen(false);
    onConfirm(item); // 부모(ExhiAudioPlayer)에서 AudioQuestionInput visible=true 처리
  };

  return (
    <>
      {/* 카드: "큐리에게 질문하기" */}
      <TouchableOpacity activeOpacity={0.9} onPress={handleOpenGuide} style={S.card}>
        <View style={S.cardHeader}>
          <Text style={S.cardHeaderText}>큐리에게 질문하기</Text>
          <MaterialIcons name="chevron-right" size={18} color="#111" />
        </View>

        <View style={S.inputRow}>
          {!!item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={S.avatar} />
          ) : (
            <View style={[S.avatar, S.avatarFallback]}>
              <MaterialIcons name="person" size={16} color="#cfcfcf" />
            </View>
          )}
          <Text style={S.placeholder}>생각을 물어보세요</Text>
        </View>
      </TouchableOpacity>

      {/* 가이드 모달(바텀시트 스타일) */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={handleCloseGuide}>
        <View style={S.backdrop}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleCloseGuide} />
          <View style={S.sheet}>
            <View style={S.sheetHeader}>
              <Text style={S.sheetTitle}>이런 질문은 싫어요</Text>
              <TouchableOpacity onPress={handleCloseGuide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={20} color="#445" />
              </TouchableOpacity>
            </View>

            <View style={S.ruleRow}>
              <View style={S.ruleBadge}><Text style={S.ruleBadgeText}>1</Text></View>
              <Text style={S.ruleText}>욕설, 비방 등 작품과 관련없는 글</Text>
            </View>
            <View style={S.ruleRow}>
              <View style={S.ruleBadge}><Text style={S.ruleBadgeText}>2</Text></View>
              <Text style={S.ruleText}>작품과 관련 없는 글이나 광고</Text>
            </View>
            <View style={S.ruleRow}>
              <View style={S.ruleBadge}><Text style={S.ruleBadgeText}>3</Text></View>
              <Text style={S.ruleText}>다른 관람객을 불쾌하게 하는 글</Text>
            </View>

            <TouchableOpacity activeOpacity={0.9} style={S.confirmBtn} onPress={handleAgree}>
              <Text style={S.confirmText}>확인했어요</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const S = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: "#F3F7FB",
    borderRadius: 14,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderText: {
    fontWeight: "800",
    color: "#111",
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  avatar: { width: 26, height: 26, borderRadius: 13, marginRight: 8, backgroundColor: "#ddd" },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  placeholder: { color: "#98A2B3", fontSize: 13 },

  // bottom sheet
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
  },
  sheetTitle: { fontWeight: "800", color: "#111", fontSize: 16 },
  ruleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ruleBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  ruleBadgeText: { color: "#4756D8", fontWeight: "800", fontSize: 12 },
  ruleText: { color: "#333", fontSize: 13 },
  confirmBtn: {
    backgroundColor: "#FF6B45",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    marginTop: 14,
  },
  confirmText: { color: "#fff", fontWeight: "800" },
});
