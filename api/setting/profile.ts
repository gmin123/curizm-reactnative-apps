// src/api/setting/change.ts
import { Platform } from "react-native";

export type MeResponse = {
  email: string;
  name?: string | null;
  profileImg?: string | null;
  // 필요시 마케팅/알림 같은 필드도 추가: marketing?: boolean; newVersionAlarm?: boolean;
};

const BASE = "https://api.curizm.io/api/v1";
const ENDPOINTS = {
  me: `${BASE}/member`,              // GET /api/v1/member  ← 조회
  updateProfile: `${BASE}/member`,   // PUT /api/v1/member  ← 수정
  // 일반적인 파일 업로드 엔드포인트들을 시도
  uploadProfileImage: `${BASE}/files/upload`,  // 일반적인 파일 업로드 경로
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/** 공통 에러 파서: [코드] 메시지 */
async function parseErrorResponse(res: Response) {
    const raw = await res.text();
    try {
      const json = JSON.parse(raw);
  
      // message/error/detail이 객체일 수도 있으니 안전하게 문자열화
      const toStr = (v: any) => {
        if (v == null) return "";
        if (typeof v === "string") return v;
        try { return JSON.stringify(v); } catch { return String(v); }
      };
  
      // 자주 쓰는 필드들에서 메시지 뽑기
      let msg =
        toStr(json.message) ||
        toStr(json.error) ||
        toStr(json.detail) ||
        toStr(json.errors) || // bean validation 계열
        toStr(json.data) ||
        raw ||
        `${res.status} ${res.statusText}`;
  
      // 필드 에러 배열 형태일 때 첫 메시지 보강 (예: [{field, defaultMessage}])
      if (Array.isArray(json.errors) && json.errors.length > 0) {
        const first = json.errors[0];
        const field = first.field || first.name;
        const dmsg = first.defaultMessage || first.message || first.reason;
        msg = `${msg} (${field ? field + ": " : ""}${toStr(dmsg)})`;
      }
  
      return { status: res.status, message: msg, json, raw };
    } catch {
      return { status: res.status, message: raw || `${res.status} ${res.statusText}` };
    }
  }
  
/** 안전 JSON */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function guessFilename(uri: string) {
  const last = uri.split("/").pop() || "profile.jpg";
  return /\.[a-zA-Z0-9]+$/.test(last) ? last : `${last}.jpg`;
}
function guessMimeType(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}
function normalizeUri(uri: string) {
  // iOS는 file:// 필요, Android는 그대로 OK
  if (Platform.OS === "ios" && !uri.startsWith("file://")) return `file://${uri}`;
  return uri;
}

/** 내 정보 가져오기: GET /api/v1/member */
export async function apiGetMe(token: string): Promise<MeResponse> {
  const res = await fetch(ENDPOINTS.me, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw new Error(`[${err.status}] ${err.message}`);
  }
  return res.json();
}

// src/api/setting/change.ts
// ... (생략: 위에서 쓰던 동일 코드 유지)

export async function apiUpdateProfile(
    token: string,
    payload: { name?: string; profileImg?: string | undefined }   // ✅ name 다시 추가
  ): Promise<void> {
    const res = await fetch(ENDPOINTS.updateProfile, {
      method: "PUT",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),               // ✅ name과 profileImg 모두 보냄
    });
    if (!res.ok) {
      const err = await parseErrorResponse(res);
      throw new Error(`[${err.status}] ${err.message}`);
    }
  }
  
/** 프로필 이미지 업로드 (multipart/form-data) → 업로드된 URL 반환 */
export async function apiUploadProfileImage(
  token: string,
  localUri: string,
  filename?: string
): Promise<{ url: string }> {
  const name = filename ?? guessFilename(localUri);
  const type = guessMimeType(name);

  // 여러 엔드포인트와 필드명을 시도
  const uploadAttempts = [
    { endpoint: `${BASE}/files/upload`, field: "file" },
    { endpoint: `${BASE}/upload`, field: "file" },
    { endpoint: `${BASE}/member/upload-image`, field: "image" },
    { endpoint: `${BASE}/member/profile-image`, field: "profileImage" },
    { endpoint: `${BASE}/upload/profile`, field: "file" },
  ];

  let lastError: any;

  for (const attempt of uploadAttempts) {
    try {
      console.log(`🔄 업로드 시도: ${attempt.endpoint} (필드: ${attempt.field})`);
      
      const form = new FormData();
      form.append(attempt.field, {
        // @ts-ignore: RN FormData 파일 객체
        uri: normalizeUri(localUri),
        name,
        type,
      });

      const res = await fetch(attempt.endpoint, {
        method: "POST",
        headers: { ...authHeaders(token) },
        body: form,
      });

      if (res.ok) {
        const data = await safeJson(res);
        const url = data?.url ?? data?.profileImg ?? data?.profileImgUrl ?? data?.path ?? data?.data?.url ?? data?.fileUrl;
        if (url) {
          console.log(`✅ 업로드 성공: ${attempt.endpoint}`);
          return { url };
        }
      }

      const err = await parseErrorResponse(res);
      lastError = new Error(`[${err.status}] ${err.message}`);
      console.log(`❌ ${attempt.endpoint} 실패:`, lastError.message);
      
    } catch (e: any) {
      lastError = e;
      console.log(`❌ ${attempt.endpoint} 에러:`, e.message);
    }
  }

  // 모든 시도가 실패한 경우
  throw lastError || new Error("모든 업로드 엔드포인트 시도 실패");
}
