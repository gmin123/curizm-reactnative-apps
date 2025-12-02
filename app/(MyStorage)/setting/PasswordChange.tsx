import { useAuth } from "@/app/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PasswordChange() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ 유저 이메일 불러오기
  useEffect(() => {
    const fetchEmail = async () => {
      if (!user?.token) {
        console.warn("⚠️ user.token 없음 → 이메일 요청 중단");
        return;
      }

      console.log("📡 [API 요청] 회원 이메일 불러오기 시작");

      try {
        const res = await fetch("https://api.curizm.io/api/v1/member", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📥 [응답 상태코드]", res.status);
        const data = await res.json();
        console.log("📩 [응답 데이터]", data);

        if (!res.ok) throw new Error("이메일 불러오기 실패");

        setEmail(data.email || user.email);
      } catch (err) {
        console.error("❌ [이메일 요청 실패]", err);
        setEmail(user.email || "user@example.com");
      }
    };

    fetchEmail();
  }, [user]);

  const canNext = useMemo(() => currentPw.length >= 8, [currentPw]);
  const canSave = useMemo(() => newPw.length >= 8 && !saving, [newPw, saving]);

  const handleNext = () => {
    console.log("➡️ handleNext 호출됨", { currentPw, canNext });
    if (!canNext) {
      console.warn("⚠️ 현재 비밀번호가 조건(8자 이상)을 만족하지 않음");
      return;
    }
    setStep(2);
  };

  // ✅ 비밀번호 변경
  const handleSave = async () => {
    console.log("🚀 handleSave 실행됨");
    if (!canSave) {
      console.warn("⚠️ 새 비밀번호가 유효하지 않거나 저장 중 상태");
      return;
    }

    setSaving(true);

    try {
      // ✅ 서버 기대 형식 확인 (snake_case)
      const payload = {
        old_password: currentPw,
        new_password: newPw,
      };

      console.log("📤 [요청 전송] PUT /api/v1/member/password");
      console.log("🧾 요청 본문:", payload);

      const res = await fetch("https://api.curizm.io/api/v1/member/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📬 [응답 상태]", res.status);

      const text = await res.text();
      console.log("📩 [응답 본문]", text);

      if (!res.ok) {
        console.error("❌ [비밀번호 변경 실패 응답]", {
          status: res.status,
          body: text,
        });
        Alert.alert("오류", "비밀번호 변경에 실패했습니다.\n현재 비밀번호를 다시 확인해주세요.");
        setSaving(false);
        return;
      }

      console.log("✅ [성공] 비밀번호 변경 완료");
      Alert.alert("성공", "비밀번호가 성공적으로 변경되었습니다.");
      router.back();
    } catch (error) {
      console.error("💥 [예외 발생 - 요청 중 오류]", error);
      Alert.alert("오류", "서버 요청 중 문제가 발생했습니다.");
    } finally {
      console.log("🔚 [handleSave 종료]");
      setSaving(false);
    }
  };

  const goBack = () => {
    console.log("↩️ goBack 호출됨 (현재 step:", step, ")");
    if (step === 2) setStep(1);
    else router.back();
  };

  return (
    <SafeAreaView style={S.container}>
      {/* 헤더 */}
      <View style={S.header}>
        <TouchableOpacity onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>

        <View style={S.headerTitleBox}>
          <Text style={S.stepText}>{step}/2</Text>
          <Text style={S.headerTitle}>
            {step === 1 ? "비밀번호 변경" : "비밀번호 재설정"}
          </Text>
        </View>

        {step === 2 ? (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={S.cancelText}>취소</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* 본문 */}
      <View style={S.body}>
        {step === 1 ? (
          <>
            <View style={S.infoBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
              <Text style={S.infoText}>
                회원님의 정보를 안전하게 보호하기 위해 비밀번호를 확인하고 있어요.
              </Text>
            </View>

            <Text style={S.label}>아이디</Text>
            <TextInput
              style={[S.input, { color: "#9CA3AF" }]}
              value={email}
              editable={false}
              placeholder="이메일 주소"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[S.label, { marginTop: 20 }]}>현재 비밀번호</Text>
            <View style={S.inputWrap}>
              <TextInput
                style={S.input}
                value={currentPw}
                onChangeText={(t) => {
                  console.log("⌨️ 현재 비밀번호 입력:", t);
                  setCurrentPw(t);
                }}
                placeholder="비밀번호 입력"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity
                style={S.eyeBtn}
                onPress={() => setShowCurrent((prev) => !prev)}
              >
                <Ionicons
                  name={showCurrent ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[S.button, !canNext && S.buttonDisabled]}
              disabled={!canNext}
              onPress={handleNext}
            >
              <Text style={S.buttonText}>계속</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={S.label}>새 비밀번호</Text>
            <View style={S.inputWrap}>
              <TextInput
                style={S.input}
                value={newPw}
                onChangeText={(t) => {
                  console.log("⌨️ 새 비밀번호 입력:", t);
                  setNewPw(t);
                }}
                placeholder="새 비밀번호 입력"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNew}
              />
              <TouchableOpacity
                style={S.eyeBtn}
                onPress={() => setShowNew((prev) => !prev)}
              >
                <Ionicons
                  name={showNew ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[S.button, !canSave && S.buttonDisabled]}
              disabled={!canSave}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={S.buttonText}>저장</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitleBox: { flexDirection: "column", alignItems: "center", flex: 1 },
  stepText: { fontSize: 13, color: "#FF6A3D", fontWeight: "600" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
  },
  cancelText: { color: "#FF6A3D", fontSize: 15, fontWeight: "600" },
  body: { paddingHorizontal: 24, paddingTop: 30, flex: 1 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  label: { color: "#111", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  inputWrap: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111",
  },
  eyeBtn: { position: "absolute", right: 14, padding: 4 },
  button: {
    backgroundColor: "#FF6A3D",
    borderRadius: 8,
    marginTop: 40,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
