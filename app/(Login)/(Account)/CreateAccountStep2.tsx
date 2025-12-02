import React, { useMemo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import styles from "./(Styles)/CreateAccountStep2.styles";
import { signUp, verifyEmailCode, sendVerificationEmail, checkEmailExists } from "../../../api/account/authAPI";  // 수정된 부분

// 유틸
const safeJSON = (v: any) => { try { return JSON.stringify(v); } catch { return String(v); } };
const dbg = (...args: any[]) => { if (__DEV__) console.log("[Step2]", ...args); };
const toMsg = (e: unknown): string => {
  if (typeof e === "string") return e;
  const any = e as any;
  const composed = any?.data?.message || any?.data?.error || any?.data?.detail || any?.message || any?.statusText;
  if (composed && composed !== "[object Object]") return String(composed);
  if (e instanceof Error && e.message && e.message !== "[object Object]") return e.message;
  return safeJSON(any ?? "오류가 발생했습니다.");
};

export default function CreateAccountStep2() {
  const navigation = useNavigation();

  // Step1에서 넘어온 파라미터
  const raw = useLocalSearchParams();
  const email        = String(raw.email ?? "");
  const password     = String(raw.password ?? "");
  const nickname     = String(raw.nickname ?? "");
  const referralCode = raw.referralCode != null ? String(raw.referralCode) : undefined;

  // 상태
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, _setErrorMsg] = useState("");
  const [resent, setResent] = useState(false);
  const [resendLock, setResendLock] = useState(0); // n초 동안 재전송 비활성화

  // 에러 설정 래퍼
  const setErr = (e: unknown) => {
    const msg = toMsg(e);
    dbg("setErr =>", msg, "raw:", e);
    _setErrorMsg(msg);
  };

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (resendLock <= 0) return;
    const t = setInterval(() => setResendLock((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendLock]);

  // 유효성
  const canSubmit = useMemo(() => code.trim().length >= 4, [code]);

  // 동작: 뒤로, 취소
  const onBack = () => navigation.goBack();
  const onCancel = () => router.back();

  // 인증코드 재전송
  const handleResend = async () => {
    if (resendLock > 0) return;
    try {
      setLoading(true);
      _setErrorMsg("");
      await sendVerificationEmail(email);
      setResent(true);
      setResendLock(30); // 30초 쿨다운
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 처리
  const handleFinish = async () => {
    if (!canSubmit) return setErr("인증코드를 입력해 주세요.");

    try {
      setLoading(true);
      _setErrorMsg("");

      // 1) 이메일 중복 확인
      const emailExists = await checkEmailExists(email);
      if (emailExists) return setErr("이메일이 이미 등록되어 있습니다.");

      // 2) 인증코드 검증
      await verifyEmailCode(email, code.trim());

      // 3) 회원가입
      await signUp({
        email,
        password,
        username: nickname,
        code: code.trim(),
        ...(referralCode ? { referralCode } : {}),
      });

      // 4) 회원가입 완료 후 maincontents 레이아웃으로 이동
      router.replace("/maincontents");  // 수정된 부분

    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} hitSlop={8} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} hitSlop={8}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </View>

          {/* 상단 성공 배너(재전송 시) */}
          {resent && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#047857" style={{ marginRight: 8 }} />
              <Text style={styles.successText}>인증코드를 다시 발송했어요.</Text>
            </View>
          )}

          {/* 스텝, 타이틀 */}
          <Text style={styles.stepText}>2/2</Text>
          <Text style={styles.title}>회원가입</Text>

          {/* 안내 카드 */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color="#4B5563" style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>입력하신 이메일 주소로 인증코드를 발송했어요.</Text>
            </View>
            <TouchableOpacity disabled={loading || resendLock > 0} onPress={handleResend}>
              <Text style={[styles.infoLink, (loading || resendLock > 0) && styles.infoLinkDisabled]}>
                인증코드를 다시 받기{resendLock > 0 ? ` (${resendLock}s)` : ""}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 인증코드 입력 */}
          <Text style={styles.label}>인증코드</Text>
          <TextInput
            style={[styles.input, !canSubmit && code.length > 0 ? styles.inputWarn : null]}
            placeholder="인증코드 입력"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (errorMsg) _setErrorMsg("");
            }}
            maxLength={8}
          />
          {!canSubmit && code.length > 0 && (
            <Text style={styles.helperWarn}>인증코드를 입력해 주세요.</Text>
          )}
          {!!errorMsg && (
            <Text style={[styles.helperWarn, { marginTop: 6 }]}>{String(errorMsg)}</Text>
          )}

          {/* 완료 버튼 */}
          <TouchableOpacity
            style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
            activeOpacity={0.9}
            onPress={handleFinish}
            disabled={loading || !canSubmit}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>완료</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
