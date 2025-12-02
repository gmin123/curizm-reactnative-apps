// app/(account)/mylist.styles.ts
import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
  },
  tabBtn: {
    marginRight: 18,
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
    color: "#6B7280",
    paddingVertical: 10,
  },
  tabTextActive: {
    color: "#111827",
    fontWeight: "700",
  },
  tabUnderline: {
    height: 2,
    width: 28,
    backgroundColor: "#111827",
    borderRadius: 2,
    marginTop: 4,
  },

  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  countText: {
    fontSize: 12,
    color: "#6B7280",
  },

  sep: {
    height: 12,
    backgroundColor: "#F3F4F6",
  },

  // 공통 리스트 행
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  rowThumbSm: { width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: "#E5E7EB" },
  rowThumbLg: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: "#E5E7EB" },

  rowTitle: { fontSize: 15, color: "#111827", fontWeight: "700" },
  rowSub:   { fontSize: 12, color: "#6B7280", marginTop: 4 },
  rowMeta:  { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  heart: { fontSize: 20, color: "#D1D5DB", paddingHorizontal: 2 },

  // 작가 카드
  artistCard: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 12 },
  artistHead: { flexDirection: "row", alignItems: "center" },
  artistAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "#E5E7EB" },
  artistName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  artistBadge: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  followBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  following: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  followTxt: { color: "#111827", fontWeight: "700", fontSize: 12 },

  // 전시/구매 행
  exRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 12 },
  exThumb: { width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: "#E5E7EB" },

  purchaseRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amount: { fontSize: 12, color: "#111827", fontWeight: "700" },

  // 생각 카드 (동그랗게)
  thinkCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  thinkHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  thinkThumb: { width: 32, height: 32, borderRadius: 6, marginRight: 8, backgroundColor: "#E5E7EB" },
  thinkTitle: { fontSize: 13, color: "#111827", fontWeight: "700" },
  thinkAuthor: { fontSize: 11, color: "#374151", marginTop: 2 },
  thinkText: { fontSize: 14, color: "#111827", marginTop: 6, lineHeight: 20, fontWeight: "700" },
  thinkMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  thinkMetaLeft: { flexDirection: "row", alignItems: "center" },
  thinkMeta: { fontSize: 11, color: "#374151", marginRight: 8 },
});
