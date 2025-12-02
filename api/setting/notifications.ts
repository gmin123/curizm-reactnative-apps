// app/api/notifications.ts

// ✅ 환경변수(있으면 사용) → 없으면 기본값
//   Expo에서는 EXPO_PUBLIC_* 만 클라이언트에서 접근 가능
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "https://api.curizm.io"; // <- 필요하면 .com 으로 바꿔

// -----------------------------
// 타입 정의
// -----------------------------
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  image?: string;
  createdAt: string;
  read?: boolean;
}

// 공통 fetch 헬퍼 (에러 처리)
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  // 204 같은 경우 대비
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// -----------------------------
// 알림 목록 가져오기
// -----------------------------
export async function apiGetNotifications(
  token: string
): Promise<NotificationItem[]> {
  return request<NotificationItem[]>("/api/v1/member/notices", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // GET은 Content-Type 불필요
    },
  });
}

// -----------------------------
// 알림 읽음 처리 (현재 문서에 API 미정 → 더미)
// -----------------------------
export async function apiMarkNotificationRead(
  _token: string,
  id: string
) {
  console.log("읽음 처리 (stub):", id);
  // 실제 API 생기면 여기서 PUT 호출
  return true;
}

// -----------------------------
// 마케팅 푸시 알림 설정 변경
// -----------------------------
export async function apiSetMarketingPush(
  token: string,
  agreed: boolean
) {
  return request(`/api/v1/member/marketing`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agreed }),
  });
}

// -----------------------------
// 버전/야간 알림 설정 변경
// -----------------------------
export async function apiSetVersionPush(
  token: string,
  agreed: boolean
) {
  return request(`/api/v1/member/version`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agreed }),
  });
}
