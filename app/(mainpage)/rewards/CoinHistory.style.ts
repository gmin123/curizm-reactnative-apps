import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  /* ---------- header ---------- */
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  back: { fontSize: 18, color: "#111" },
  title: { fontSize: 20, fontWeight: "900", color: "#111" },
  chargeBtn: {
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chargeTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },

  /* ---------- balance + banner ---------- */
  balanceWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  balanceLabel: { fontSize: 12, color: "#98A2B3", marginTop: 6 },
  balanceValue: { fontSize: 32, fontWeight: "900", color: "#111", marginTop: 4 },

  banner: {
    marginTop: 12,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerTitle: { fontSize: 14, fontWeight: "900", color: "#111" },
  bannerDesc: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  coinEmoji: { fontSize: 40, marginLeft: 10 },

  /* ---------- tabs ---------- */
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECEEF5",
    backgroundColor: "#fff",
    gap: 20,
  },
  tabBtn: { paddingBottom: 10 },
  tabTxt: { fontSize: 14, color: "#8A90A6", fontWeight: "700" },
  tabTxtActive: { color: "#111" },
  tabUnderline: { height: 2, backgroundColor: "#111", marginTop: 8 },

  /* ---------- list ---------- */
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rowTitle: { fontSize: 14, fontWeight: "800", color: "#111" },
  rowSub: { marginTop: 4, fontSize: 12, color: "#6B7280" },
  rowTime: { marginTop: 6, fontSize: 11, color: "#9CA3AF" },

  amount: { fontSize: 14, fontWeight: "900", marginLeft: 8 },
  plus: { color: "#FF6A3D" },
  minus: { color: "#6B7280" },

  sep: { height: 1, backgroundColor: "#F1F3F8", marginLeft: 16 },
});
