import * as SecureStore from "expo-secure-store";

type StoredUser = { email: string; token: string; password?: string };

const BASE = "https://api.curizm.io/api/v1";

async function getStoredUser(): Promise<StoredUser> {
  const json = await SecureStore.getItemAsync("user");
  if (!json) throw new Error("로그인이 필요합니다.");
  return JSON.parse(json);
}

async function setStoredUser(user: StoredUser) {
  await SecureStore.setItemAsync("user", JSON.stringify(user));
}

/** 현재 로그인된 유저 이메일 (저장값 기반) */
export async function getMemberEmail(): Promise<string> {
  const user = await getStoredUser();
  return user.email;
}

/** ✅ 서버에서 현재 비밀번호 검증 (실제 변경 API로 테스트) */
export async function verifyCurrentPassword(inputPw: string): Promise<boolean> {
  const user = await getStoredUser();

  console.log("🔄 서버 비밀번호 검증 시도 (변경 API 테스트):", {
    hasToken: !!user.token,
    passwordLength: inputPw.length
  });

  try {
    // 현재 비밀번호와 동일한 새 비밀번호로 변경 시도 (실제로는 변경되지 않음)
    const res = await fetch(`${BASE}/member/password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        oldPassword: inputPw, 
        newPassword: inputPw // 같은 비밀번호로 설정
      }),
    });

    console.log("📡 비밀번호 검증 API 응답:", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    });

    if (res.ok) {
      console.log("✅ 현재 비밀번호 검증 성공");
      return true;
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.warn("❌ 현재 비밀번호 검증 실패:", {
        status: res.status,
        error: errorData
      });
      return false;
    }
  } catch (error) {
    console.error("❌ 비밀번호 검증 실패:", error);
    return false;
  }
}

/** ✅ 로컬에서 현재 비밀번호 검증 (백업용) */
export async function verifyLocalPassword(inputPw: string): Promise<boolean> {
  const user = await getStoredUser();
  
  console.log("🔍 로컬 저장된 사용자 정보:", {
    hasEmail: !!user.email,
    hasToken: !!user.token,
    hasPassword: !!user.password,
    passwordLength: user.password?.length || 0
  });
  
  if (!user.password) {
    console.warn("⚠️ 로컬에 저장된 비밀번호가 없음 - 로그인 시 저장되지 않았을 수 있음");
    // 로그인 시 password를 저장하지 않았다면 로컬 검증 불가
    // 이 경우 false를 반환해서 서버 검증으로 넘어가도록 함
    return false;
  }
  
  const isMatch = user.password === inputPw;
  console.log("🔐 로컬 비밀번호 비교 결과:", {
    inputLength: inputPw.length,
    storedLength: user.password.length,
    isMatch
  });
  
  return isMatch;
}

/** 비밀번호 변경 API 호출 */
export async function changeMemberPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getStoredUser();

  console.log("🔄 비밀번호 변경 API 호출 시작");
  
  // API 문서에 따라 정확히 oldPassword, newPassword 사용
  const requestBody = { 
    oldPassword: currentPassword, 
    newPassword: newPassword 
  };
  
  console.log("📤 API 요청 정보:", {
    url: `${BASE}/member/password`,
    method: "PUT",
    hasToken: !!user.token,
    body: requestBody
  });
  
  const res = await fetch(`${BASE}/member/password`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${user.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("❌ 비밀번호 변경 실패:", {
      status: res.status,
      statusText: res.statusText,
      error: err,
      requestBody: requestBody
    });
    
    // 구체적인 에러 메시지 처리
    if (res.status === 400) {
      let errorMessage = "요청 형식이 올바르지 않습니다";
      
      if (err.message && Array.isArray(err.message)) {
        errorMessage = `입력값 오류: ${err.message.join(', ')}`;
      } else if (err.message?.message && Array.isArray(err.message.message)) {
        errorMessage = `입력값 오류: ${err.message.message.join(', ')}`;
      } else if (err.message) {
        errorMessage = `입력값 오류: ${err.message}`;
      }
      
      throw new Error(errorMessage);
    } else if (res.status === 401) {
      throw new Error("현재 비밀번호가 올바르지 않습니다");
    } else if (res.status === 403) {
      throw new Error("비밀번호 변경 권한이 없습니다");
    }
    
    throw new Error(err.message || "비밀번호 변경에 실패했습니다");
  }

  const result = await res.json();
  console.log("✅ 비밀번호 변경 성공:", result);

  // ✅ 서버 변경 성공 시 로컬에 저장된 password도 갱신
  await setStoredUser({ ...user, password: newPassword });
}
