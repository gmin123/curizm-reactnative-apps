// app/(account)/CreateAccount.tsx
import React, { useMemo, useState, useEffect } from "react";
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
import { router } from "expo-router";
import styles from "./(Styles)/CreateAccount.styles";

import { checkEmailExists, sendVerificationEmail } from "../../../api/account/authAPI";

// 안전 직렬화
const safeJSON = (v: any) => {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

// 개발 로그
const dbg = (...args: any[]) => {
  if (__DEV__) console.log("[Step1]", ...args);
};

// 에러 문자열 추출(axios 대비, fetch 대비 모두 커버)
const toMsg = (e: unknown): string => {
  if (typeof e === "string") return e;

  const any = e as any;

  // fetch 래퍼가 부여한 정보 우선
  const composed =
    any?.data?.message || any?.data?.error || any?.data?.detail || any?.message || any?.statusText;

  if (composed && composed !== "[object Object]") return String(composed);
  if (e instanceof Error && e.message && e.message !== "[object Object]") return e.message;

  return safeJSON(any ?? "오류가 발생했습니다.");
};

export default function CreateAccountStep1() {
  const navigation = useNavigation();

  // form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, _setErrorMsg] = useState("");

  const setErr = (e: unknown) => {
    const msg = toMsg(e);
    dbg("setErr =>", msg, "raw:", e);
    _setErrorMsg(msg);
  };

  useEffect(() => {
    dbg("mounted");
    return () => dbg("unmounted");
  }, []);
  useEffect(() => {
    if (errorMsg) dbg("errorMsg state changed:", errorMsg);
  }, [errorMsg]);

  // touched
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    nickname: false,
  });

  // validation
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const pwdValid = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      combo:
        /[a-zA-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^a-zA-Z0-9]/.test(password),
    }),
    [password]
  );
  const pwdAllValid = pwdValid.length && pwdValid.upper && pwdValid.combo;
  const nicknameValid = useMemo(() => nickname.length >= 2 && nickname.length <= 10, [nickname]);

  const canContinue = emailValid && pwdAllValid && nicknameValid;

// app/(account)/CreateAccount.tsx

const handleSubmit = async () => {
  setTouched({ email: true, password: true, nickname: true });

  if (!emailValid)   return setErr("올바른 이메일 형식이 아닙니다.");
  if (!pwdAllValid)  return setErr("비밀번호 조건을 확인해 주세요.");
  if (!nicknameValid) return setErr("이름은 2~10자로 입력해 주세요.");

  try {
    setLoading(true);
    _setErrorMsg("");

    // 1) 선조회 제거!
    // const exists = await checkEmailExists(email.trim());
    // if (exists) return setErr("이미 사용 중인 이메일입니다.");

    // 2) 인증 메일 발송 (POST /api/v1/auth/verify/email)
    dbg("sendVerificationEmail request ->", email.trim());
    await sendVerificationEmail(email.trim());
    dbg("sendVerificationEmail done");

    // 3) 절대경로로 Step2 이동
    const params: Record<string, string> = {
      email: email.trim(),
      password,
      nickname: nickname.trim(),
      ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
    };

    router.push({
      pathname: "./CreateAccountStep2",
      params,
    });
  } catch (e) {
    dbg("handleSubmit catch raw error:", e, {
      status: (e as any)?.status,
      data: (e as any)?.data,
    });
    setErr(toMsg(e));
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.stepText}>1/2</Text>
          </View>

          <Text style={styles.title}>회원가입</Text>

          {/* 아이디 */}
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={[styles.input, touched.email && (!email || !emailValid) && styles.inputError]}
            placeholder="이메일 주소 입력"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errorMsg) _setErrorMsg("");
            }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          {touched.email && !email ? (
            <Text style={styles.helperError}>아이디를 입력해 주세요.</Text>
          ) : touched.email && !emailValid ? (
            <Text style={styles.helperError}>유효한 이메일 주소를 입력해 주세요.</Text>
          ) : null}

          {/* 비밀번호 */}
          <Text style={styles.label}>비밀번호</Text>
          <View style={[styles.passwordWrapper, touched.password && (!password || !pwdAllValid) && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호 입력"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errorMsg) _setErrorMsg("");
              }}
              onFocus={() => setPwdFocused(true)}
              onBlur={() => {
                setPwdFocused(false);
                setTouched((t) => ({ ...t, password: true }));
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {touched.password && !password ? <Text style={styles.helperError}>비밀번호를 입력해 주세요.</Text> : null}

          {(pwdFocused || password.length > 0) && (
            <View style={styles.checklistBox}>
              <ChecklistRow ok={pwdValid.length} label="최소 8자 이상 알파벳" />
              <ChecklistRow ok={pwdValid.upper} label="영어 대문자 포함" />
              <ChecklistRow ok={pwdValid.combo} label="문자, 숫자, 기호의 조합" />
            </View>
          )}

          {/* 닉네임 */}
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={[styles.input, touched.nickname && (!nickname || !nicknameValid) && styles.inputError]}
            placeholder="닉네임 입력"
            placeholderTextColor="#9CA3AF"
            value={nickname}
            onChangeText={(v) => {
              setNickname(v);
              if (errorMsg) _setErrorMsg("");
            }}
            onBlur={() => setTouched((t) => ({ ...t, nickname: true }))}
          />
          {touched.nickname && !nickname ? (
            <Text style={styles.helperError}>이름을 입력해 주세요.</Text>
          ) : touched.nickname && !nicknameValid ? (
            <Text style={styles.helperError}>닉네임은 2~10자로 입력해 주세요.</Text>
          ) : null}

          {/* 추천인 코드 */}
          <Text style={[styles.label, { marginTop: 6 }]}>추천인 코드 (선택)</Text>
          <TextInput
            style={styles.input}
            placeholder="추천인 코드 입력"
            placeholderTextColor="#9CA3AF"
            value={referralCode}
            onChangeText={(v) => {
              setReferralCode(v);
              if (errorMsg) _setErrorMsg("");
            }}
          />

          {!!errorMsg && <Text style={[styles.helperError, { marginTop: 6 }]}>{String(errorMsg)}</Text>}

          {/* 계속 */}
          <TouchableOpacity
  style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
  onPress={handleSubmit}
  disabled={loading || !canContinue}
>

            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>계속</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons name={ok ? "checkmark" : "close"} size={16} color={ok ? "#16A34A" : "#DC2626"} />
      <Text style={[styles.checkText, ok ? styles.checkOk : styles.checkBad]}>{label}</Text>
    </View>
  );
}
