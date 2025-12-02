// services/rewardService.ts
import { useAuth } from "@/app/context/AuthContext";

const API_BASE_URL = "https://api.curizm.io";

export type PendingReward = {
  id: string;
  type: string;
  coins: number;
  description: string;
  createdAt: string;
  expiresAt?: string;
};

export type StatsData = {
  currentStreak: number;
  todayShares: number;
  referralCode: string;
  totalReferrals: number;
  pendingRewards: number;
  totalEarned: number;
};

export type InviteUrlData = {
  referralCode: string;
  inviteUrl: string;
  directSignupUrl: string;
};

export const useRewardService = () => {
  const { user } = useAuth();
  const token = user?.token;

  // ✅ 공통 fetch wrapper + 디버깅 로그
  const request = async (endpoint: string, options?: RequestInit) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 [API 요청 시작] ${options?.method || "GET"} ${fullUrl}`);

    try {
      const res = await fetch(fullUrl, {
        ...options,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });

      console.log(`📬 [응답 상태] ${res.status} ${endpoint}`);

      if (!res.ok) {
        const errMsg = await res.text();
        console.error(`❌ [API 실패] ${endpoint}`, errMsg);
        throw new Error(`API 실패 (${res.status}): ${errMsg}`);
      }

      const json = await res.json();
      console.log(`✅ [API 성공] ${endpoint}`, json);
      return json;
    } catch (err) {
      console.error(`🚨 [API 에러 발생] ${endpoint}`, err);
      throw err;
    }
  };

  return {
    /** 🔗 초대 URL 가져오기 */
    getInviteUrl: async (): Promise<InviteUrlData> => {
      console.log("▶️ getInviteUrl() 호출됨");
      return request("/api/v1/rewards/invite-url");
    },

    /** ⏳ 대기 중인 리워드 목록 가져오기 */
    getPendingRewards: async (): Promise<PendingReward[]> => {
      console.log("▶️ getPendingRewards() 호출됨");
      const json = await request("/api/v1/rewards/pending");
      return json.pendingRewards ?? [];
    },

    /** 🎁 개별 리워드 받기 */
    claimReward: async (rewardId: string): Promise<{
      success: boolean;
      coinsAwarded: number;
      newWalletBalance: number;
      claimedCount?: number;
    }> => {
      console.log(`▶️ claimReward(${rewardId}) 호출됨`);
      return request(`/api/v1/rewards/claim/${rewardId}`, { method: "POST" });
    },

    /** 💰 모든 리워드 일괄 받기 */
    claimAllRewards: async (): Promise<{
      success: boolean;
      totalCoins: number;
      claimedCount: number;
      newWalletBalance: number;
    }> => {
      console.log("▶️ claimAllRewards() 호출됨");
      return request("/api/v1/rewards/claim-all", { method: "POST" });
    },

    /** 📊 리워드 통계 가져오기 */
    getStats: async (): Promise<StatsData> => {
      console.log("▶️ getStats() 호출됨");
      return request("/api/v1/rewards/stats");
    },

    /** 🧾 추천 코드 생성 또는 조회 */
    generateReferralCode: async (): Promise<{ referralCode: string }> => {
      console.log("▶️ generateReferralCode() 호출됨");
      return request("/api/v1/rewards/referral/generate", { method: "POST" });
    },

    /** 🎟 추천 코드 등록 */
    useReferralCode: async (referralCode: string): Promise<{
      success: boolean;
      message: string;
      referrerRewardAdded?: boolean;
    }> => {
      console.log(`▶️ useReferralCode(${referralCode}) 호출됨`);
      return request("/api/v1/rewards/referral/use", {
        method: "POST",
        body: JSON.stringify({ referralCode }),
      });
    },

    /** 📅 오늘 출석 리워드 가능한지 확인 */
    checkDailyLoginStatus: async (): Promise<{
      canClaim: boolean;
      currentStreak: number;
      nextStreakReward: number;
    }> => {
      console.log("▶️ checkDailyLoginStatus() 호출됨");
      return request("/api/v1/rewards/daily-login/status");
    },

    /** 🧾 리워드 페이지 전체 데이터 (잔액 + 통계 + 대기리워드) */
    getPageData: async (): Promise<{
      walletBalance: number;
      stats: StatsData;
      pendingRewards: PendingReward[];
    }> => {
      console.log("▶️ getPageData() 호출됨");
      return request("/api/v1/rewards/page-data");
    },
  };
};
