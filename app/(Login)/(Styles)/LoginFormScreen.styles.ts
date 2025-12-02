// app/(Login)/(Styles)/LoginFormScreen.styles.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

  // 헤더
  header: {
    height: 44,
    justifyContent: "center",
  },

  // 제목
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
    marginBottom: 20,
  },

  // 필드 공통
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
  },

  // 인풋
  inputWrap: {
    position: "relative",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#111827",
  },
  inputWithIcon: {
    paddingRight: 44, // 우측 아이콘 공간
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  // 로그인 버튼
  loginBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FF5A36", // 스샷의 오렌지 톤
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // 하단 링크
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  linkText: {
    color: "#4B5563",
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 14,
  },
});
