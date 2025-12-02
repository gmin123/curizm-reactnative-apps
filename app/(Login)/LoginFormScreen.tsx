// app/(Login)/LoginFormScreen.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import { signin } from "@/api/account/authAPI";

export default function LoginFormScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onBack = () => router.back();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await signin(email.trim(), password);
      const accessToken = res?.accessToken || (res as any)?.token;

      if (!accessToken) {
        throw new Error("토큰이 없습니다.");
      }

      await login(email.trim(), accessToken);
      router.replace("/(mainpage)");
    } catch (e: any) {
      Alert.alert("로그인 실패", e?.message || "이메일/비밀번호를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const goFindPassword = () => {
    Alert.alert("안내", "비밀번호 찾기는 준비 중입니다.");
    // router.push("/(Login)/FindPassword"); // 준비되면 라우트 연결
  };

  const goSignUp = () => {
    router.push("/(Login)/(Account)/CreateAccount");
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={s.container}>
          {/* 상단 헤더 */}
          <View style={s.header}>
            <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* 타이틀 */}
          <Text style={s.title}>로그인</Text>

          {/* 아이디 */}
          <Text style={s.label}>아이디</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              placeholder="이메일 주소 입력"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          {/* 비밀번호 */}
          <Text style={[s.label, { marginTop: 16 }]}>비밀번호</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              placeholder="비밀번호 입력"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowPwd((v) => !v)}
              style={s.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPwd ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[s.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginText}>로그인</Text>}
          </TouchableOpacity>

          {/* 하단 링크 */}
          <View style={s.bottomRow}>
            <TouchableOpacity onPress={goFindPassword} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={s.bottomLink}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <Text style={s.bottomDivider}>|</Text>
            <TouchableOpacity onPress={goSignUp} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={s.bottomLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  header: { paddingVertical: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#111", marginTop: 8, marginBottom: 20 },

  label: { fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 8 },

  inputWrap: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    height: 48,
    justifyContent: "center",
  },
  input: {
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  loginBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FF5A3D", // 스샷 느낌의 오렌지
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginTop: 16,
  },
  bottomLink: { fontSize: 13, color: "#6B7280", fontWeight: "700" },
  bottomDivider: { fontSize: 13, color: "#9CA3AF", marginHorizontal: 2 },
});
