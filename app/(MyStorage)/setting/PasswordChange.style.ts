import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  back: { fontSize: 20 },
  linkDanger: { color: "#FF5B55", fontWeight: "800" },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  stepText: { color: "#FF6A3D", fontWeight: "800", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 14 },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F3F6FB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  infoIcon: { fontSize: 18 },
  infoTitle: { color: "#5A6476", fontSize: 13, lineHeight: 18 },

  fieldWrap: { marginBottom: 16 },
  label: { fontWeight: "800", marginBottom: 8, color: "#111" },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  inputText: { flex: 1, color: "#111", fontSize: 16 },
  placeholder: { color: "#98A3B3" },
  disabled: { opacity: 0.9 },

  eye: { fontSize: 18 },

  primaryBtn: {
    marginTop: 8,
    height: 52,
    backgroundColor: "#FF5B55",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  disabledBtn: { backgroundColor: "#FFD3D1" },
});
