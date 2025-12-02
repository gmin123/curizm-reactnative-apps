// app/api/reward.ts
// Curizm Rewards API Client (완성본)

const BASE_URL = "https://api.curizm.io";

// ───────────────────────────────── Types
export type RewardType =
  | "DAILY_LOGIN"
  | "STREAK"
  | "CHAT_SHARE"
  | "REFERRAL_SENDER"
  | "REFERRAL_RECEIVER"
  | "OTHER";

export interface PendingReward {
  id: string; // encrypted_reward_id
  type: RewardType | string;
  coins: number;
  description: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PendingRewardsResp {
  pendingRewards: PendingReward[];
}

export interface ClaimResp {
  success: boolean;
  coinsAwarded: number;
  description?: string;
  newWalletBalance?: number;
  pendingRewardsCount?: number;
}

export interface ClaimAllResp {
  success: boolean;
  totalCoins: number;
  claimedCount: number;
  newWalletBalance: number;
  pendingRewardsCount: number;
}

export interface RewardStats {
  currentStreak: number;
  todayShares: number;
  referralCode?: string;
  totalReferrals?: number;
  pendingRewards?: number;
  totalEarned?: number;
}

export interface InviteUrlResp {
  referralCode: string;
  inviteUrl: string;       // e.g. https://api.curizm.io/api/v1/rewards/invite/ABC123
  directSignupUrl: string; // e.g. https://www.curizm.io/signup?referralCode=ABC123
}

export interface ReferralGenerateResp {
  referralCode: string;
}

export interface ReferralApplyResp {
  success: boolean;
  message: string;
  referrerRewardAdded?: boolean;
}

export interface DailyLoginStatus {
  canClaim: boolean;
  currentStreak: number;
  nextStreakReward?: number;
}

export interface CheckLoginResp {
  dailyReward: boolean;
  streakReward: boolean;
  currentStreak: number;
}

export interface CheckShareResp {
  shareReward: boolean;
  dailyShares: number;
  remainingShares: number;
}

// ───────────────────────────────── Internals
async function request<T>(
  path: string,
  opts: {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
    // 204/302 같은 예외 응답을 허용해야 하면 옵션 추가
    acceptNonJson?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", token, body, acceptNonJson = false } = opts;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 302 같은 리다이렉트는 API 설계상 클라이언트가 직접 열어야 하므로 여기서는 에러로 보지 않음
  if (!res.ok) {
    let errText = "";
    try {
      errText = await res.text();
    } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${errText}`);
  }

  if (acceptNonJson) {
    // 텍스트나 빈 본문을 허용
    // @ts-expect-error - 호출부에서 타입을 관리
    return undefined;
  }

  const text = await res.text();
  if (!text) {
    // @ts-expect-error - 호출부에서 타입을 관리
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // @ts-expect-error - 호출부에서 타입을 관리
    return text as unknown as T;
  }
}

// ───────────────────────────────── Rewards APIs

/** 보류 중인 리워드 조회 */
export async function getPendingRewards(token: string): Promise<PendingReward[]> {
  const json = await request<PendingRewardsResp>("/api/v1/rewards/pending", {
    token,
  });
  return json.pendingRewards ?? [];
}

/** 특정 리워드 수령 */
export async function claimReward(token: string, rewardId: string): Promise<ClaimResp> {
  return request<ClaimResp>(`/api/v1/rewards/claim/${encodeURIComponent(rewardId)}`, {
    method: "POST",
    token,
  });
}

/** 보류 중 리워드 전체 수령 */
export async function claimAllRewards(token: string): Promise<ClaimAllResp> {
  return request<ClaimAllResp>("/api/v1/rewards/claim-all", {
    method: "POST",
    token,
  });
}

/** 리워드 통계 (출석 연속일/오늘 공유 수/추천 코드 등) */
export async function getRewardStats(token: string): Promise<RewardStats> {
  return request<RewardStats>("/api/v1/rewards/stats", { token });
}

/** 초대(추천) 코드 발급/조회 */
export async function generateReferralCode(token: string): Promise<string> {
  const json = await request<ReferralGenerateResp>("/api/v1/rewards/referral/generate", {
    method: "POST",
    token,
  });
  return json.referralCode;
}

/** 초대(추천) 코드 적용 (기존 유저용) */
export async function applyReferralCode(token: string, referralCode: string) {
  return request<ReferralApplyResp>("/api/v1/rewards/referral/use", {
    method: "POST",
    token,
    body: { referralCode },
  });
}

/** 공유 가능한 초대 URL 생성 (리다이렉트 링크 & 직접 가입 링크 모두 제공) */
export async function getInviteUrls(token: string): Promise<InviteUrlResp> {
  return request<InviteUrlResp>("/api/v1/rewards/invite-url", { token });
}

/**
 * 초대 링크(리다이렉트)를 직접 열고 싶을 때는 이 함수 사용.
 * 서버가 302로 회원가입 페이지로 넘김 → 앱에선 Linking.openURL()로 여세요.
 */
export function buildInviteRedirectUrl(referralCode: string) {
  return `${BASE_URL}/api/v1/rewards/invite/${encodeURIComponent(referralCode)}`;
}

/** 일일 출석 가능한지 상태 확인 */
export async function getDailyLoginStatus(token: string): Promise<DailyLoginStatus> {
  return request<DailyLoginStatus>("/api/v1/rewards/daily-login/status", { token });
}

/** (테스트용) 수동 출석 체크 실행 → 보상 여부 반환 */
export async function checkDailyLogin(token: string): Promise<CheckLoginResp> {
  return request<CheckLoginResp>("/api/v1/rewards/check-login", {
    method: "POST",
    token,
  });
}

/** (테스트용) 채팅 공유 체크 실행 → 보상 여부 반환 */
export async function checkChatShare(token: string): Promise<CheckShareResp> {
  return request<CheckShareResp>("/api/v1/rewards/check-chat-share", {
    method: "POST",
    token,
  });
}

// ───────────────────────────────── Helpers (선택)
/** 초대 공유 메시지 구성 헬퍼 */
export async function buildInviteShareMessage(token: string) {
  const { referralCode, inviteUrl, directSignupUrl } = await getInviteUrls(token);
  const title = "큐리즘에 초대합니다 🎨";
  const message = `제 초대 코드: ${referralCode}\n아래 링크로 가입하면 코인 보상을 받아요!\n\n즉시 가입: ${directSignupUrl}\n브라우저 리다이렉트: ${inviteUrl}`;
  return { referralCode, inviteUrl, directSignupUrl, title, message };
}
