import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthUser {
  email: string;
  token: string;
  name?: string;
  profileImg?: string;
  marketing?: boolean;
  newVersionAlarm?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUser | null;
  isLoading: boolean;
  initialized: boolean;
  login: (
    email: string,
    token: string,
    name?: string,
    profileImg?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL = "https://api.curizm.io";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);

  /** 🔥 중요: 초기화 상태 분리 */
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * ✅ 앱 시작 시 SecureStore에서 로그인 정보 복구
   * - 이 단계가 끝나기 전에는 어떤 라우팅도 하면 안 됨
   */
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedUser) {
          const parsed: AuthUser = JSON.parse(storedUser);
          setUser(parsed);
          setProfile(parsed);

          // 🔥 토큰이 있으면 최신 프로필 동기화
          if (parsed.token) {
            await fetchProfile(parsed.token);
          }
        }
      } catch (error) {
        console.error("❌ Error loading user from SecureStore", error);
      } finally {
        setIsLoading(false);
        setInitialized(true); // ⭐ 이게 핵심
      }
    };

    loadUserFromStorage();
  }, []);

  /**
   * ✅ 로그인 (OAuth 포함)
   * - OAuth 성공 시 반드시 이 함수 호출해야 함
   */
  const login = async (
    email: string,
    token: string,
    name?: string,
    profileImg?: string
  ) => {
    const newUser: AuthUser = {
      email,
      token,
      name,
      profileImg,
    };

    setUser(newUser);
    setProfile(newUser);

    try {
      await SecureStore.setItemAsync("user", JSON.stringify(newUser));
      await fetchProfile(token); // 최신 프로필 동기화
    } catch (error) {
      console.error("❌ Error saving user to SecureStore", error);
    }
  };

  /**
   * ✅ 로그아웃
   */
  const logout = async () => {
    setUser(null);
    setProfile(null);

    try {
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.error("❌ Error removing user from SecureStore", error);
    }
  };

  /**
   * ✅ 서버에서 최신 프로필 가져오기
   */
  const fetchProfile = async (token: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/member`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn("⚠️ 프로필 요청 실패:", res.status);
        return;
      }

      const data = await res.json();

      const updatedUser: AuthUser = {
        email: data.email ?? user?.email ?? "",
        name: data.name ?? user?.name ?? "",
        profileImg: data.profileImg ?? user?.profileImg ?? "",
        marketing: data.marketing ?? false,
        newVersionAlarm: data.newVersionAlarm ?? false,
        token,
      };

      setUser(updatedUser);
      setProfile(updatedUser);
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("❌ 프로필 불러오기 오류:", error);
    }
  };

  /**
   * ✅ 외부에서 프로필 강제 갱신
   */
  const refreshProfile = async () => {
    if (user?.token) {
      await fetchProfile(user.token);
    }
  };

  /**
   * 🔥 가장 중요
   * 초기화가 끝나기 전에는 children 렌더링 자체를 막음
   * → 이게 page not found / 이중 redirect 원인 제거
   */
  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        initialized,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * ✅ 커스텀 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
