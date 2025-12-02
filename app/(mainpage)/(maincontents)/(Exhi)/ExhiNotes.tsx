import { getExhibitionNotes, type ExhibitionNote } from "../../../../api/exhi/getExhiNotes";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View,
  type StyleProp, type ViewStyle,
} from "react-native";

const PALETTE = ["#6BA6A3","#D46A63","#9BB59A","#6B8BB6","#AE8EBF","#E6A15B","#7D97A5","#B3A58B","#A1B56B","#CC7A8B"];
const colorFromString = (str?: string, fallback = "#6BA6A3") => {
  if (!str) return fallback;
  let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
};

type Props = {
  exhibitionId: string;
  listHeader?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ExhiNotes({ exhibitionId, listHeader, style }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<ExhibitionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPage1 = useCallback(async () => {
    setErrorMsg(null);
    if (!exhibitionId) { setRows([]); setLoading(false); setErrorMsg("전시 ID가 비어있습니다."); return; }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await getExhibitionNotes(String(exhibitionId), 1, { signal: ctrl.signal });
      clearTimeout(t);
      setRows(res?.chats ?? []);
    } catch (e: any) {
      setRows([]);
      setErrorMsg(e?.name === "AbortError" ? "요청이 시간 초과되었습니다." : "노트를 불러오지 못했습니다.");
    } finally { setLoading(false); }
  }, [exhibitionId]);

  useEffect(() => { setLoading(true); fetchPage1(); }, [fetchPage1]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage1();
    setRefreshing(false);
  }, [fetchPage1]);

  const data = useMemo(() => rows, [rows]);

  const renderItem = ({ item }: { item: ExhibitionNote }) => {
    const bg = colorFromString(item.thumbnail || item.id);
    const handlePress = () => {
      const payload = {
        id: item.id, exhibitionId: item.exhibitionId, exhibitionName: item.exhibitionName,
        artistId: item.artistId, title: item.title || item.exhibitionName || "",
        memberName: item.memberName, nickname: item.organizerOrCreator,
        question: item.question ?? "", answer: item.answer ?? "",
        thumbnail: item.thumbnail || item.image || "", createdAt: item.createdAt, color: bg,
      };
      router.push({ pathname: "/(mainpage)/(tabbar)/(notelist)/FirstartworkDetail", params: { note: JSON.stringify(payload), bg } });
    };

    return (
      <TouchableOpacity activeOpacity={0.9} style={[S.card, { backgroundColor: bg }]} onPress={handlePress}>
        <View style={S.header}>
          {!!item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={S.thumbnail} /> : <View style={[S.thumbnail, { backgroundColor: "#00000022" }]} />}
          <View>
            {!!(item.title || item.exhibitionName) && (
              <Text style={S.title} numberOfLines={1}>
                {item.title || item.exhibitionName}
              </Text>
            )}
            {!!item.memberName && <Text style={S.artist} numberOfLines={1}>{item.memberName}</Text>}
          </View>
        </View>

        {!!item.question && <Text style={S.question}>{item.question}</Text>}
        <Text style={S.userInfo}>{(item.organizerOrCreator || "사용자 이름") + " ・ " + new Date(item.createdAt).toLocaleDateString()}</Text>
      </TouchableOpacity>
    );
  };

  // 요약 헤더
  const Summary = () => (
    <View style={S.summary}>
      <Text style={S.summaryText}>총 {data.length} 건 · 최신 등록순</Text>
    </View>
  );

  // 로딩/에러/빈 상태
  const Empty = () => (
    <View style={S.emptyWrap}>
      {loading ? (
        <>
          <ActivityIndicator />
          <Text style={S.emptyText}>노트를 불러오는 중…</Text>
        </>
      ) : errorMsg ? (
        <Text style={[S.emptyText, { color: "#D14" }]}>{errorMsg}</Text>
      ) : (
        <Text style={S.emptyText}>아직 작성된 노트가 없어요.</Text>
      )}
    </View>
  );

  return (
    <FlatList
      style={style}
      data={data}
      keyExtractor={(n) => String(n.id)}
      renderItem={renderItem}
      ListHeaderComponent={() => (
        <View>
          {listHeader}
          <Summary />
        </View>
      )}
      ListEmptyComponent={<Empty />}
      contentContainerStyle={S.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      removeClippedSubviews
      initialNumToRender={10}
      windowSize={10}
    />
  );
}

const S = StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 12, paddingBottom: 24, flexGrow: 1 },
  summary: { paddingHorizontal: 4, paddingBottom: 8 },
  summaryText: { color: "#6B7280", fontSize: 12, fontWeight: "600" },

  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  thumbnail: { width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: "#00000022" },
  title: { fontWeight: "600", fontSize: 13, color: "#fff" },
  artist: { fontSize: 12, color: "#f0f0f0" },
  question: { fontSize: 15, fontWeight: "500", marginBottom: 12, color: "#fff" },
  userInfo: { fontSize: 12, color: "#fefefe" },

  emptyWrap: { padding: 20, alignItems: "center" },
  emptyText: { marginTop: 8, color: "#6B7280" },
});
