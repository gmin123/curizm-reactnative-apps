import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

const GOOGLE_AUTH_URL = "https://api.curizm.io/api/v1/auth/google?mobile=true";
const KAKAO_AUTH_URL = "https://api.curizm.io/api/v1/auth/kakao?mobile=true";

// Expo Router 기준 가장 안정적인 딥링크
const REDIRECT_URI = Linking.createURL("oauth");

async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
  console.log("✅ 토큰 저장 완료");
}

async function handleOAuthLogin(authUrl: string) {
  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
  console.log("🔹 OAuth 결과:", result);

  if (result.type !== "success" || !result.url) {
    console.warn("⚠️ 로그인 취소 또는 실패:", result.type);
    return;
  }

  const parsed = Linking.parse(result.url);
  console.log("📌 파싱:", parsed);

  const accessToken = parsed.queryParams?.accessToken;
  const refreshToken = parsed.queryParams?.refreshToken;

  if (accessToken && refreshToken) {
    await saveTokens(accessToken, refreshToken);
    return true;
  }

  console.error("❌ 토큰 누락:", parsed.queryParams);
  return false;
}

export const googleLogin = () => handleOAuthLogin(GOOGLE_AUTH_URL);
export const kakaoLogin = () => handleOAuthLogin(KAKAO_AUTH_URL);
export const appleLogin = async () => {
  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      console.warn("⚠️ Apple 로그인 불가");
      return false;
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log("🍎 Apple 로그인 성공:", credential);

    const response = await fetch("https://api.curizm.io/api/v1/auth/apple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        userId: credential.user,
      }),
    });

    if (!response.ok) {
      console.error("❌ Apple 검증 실패");
      return false;
    }

    const data = await response.json();

    if (data.accessToken && data.refreshToken) {
      await saveTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      console.warn("⚠️ Apple 로그인 취소됨");
      return false;
    }
    console.error("❌ Apple 로그인 오류:", e);
    return false;
  }
};
