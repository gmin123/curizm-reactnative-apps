// ✅ Curizm 일반 사용자용 결제 API
const BASE_URL = "https://api.curizm.io";

/** 🔹 1️⃣ 코인 지갑 정보 조회 */
export const getWalletInfo = async (token: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/payment/wallet`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ [API 오류] getWalletInfo 실패:", err);
    throw err;
  }
};

/** 🔹 2️⃣ 결제 패키지 목록 조회 */
export const getPaymentPackages = async (token: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/payment/packages`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ [API 오류] getPaymentPackages 실패:", err);
    throw err;
  }
};

export const createPaymentRequest = async (
  token: string,
  packageId: string,
  successUrl: string,
  failUrl: string
) => {
  try {
    console.log("📡 [API 요청] POST /api/v1/payment/request", { packageId });
    const res = await fetch("https://api.curizm.io/api/v1/payment/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packageId,
        successUrl,
        failUrl,
      }),
    });

    console.log("📬 응답 상태:", res.status);
    const text = await res.text();
    console.log("📦 응답 원문:", text);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ [API 오류] createPaymentRequest 실패:", err);
    throw err;
  }
};


/** 🔹 4️⃣ 결제 확인 */
export const confirmPayment = async (
  token: string,
  paymentKey: string,
  orderId: string,
  amount: number
) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/payment/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ [API 오류] confirmPayment 실패:", err);
    throw err;
  }
};

// ✅ 2️⃣ 코인 거래 내역 조회
export const getCoinLedgers = async (token: string, page = 1, limit = 20) => {
  try {
    console.log("📡 [API 요청] GET /payment/ledger");
    const res = await fetch(
      `${BASE_URL}/api/v1/payment/ledger?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log("✅ [API 응답] ledger:", json);

    return json.ledgers ?? [];
  } catch (err) {
    console.error("❌ [API 오류] getCoinLedgers 실패:", err);
    throw err;
  }
};
