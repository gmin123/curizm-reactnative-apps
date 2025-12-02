import { StyleSheet } from "react-native";

const PRIMARY  = "#FF6A3D";
const BORDER   = "#E5E7EB";
const TEXT     = "#111827";
const SUBTEXT  = "#6B7280";
const ERROR    = "#EF4444";
const GREEN_BG = "#ECFDF5";
const GREEN    = "#16A34A";
const RED_BG   = "#FEF2F2";
const RED      = "#DC2626";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stepText: { marginLeft: 6, color: PRIMARY, fontSize: 12, fontWeight: "800" },

  title: { marginTop: 4, marginBottom: 18, fontSize: 24, fontWeight: "900", color: TEXT },

  label: { fontSize: 12, fontWeight: "800", color: TEXT, marginTop: 10, marginBottom: 6 },

  checklistOk:    { backgroundColor: GREEN_BG },
  checklistError: { backgroundColor: RED_BG },

  checkBad:  { color: RED, fontWeight: "700" },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  inputError: { borderColor: ERROR },

  passwordWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: { flex: 1, paddingRight: 8 },

  helperError: { color: ERROR, fontSize: 12, marginTop: 6 },

  checklistBox: {
    backgroundColor: GREEN_BG,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  checkText: { marginLeft: 6, fontSize: 13 },
  checkOk: { color: GREEN, fontWeight: "700" },

  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: "#fff", fontWeight: "900", fontSize: 15 },
});
