import React, { useEffect, useState } from "react";
import {
    BackHandler,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Notice = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selected, setSelected] = useState<Notice | null>(null);

  useEffect(() => {
    // API 호출
    const fetchNotices = async () => {
      try {
        const res = await fetch("https://api.curizm.io/api/v1/member/notices");
        const data = await res.json();
        setNotices(data);
      } catch (e) {
        console.error("공지사항 불러오기 실패", e);
      }
    };
    fetchNotices();
  }, []);

  // 물리 뒤로가기 처리
  useEffect(() => {
    const backAction = () => {
      if (selected) {
        setSelected(null);
        return true;
      }
      return false;
    };
    const handler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => handler.remove();
  }, [selected]);

  const renderItem = ({ item }: { item: Notice }) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    return (
      <View style={S.noticeCard}>
        <Text style={S.noticeTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={S.noticeContent}>
          {item.content} <Text style={S.more} onPress={() => setSelected(item)}>더보기</Text>
        </Text>
        <Text style={S.noticeDate}>{date}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.header}>
        <TouchableOpacity>
          <Text style={S.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={S.headerTitle}>공지사항</Text>
      </View>

      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* 상세 모달 */}
      <Modal visible={!!selected} animationType="slide" transparent={false}>
        <SafeAreaView style={S.safe}>
          <View style={S.header}>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={S.backBtn}>←</Text>
            </TouchableOpacity>
            <Text style={S.headerTitle}>{selected?.title}</Text>
          </View>
          <ScrollView contentContainerStyle={S.detailWrap}>
            <Text style={S.detailDate}>
              {selected && new Date(selected.createdAt).toLocaleDateString()}
            </Text>
            <Text style={S.detailContent}>{selected?.content}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { fontSize: 20, marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: "bold" },

  noticeCard: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  noticeTitle: { fontWeight: "bold", marginBottom: 4, fontSize: 15 },
  noticeContent: { color: "#444", lineHeight: 20 },
  more: { color: "#000", fontWeight: "bold" },
  noticeDate: { marginTop: 6, fontSize: 12, color: "#999" },

  detailWrap: { padding: 16 },
  detailDate: { fontSize: 12, color: "#999", marginBottom: 8 },
  detailContent: { fontSize: 14, lineHeight: 22, color: "#222" },
});
