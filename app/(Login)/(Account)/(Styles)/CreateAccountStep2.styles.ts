// app/(account)/(Styles)/CreateAccountStep2.styles.ts
import { StyleSheet } from "react-native";

const COLOR = {
  bg: "#FFFFFF",
  text: "#111827",
  sub: "#4B5563",
  border: "#E5E7EB",
  borderWarn: "#FCA5A5",
  warn: "#EF4444",
  primary: "#F15A38", // 버튼 주색
  primaryDisabled: "#FCA38D",
  infoBg: "#E5ECF5",
  successBg: "#E6F8EA",
  successText: "#065F46",
  link: "#111827",
};

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { paddingRight: 8, paddingVertical: 4 },
  cancelText: { color: COLOR.primary, fontSize: 14, fontWeight: "600" },

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.successBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  successText: { color: COLOR.successText, fontSize: 13 },

  stepText: { marginTop: 6, color: COLOR.primary, fontSize: 12, fontWeight: "700" },
  title: { marginTop: 4, color: COLOR.text, fontSize: 20, fontWeight: "800" },

  infoCard: {
    marginTop: 12,
    backgroundColor: COLOR.infoBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { color: COLOR.sub, fontSize: 13 },
  infoLink: { color: COLOR.link, textDecorationLine: "underline", fontSize: 13, fontWeight: "600" },
  infoLinkDisabled: { opacity: 0.5, textDecorationLine: "none" },

  label: { marginTop: 14, marginBottom: 6, color: COLOR.text, fontSize: 13, fontWeight: "700" },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: COLOR.text,
  },
  inputWarn: {
    borderColor: COLOR.borderWarn,
    backgroundColor: "#FEF2F2",
  },
  helperWarn: { marginTop: 6, color: COLOR.warn, fontSize: 12 },

  primaryButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: { backgroundColor: COLOR.primaryDisabled },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
