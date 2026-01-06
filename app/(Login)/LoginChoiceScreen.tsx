import { useAuth } from "@/app/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { googleLogin, kakaoLogin } from "@/api/account/snslogin";

export default function LoginChoiceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

const handleSNSLogin = async (type: "google" | "kakao") => {
    setLoading(true);

    try {
      const result =
        type === "google" ? await googleLogin() : await kakaoLogin();

      if (!result) {
        Alert.alert("로그인 실패", "SNS 로그인에 실패했습니다.");
        return;
      }

      const { accessToken, member } = result;

      // 🔥🔥🔥 핵심: AuthContext에 로그인 알림
      await login(
        member.email,
        accessToken,
        member.name,
        member.profileImg
      );

      console.log("✅ AuthContext 로그인 완료:", member.email);

      router.replace("/(mainpage)");
    } catch (e) {
      console.error("❌ SNS 로그인 오류:", e);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={s.body}>
        <Text style={s.title}>반가워요</Text>
        <Text style={s.title}>어떤 계정으로 시작할까요?</Text>
        <Text style={s.sub}>
          미술 작품 감상 중 궁금한 게 많았다면{"\n"}지금 바로 시작해보세요!
        </Text>

        <View style={s.illustration}>
          <Ionicons name="images-outline" size={72} color="#9CA3AF" />
        </View>

        {appleAvailable && (
          <TouchableOpacity style={s.appleBtn}>
            <Ionicons name="logo-apple" size={18} color="#fff" />
            <Text style={s.appleBtnText}>Apple로 계속하기</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={s.kakaoBtn}
          onPress={() => handleSNSLogin("kakao")}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#111" />
          <Text style={s.kakaoText}>카카오로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.googleBtn}
          onPress={() => handleSNSLogin("google")}
        >
          <Ionicons name="logo-google" size={18} color="#111" />
          <Text style={s.googleText}>구글로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.push("/(Login)/(Account)/CreateAccount")}
        >
          <Text style={s.primaryText}>큐리즘 아이디로 가입하기</Text>
        </TouchableOpacity>

        <View style={s.bottomRow}>
          <Text style={s.bottomText}>이미 계정이 있나요? </Text>
          <TouchableOpacity
            onPress={() => router.push("/(Login)/LoginFormScreen")}
          >
            <Text style={s.bottomLink}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={loading} transparent animationType="fade">
        <View style={s.loading}>
          <ActivityIndicator size="large" color="#FF6A3D" />
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  body: { flex: 1, alignItems: "center", paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "800", color: "#111", marginTop: 8 },
  sub: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  illustration: {
    width: 220,
    height: 160,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 18,
  },
  appleBtn: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  appleBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  kakaoBtn: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FEE500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  kakaoText: { fontSize: 15, fontWeight: "700", color: "#111" },
  googleBtn: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  googleText: { fontSize: 15, fontWeight: "700", color: "#111" },
  primaryBtn: {
    width: "100%",
    maxWidth: 320,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FF6A3D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primaryText: { fontSize: 15, fontWeight: "800", color: "#fff" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  bottomText: { fontSize: 13, color: "#6B7280" },
  bottomLink: { fontSize: 13, color: "#FF6A3D", fontWeight: "800" },
  loading: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
