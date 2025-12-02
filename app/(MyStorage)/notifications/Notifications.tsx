  import {
  apiGetNotifications,
  apiMarkNotificationRead,
  type NotificationItem,
} from "../../../api/setting/notifications";
import { useAuth } from "../../context/AuthContext";

  import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
  // ↓ 네 프로젝트 경로에 맞게 수정 (내가 만든 모듈이 app/api/notifications.ts 라면 이렇게)

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const listRef = useRef<FlatList<NotificationItem>>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 앱 실행 중 푸시 수신 → 새로고침
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(() => onRefresh());
    const sub2 = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => { sub1.remove(); sub2.remove(); };
  }, []);

  const timeAgo = useCallback((iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }, []);

  const fetchPage = useCallback(async (p: number) => {
    if (!token) return { list: [], total: 0, hasMore: false };
    const res = await apiGetNotifications(token, p);
    const list = res.data ?? [];
    const total = Number(res.total ?? list.length);
    const per = list.length;
    const hasMore = per > 0 && p * per < total;
    return { list, total, hasMore };
  }, [token]);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    try {
      const { list, total, hasMore } = await fetchPage(1);
      setItems(list);
      setTotal(total);
      setPage(1);
      setHasMore(hasMore);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => { loadFirst(); }, [loadFirst]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { list, total, hasMore } = await fetchPage(1);
      setItems(list);
      setTotal(total);
      setPage(1);
      setHasMore(hasMore);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setLoading(true);
    try {
      const { list, hasMore: hm } = await fetchPage(next);
      setItems((prev) => [...prev, ...list]);
      setPage(next);
      setHasMore(hm);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, fetchPage]);

  const onPressItem = useCallback(async (id: string) => {
    try {
      await apiMarkNotificationRead(token, id);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, read: true } : it)));
      // 상세 이동 필요시 여기서 router.push(`/Notifications/${id}`)
    } catch {}
  }, [token]);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={S.row} activeOpacity={0.7} onPress={() => onPressItem(item.id)}>
      <View style={S.avatarWrap}>
        {item.image ? <Image source={{ uri: item.image }} style={S.avatar} /> : <View style={[S.avatar, { backgroundColor: "#E5E7EB" }]} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[S.title, !item.read && { fontWeight: "900" }]} numberOfLines={1}>{item.title}</Text>
        <Text style={S.body} numberOfLines={2}>{item.body}</Text>
        <Text style={S.when}>{timeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={S.back}>←</Text></TouchableOpacity>
        <Text style={S.headerTitle}>알림</Text>
        <TouchableOpacity onPress={() => router.push("/notifications/settings")}>
          <Text style={S.settings}>설정</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={S.sep} />}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<View style={S.empty}><Text style={{ color: "#94A3B8" }}>알림이 없습니다.</Text></View>}
      />
    </View>
  );
}

const S = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { fontSize: 20 },
  headerTitle: { fontWeight: "900", fontSize: 20 },
  settings: { color: "#FF5B55", fontWeight: "800" },
  row: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 14, alignItems: "flex-start" },
  avatarWrap: { marginRight: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  title: { fontSize: 13, color: "#6B7280" },
  body: { fontSize: 14, color: "#111", marginTop: 4, lineHeight: 20 },
  when: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
  sep: { height: 1, backgroundColor: "#EEF2F7", marginLeft: 62 },
  empty: { alignItems: "center", paddingTop: 60 },
});
