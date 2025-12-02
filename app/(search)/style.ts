// app/(mainpage)/(maincontents)/(Exhi)/style.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  input: { flex: 1, marginHorizontal: 8, paddingVertical: 6, fontSize: 15 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagBox: { marginRight: 12, alignItems: "center" },
  tagImg: { width: 56, height: 56, borderRadius: 8, marginBottom: 4 },
  tagTxt: { fontSize: 13 },
  recentTxt: { color: "#666", fontSize: 14, paddingVertical: 4 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabBtn: { paddingVertical: 10 },
  tabTxt: { fontSize: 14, color: "#777" },
  tabActive: { borderBottomWidth: 2, borderColor: "#FF5B55" },
  tabTxtActive: { color: "#FF5B55", fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  avatar: {
    width: 48,
    height: 48,
    marginRight: 12,
    backgroundColor: "#eee",
    borderRadius: 3,
  },
  name: { fontSize: 14, fontWeight: "600" },
  sub: { fontSize: 12, color: "#888" },
  highlightBox: {
    backgroundColor: "#fff7f5",
    borderRadius: 10,
    padding: 8,
  },

  artworkCard: { width: 100, marginRight: 10, alignItems: "center" },
  artworkImg: { width: 100, height: 100, backgroundColor: "#eee" },
  artworkName: { fontSize: 12, marginTop: 4 },
  heartBtn: { position: "absolute", top: 4, right: 4 },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#777" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  moreTxt: {
    fontSize: 13,
    color: "#FF6A3D",
    fontWeight: "600",
  },

  thumbSquare: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#EEE",
  },

  /** ✅ 팔로우 버튼 */
  followBtn: {
    borderRadius: 999,
    width: 80,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5630", // 비활성(팔로우) 상태
  },
  followActive: {
    backgroundColor: "#F3F4F6", // 활성(팔로잉) 상태
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  followTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff", // 기본(팔로우 상태)은 흰색
  },
  followTxtActive: {
    color: "#111", // 팔로잉 시 글자색 변경
  },
});
