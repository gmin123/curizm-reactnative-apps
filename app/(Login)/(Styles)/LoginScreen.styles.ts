// LoginScreen.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  topIcon: {
    alignItems: "center",
    marginTop: 10,
  },
  topIconText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 22,
    color: "#333",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  kakaoBtn: {
    backgroundColor: "#FEE500",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  kakaoText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  googleBtn: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  googleText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  curizJoinBtn: {
    backgroundColor: "#FF5959",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  curizJoinText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    color: "#FF5959",
    fontWeight: "bold",
  },
});
