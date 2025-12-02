// app/api/account.ts
const BASE = "https://api.curizm.io";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** 공통: 인증 토큰 포함 fetch */
async function authedFetch<T>(
  path: string,
  token: string,
  method: HttpMethod = "GET",
  body?: any,
  extraInit: RequestInit = {},
  timeoutMs = 12000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(extraInit.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...extraInit,
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
    // 204 대응
    return text ? (JSON.parse(text) as T) : ({} as T);
  } finally {
    clearTimeout(id);
  }
}

/* ---------------- API 경로 ---------------- */
const PATHS = {
  logout: "/api/v1/auth/logout",                 // POST
  withdraw: "/api/v1/member",                    // DELETE
  changePassword: "/api/v1/member/password",     // PATCH { currentPassword, newPassword }

  // (선택) 서버가 지원할 때만 사용
  resetPasswordRequest: "/api/v1/auth/password/reset/request",  // POST { email }
  resetPasswordConfirm: "/api/v1/auth/password/reset/confirm",  // POST { token, newPassword }
};

/* ---------------- 세션/계정 ---------------- */
export async function apiLogout(token: string) {
  console.log("[apiLogout] POST", PATHS.logout);
  return authedFetch(PATHS.logout, token, "POST");
}


/* ---------------- 비밀번호 변경 (로그인 상태) ---------------- */
// 기본형: 현재 비번 + 새 비번
export async function apiChangePassword(
  token: string,
  currentPassword: string,
  newPassword: string
) {
  console.log("[apiChangePassword] PATCH", PATHS.changePassword);
  return authedFetch(PATHS.changePassword, token, "PATCH", {
    currentPassword,
    newPassword,
  });
}

// 확장형(백엔드가 지원하면): 새 비번 확인값 포함
export async function apiChangePasswordWithConfirm(
  token: string,
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string
) {
  console.log("[apiChangePasswordWithConfirm] PATCH", PATHS.changePassword);
  return authedFetch(PATHS.changePassword, token, "PATCH", {
    currentPassword,
    newPassword,
    newPasswordConfirm, // 서버가 이 키를 지원할 때만 사용
  });
}

/* ---------------- 비밀번호 재설정(로그아웃 상태) — 선택 사항 ---------------- */
// 1) 재설정 메일 요청
export async function apiResetPasswordRequest(email: string) {
  console.log("[apiResetPasswordRequest] POST", PATHS.resetPasswordRequest, { email });
  const res = await fetch(`${BASE}${PATHS.resetPasswordRequest}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
  return text ? JSON.parse(text) : {};
}

// 2) 메일 링크/토큰으로 최종 재설정
export async function apiResetPasswordConfirm(token: string, newPassword: string) {
  console.log("[apiResetPasswordConfirm] POST", PATHS.resetPasswordConfirm);
  const res = await fetch(`${BASE}${PATHS.resetPasswordConfirm}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${text || res.statusText}`);
  return text ? JSON.parse(text) : {};
}




export async function apiPasswordReset(params: {
  email: string;
  password: string;
  code: string;
}) {
  const res = await fetch(`${BASE}/api/v1/auth/password-reset`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const text = await res.text();
  if (!res.ok) {
    // 서버가 에러 메시지를 내려줄 수 있으니 그대로 보여주기
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) as { accessToken?: string; refreshToken?: string } : {};
}
// app/api/setting/settingapi.ts
export async function apiUpdateProfile(
  token: string,
  name?: string,
  profileImg?: string
) {
  return authedFetch("/api/v1/member", token, "PATCH", { name, profileImg });
}
// src/api/setting/settingapi.ts
const API_BASE = "https://api.curizm.io/api/v1";

export async function apiWithdraw(token: string) {
  const res = await fetch(`${API_BASE}/auth/user/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `탈퇴 실패 (HTTP ${res.status})`);
  }

  return res.json().catch(() => ({}));
}
