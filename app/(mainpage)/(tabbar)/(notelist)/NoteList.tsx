import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChatNote, getAllNotes } from "../../../../api/getAllNotes";

export default function NoteList() {
  const [notes, setNotes] = useState<(ChatNote & { color: string })[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getAllNotes();
      setNotes(data ?? []);
    };
    fetchNotes();
  }, []);

  const renderItem = ({ item }: { item: ChatNote & { color: string } }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() =>
        router.push({
          pathname: "/(mainpage)/(tabbar)/(notelist)/FirstartworkDetail",
           params: { note: JSON.stringify(item), bg: item.color },
        })
      }
    >
      <View style={styles.header}>
        {!!item.thumbnail && (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        )}
        <View>
          {!!item.exhibitionName && (
            <Text style={styles.title}>{item.exhibitionName}</Text>
          )}
          {!!item.artistName && (
            <Text style={styles.artist}>{item.artistName}</Text>
          )}
        </View>
      </View>

      {!!item.question && (
        <Text style={styles.question}>{item.question}</Text>
      )}

      <Text style={styles.userInfo}>
        {(item.nickname || "익명") + (item.createdAt ? ` ・ ${item.createdAt}` : "")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        // ✅ 부모가 ScrollView라면 중첩 경고 방지 (리스트 자체 스크롤 꺼짐)
        scrollEnabled={false}
        // 문자열은 항상 Text로
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>노트가 아직 없어요.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexGrow: 1, // 빈 상태에서도 중앙 정렬 위해
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: { color: "#999" },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#00000022",
  },
  title: {
    fontWeight: "600",
    fontSize: 13,
    color: "#fff",
  },
  artist: {
    fontSize: 12,
    color: "#f0f0f0",
  },
  question: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 12,
    color: "#fff",
  },
  userInfo: {
    fontSize: 12,
    color: "#fefefe",
  },
});
