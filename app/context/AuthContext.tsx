import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  isLoading: boolean;
  profile: AuthUser | null;
  login: (email: string, token: string, name?: string, profileImg?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL = "https://api.curizm.io"; // ✅ 서버 주소

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ SecureStore에서 유저 불러오기
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          await fetchProfile(parsed.token); // 🔥 로그인 상태면 프로필 자동 갱신
        }
      } catch (error) {
        console.error("❌ Error loading user from SecureStore", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  // ✅ 로그인 시 유저 저장
  const login = async (email: string, token: string, name?: string, profileImg?: string) => {
    const newUser: AuthUser = { email, token, name, profileImg };
    setUser(newUser);
    setProfile(newUser);
    try {
      await SecureStore.setItemAsync("user", JSON.stringify(newUser));
      await fetchProfile(token); // 🔥 로그인 직후 최신 프로필 가져오기
    } catch (error) {
      console.error("❌ Error saving user to SecureStore", error);
    }
  };

  // ✅ 로그아웃
  const logout = async () => {
    setUser(null);
    setProfile(null);
    try {
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.error("❌ Error removing user from SecureStore", error);
    }
  };

  // ✅ 서버에서 최신 프로필 가져오기
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
      console.log("📥 프로필 정보:", data);

      const updatedUser: AuthUser = {
        ...user,
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

  // ✅ 외부에서 강제 갱신 (예: 프로필 수정 후 호출)
  const refreshProfile = async () => {
    if (user?.token) await fetchProfile(user.token);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, profile, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
