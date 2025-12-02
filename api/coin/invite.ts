// invite.ts
const API_BASE_URL = "https://api.curizm.io/api/v1";

export const getInviteUrl = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewards/invite-url`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`❌ 서버 응답 실패: ${response.status}`);
    }

    const data = await response.json();
    // { referralCode, inviteUrl, directSignupUrl }
    return data;
  } catch (error) {
    console.error("❌ 초대 코드 가져오기 실패:", error);
    throw error;
  }
};
