// api/account/authAPI.ts
// Expo SDK 52 / React Native 0.76.x
// - 베이스 URL 하나로 통일
// - 안드로이드 에뮬레이터는 10.0.2.2 사용
// - 모든 요청은 requestJSON으로 일원화
// - 서버 스펙에 맞춰 ENDPOINTS만 조정하면 됨

import { Platform } from "react-native";

// ** 수정된 부분: 로컬/에뮬레이터 관련 설정 제거하고 고정 URL 사용 **
export const EXPO_PUBLIC_API_BASE_URL = "https://api.curizm.io";  // 여기로 변경

/** 개발/배포 공용 베이스 URL
 *  - EXPO_PUBLIC_API_BASE_URL만 사용하도록 수정
 */
export const API_BASE = EXPO_PUBLIC_API_BASE_URL;  // 직접 고정된 URL을 사용

// 서버 엔드포인트(스펙에 맞춰 경로 문자열만 수정)
const ENDPOINTS = {
  EMAIL_CHECK: "/api/v1/auth/email/check",            // GET ?email=...
  VERIFY_EMAIL_SEND: "/api/v1/auth/verify/email",     // POST { email, type: "emailVerification" }
  VERIFY_EMAIL_CODE: "/api/v1/auth/verify/code",// POST { email, code } (있을 때)
  SIGN_UP: "/api/v1/auth/signup",                     // POST { email, password, username, code, referralCode? }
  ADMIN_SIGNIN: "/api/v1/auth/signin",          // POST { email, password }
} as const;

// -------------------- 유틸 --------------------

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const qs = (params?: Record<string, any>) => {
  if (!params) return "";
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
};

const safeJSON = (v: any) => {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

async function requestJSON<T>(
  method: HTTPMethod,
  path: string,
  options?: {
    params?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
    timeoutMs?: number;
  }
): Promise<T> {
  const url = `${API_BASE}${path}${qs(options?.params)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 15000);

  try {
    if (__DEV__) {
      console.log("[fetch]", method, url,
        options?.params ? options?.params : "",
        options?.body ? safeJSON(options.body) : "");
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const data = text ? (tryParseJSON(text) ?? text) : null;

    if (res.ok) {
      if (__DEV__) console.log("[fetch ok]", res.status, typeof data === "object" ? safeJSON(data) : data);
      // 204 대응
      return (data as T) ?? (undefined as unknown as T);
    }

    // 2xx 이외: 에러 메시지 구성
    const msg =
      (isObj(data) && (data.message || data.error || data.detail)) ||
      res.statusText ||
      "요청 실패";

    const err = Object.assign(new Error(`[${res.status}] ${String(msg)}`), {
      status: res.status,
      data,
      url,
      method,
    });

    if (__DEV__) console.log("[fetch error]", err.message, "data:", safeJSON(data));
    throw err;
  } catch (e: any) {
    // Abort 보정
    if (e?.name === "AbortError") {
      const err = Object.assign(new Error("요청 시간이 초과되었습니다."), {
        aborted: true,
        url,
        method,
      });
      throw err;
    }
    // 네트워크 단절/호스트 미도달 등
    // e.message === 'Network request failed'
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

function tryParseJSON(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function isObj(v: any): v is Record<string, any> {
  return v && typeof v === "object";
}

// -------------------- 타입 --------------------

export type SignUpPayload = {
  email: string;
  password: string;
  username: string;
  code: string; // 이메일 인증 코드
  referralCode?: string;
};

export type SignUpResponse = {
  accessToken?: string;
  refreshToken?: string;
  [k: string]: any;
};

export type SigninResp = {
  accessToken?: string;
  token?: string;
  user?: { email?: string };
  email?: string;
  message?: string;
  statusCode?: number;
  errorCode?: string;
};

// -------------------- 공개 API --------------------

/** 이메일 존재 여부 확인
 *  - 200 응답: body에서 exists 추론
 *  - 404 응답: 미존재(false)로 간주
 *  - 그 외: 에러
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const url = `${API_BASE}${ENDPOINTS.EMAIL_CHECK}${qs({ email })}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (__DEV__) {
    let peek: any = null;
    try {
      const t = await res.clone().text();
      peek = t ? (tryParseJSON(t) ?? t) : null;
    } catch {}
    console.log("[authAPI] checkEmailExists", res.status, isObj(peek) ? safeJSON(peek) : peek);
  }

  if (res.status === 200) {
    const t = await res.text();
    const data = t ? (tryParseJSON(t) ?? t) : null;
    const exists =
      (isObj(data) && typeof data.exists === "boolean" && data.exists) ||
      (isObj(data) && isObj(data.data) && typeof data.data.exists === "boolean" && data.data.exists) ||
      data === true;
    return !!exists;
  }
  if (res.status === 404) return false;

  const rawText = await res.text();
  let raw: any = null;
  try { raw = JSON.parse(rawText); } catch { raw = rawText; }
  const msg = (isObj(raw) && (raw.message || raw.error || raw.detail)) || res.statusText || "이메일 확인 실패";
  throw Object.assign(new Error(`[${res.status}] ${String(msg)}`), { status: res.status, data: raw });
}

/** 인증 메일 발송 (스펙: POST /api/v1/auth/verify/email)
 *  body: { email, type: "emailVerification" }
 */
export async function sendVerificationEmail(email: string): Promise<void> {
  await requestJSON<void>("POST", ENDPOINTS.VERIFY_EMAIL_SEND, {
    body: { email, type: "emailVerification" },
  });
}

/** 이메일 인증 코드 검증 (서버에 해당 엔드포인트가 있을 때만 사용)
 *  기본 스펙 가정: POST /api/v1/auth/verify/email/code { email, code }
 *  서버가 다른 경로/키를 쓰면 ENDPOINTS/바디 키 수정
 */
export async function verifyEmailCode(email: string, code: string): Promise<void> {
  await requestJSON<void>("POST", ENDPOINTS.VERIFY_EMAIL_CODE, {
    body: { email, code },
  });
}

/** 회원가입 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  return requestJSON<SignUpResponse>("POST", ENDPOINTS.SIGN_UP, { body: payload });
}

/** 관리자/작가 로그인 */
export async function signin(email: string, password: string): Promise<SigninResp> {
  try {
    const data = await requestJSON<SigninResp>("POST", ENDPOINTS.ADMIN_SIGNIN, {
      body: { email, password },
    });

    const token = data.accessToken || (data as any).token;
    if (!token) {
      throw new Error("서버 응답에 accessToken이 없습니다.");
    }
    return data;
  } catch (e: any) {
    const code = e?.data?.errorCode || e?.status;
    if (code === "EMAIL_NOT_FOUND") {
      throw new Error("등록되지 않은 이메일입니다.");
    }
    if (e?.status === 403) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않거나 계정이 인증되지 않았습니다.");
    }
    throw new Error(e?.message || "로그인 요청 중 문제가 발생했습니다.");
  }
}
import * as SecureStore from 'expo-secure-store';

// 토큰 값을 SecureStore에 저장하는 함수
const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    // 토큰을 JSON 문자열로 변환하여 저장
    await SecureStore.setItemAsync('accessToken', JSON.stringify(accessToken));
    await SecureStore.setItemAsync('refreshToken', JSON.stringify(refreshToken));
    console.log("Tokens saved successfully.");
  } catch (error) {
    console.error("Failed to save tokens:", error);
  }
};

