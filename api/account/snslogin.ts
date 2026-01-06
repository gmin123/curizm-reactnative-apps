import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_URL = "https://api.curizm.io/api/v1/auth/google?mobile=true";
const KAKAO_AUTH_URL = "https://api.curizm.io/api/v1/auth/kakao?mobile=true";
const API_BASE = "https://api.curizm.io";

// app.json에 scheme: "godori" → godori://oauth
const REDIRECT_URI = Linking.createURL("oauth");

// --------------------
// 토큰 저장
// --------------------
async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
  console.log("✅ 토큰 저장 완료");
}

// --------------------
// member 프로필 조회
// --------------------
async function fetchMemberProfile(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/v1/member`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`member 조회 실패 (${res.status})`);
  }

  return res.json(); // { id, email, name, profileImg, ... }
}

// --------------------
// OAuth 공통 처리
// --------------------
async function handleOAuthLogin(authUrl: string) {
  console.log("REDIRECT_URI:", REDIRECT_URI);

  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
  console.log("🔹 OAuth 결과:", result.type);

  if (result.type !== "success" || !result.url) {
    console.warn("⚠️ 로그인 취소/실패:", result.type);
    return null;
  }

  const parsed = Linking.parse(result.url);
  const qp = parsed.queryParams ?? {};
  console.log("📌 파싱 query:", qp);

  // 서버 에러 처리
  if (qp.errorCode) {
    console.warn("❌ OAuth 에러:", qp.errorCode, qp.message);
    return null;
  }

  const accessToken = qp.accessToken as string | undefined;
  const refreshToken = qp.refreshToken as string | undefined;

  if (!accessToken || !refreshToken) {
    console.error("❌ 토큰 누락:", qp);
    return null;
  }

  // 1️⃣ 토큰 저장
  await saveTokens(accessToken, refreshToken);

  // 2️⃣ member 데이터 조회 (🔥 로그인 확정 단계)
  const member = await fetchMemberProfile(accessToken);

  console.log("✅ 로그인 완료 - member:", member);

  // 3️⃣ 로그인 성공 시 member 반환
  return {
    accessToken,
    refreshToken,
    member, // { id, email, name, profileImg, ... }
  };
}

// --------------------
// 외부에서 쓰는 함수
// --------------------
export const googleLogin = () => handleOAuthLogin(GOOGLE_AUTH_URL);
export const kakaoLogin = () => handleOAuthLogin(KAKAO_AUTH_URL);
