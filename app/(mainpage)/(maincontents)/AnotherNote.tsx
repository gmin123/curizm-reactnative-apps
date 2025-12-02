// app/(mainpage)/(maincontents)/AnotherNote.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getMostSharedArtworks,
  SharedArtwork,
} from "../../../api/home/artworks/homeartworks";

interface AnotherNoteProps {
  style?: any;
}

export default function AnotherNote({ style }: AnotherNoteProps) {
  const router = useRouter();
  const [data, setData] = useState<SharedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const list = await getMostSharedArtworks(ac.signal);
        setData(list);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message ?? "불러오기에 실패했습니다.");
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // FirstartworkDetail이 기대하는 필드 이름으로 최소 정규화
  const buildNotePayload = useCallback((it: SharedArtwork) => {
    return {
      // FirstartworkDetail.tsx가 우선적으로 찾는 키들
      imageUrl: it.thumbnail,
      thumbnail: it.thumbnail,
      coverImage: it.thumbnail,

      artistName: it.artistName,
      title: it.name,
      artworkTitle: it.name,

      question: it.question,
      sound: it.sound,

      memberLike: it.memberLike,
      chatId: it.chatId,

      // 추가 메타(옵션)
      source: "AWA",
      groupName: "AWA",
    };
  }, []);

  const onPressItem = useCallback(
    (it: SharedArtwork, rank: number) => {
      const note = buildNotePayload(it);
      // 배경/포인트 컬러를 간단히 순번으로 변조(디자인 톤 유지)
      const BG = ["#1e2329", "#20242c", "#1b2633", "#202833", "#1e2730"];
      const ACCENT = ["#6aa8b3", "#f25f5c", "#7f8cff", "#ff8a5b", "#4dd0e1"];
      const bg = BG[(rank - 1) % BG.length];
      const accent = ACCENT[(rank - 1) % ACCENT.length];

      router.push({
        pathname: "/(mainpage)/(tabbar)/(notelist)/FirstartworkDetail",
        params: {
          note: JSON.stringify(note),
          bg,
          accent,
        },
      });
    },
    [buildNotePayload, router]
  );

  const ITEM_H = 92;

  const renderItem = ({
    item,
    index,
  }: {
    item: SharedArtwork;
    index: number;
  }) => {
    const rank = index + 1;
    const hearted = !!item.memberLike;

    // 공통 탭 핸들러
    const go = () => onPressItem(item, rank);

    return (
      <View style={s.itemWrap}>
        {/* 1행: 순위, 썸네일, 제목/작가, 하트 */}
        <TouchableOpacity style={s.row} activeOpacity={0.85} onPress={go}>
          <Text style={s.rank}>{rank}</Text>

          <Image source={{ uri: item.thumbnail }} style={s.thumb} />

          <View style={s.info}>
            <Text style={s.title} numberOfLines={1}>
              {item.name || "작품 제목"}
            </Text>
            <Text style={s.artist} numberOfLines={1}>
              {item.artistName || "작가 이름"}
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {}}
          >
            <Ionicons
              name={hearted ? "heart" : "heart-outline"}
              size={20}
              color={hearted ? "#f25f5c" : "#b3bdc7"}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* 2행: NEW 뱃지 + 질문 + 꺾쇠 → 탭 시도 상세로 */}
        {item.question ? (
          <TouchableOpacity style={s.questionPill} activeOpacity={0.85} onPress={go}>
            <Text style={s.badge}>NEW</Text>
            <Text style={s.question} numberOfLines={1}>
              {item.question}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9aa6b2" />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const keyExtractor = (it: SharedArtwork, idx: number) =>
    (it.id ?? String(idx)) as string;

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_H,
    offset: ITEM_H * index,
    index,
  });

  const empty = useMemo(() => {
    if (loading) return null;
    if (err) return <Text style={s.empty}>{err}</Text>;
    return <Text style={s.empty}></Text>;
  }, [loading, err]);

  return (
    <View style={[s.container, style]}>
      <Text style={s.header}>
        다른 관람객들의{"\n"}
        <Text style={s.highlight}>생각이 최근 공유된 작품</Text>
      </Text>

      {loading ? (
        <ActivityIndicator style={{ paddingVertical: 16 }} />
      ) : (
        <>
          {empty}
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={s.sep} />}
            scrollEnabled={false}
            getItemLayout={getItemLayout}
            removeClippedSubviews
            initialNumToRender={8}
            windowSize={5}
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
    width: "100%",
  },
  header: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    lineHeight: 22,
    marginBottom: 8,
  },
  highlight: { color: "#ff5a36" },
  itemWrap: { paddingVertical: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  rank: { width: 22, textAlign: "left", fontSize: 15, fontWeight: "700", color: "#333" },
  thumb: { width: 48, height: 48, borderRadius: 8, marginHorizontal: 10, backgroundColor: "#e9eef3" },
  info: { flex: 1, justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700", color: "#2b2f33", marginBottom: 2 },
  artist: { fontSize: 12, color: "#7a8590" },
  questionPill: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 22 + 10 + 48 + 10,
    marginTop: 8,
    backgroundColor: "#f3f6fb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  badge: {
    backgroundColor: "#ff5a36",
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  question: { flex: 1, fontSize: 13, color: "#2f3a44" },
  sep: { height: 1, backgroundColor: "#eef1f5" },
  empty: { color: "#8a97a6", paddingVertical: 8 },
});
