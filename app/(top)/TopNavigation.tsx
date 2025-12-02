import { useAuth } from "@/app/context/AuthContext";
import clogo from "@/assets/images/icon.png";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TopNavigation() {
  const { user, isLoading } = useAuth();
  const [navPending, setNavPending] = useState(false);

  /** ✅ 표시용 이니셜 (닉네임 기준, 없으면 빈값) */
  const initial = useMemo(() => {
    const src = user?.name?.trim();
    if (!src) return "";
    const ch = src[0]?.toUpperCase?.();
    return ch || "";
  }, [user]);

  const goSearch = useCallback(() => {
    router.push("/(search)/Search");
  }, []);

  const goHome = useCallback(() => {
    router.push("/(mainpage)");
  }, []);

  const goAvatar = useCallback(() => {
    if (navPending) return;
    setNavPending(true);
    requestAnimationFrame(() => {
      if (user) router.push("/(MyStorage)/MyStorage");
      else router.push("/(Login)/LoginChoiceScreen");
      setNavPending(false);
    });
  }, [navPending, user]);

  /** ✅ 아바타 표시 로직 */
  const Avatar = () => {
    // 로그인 X → 기본 아이콘
    if (!user) {
      return (
        <View style={[styles.avatarCircle, { backgroundColor: "#EEE" }]}>
          <Ionicons name="person" size={18} color="#999" />
        </View>
      );
    }

    // 로그인 O + 프로필 이미지 O
    if (user?.profileImg && user.profileImg.trim()) {
      return (
        <Image
          source={{ uri: user.profileImg }}
          style={styles.avatarImg}
          onLoad={() =>
            console.log("✅ 프로필 이미지 로드 성공:", user.profileImg)
          }
          onError={(error) =>
            console.warn(
              "❌ 프로필 이미지 로드 실패:",
              error.nativeEvent?.error
            )
          }
        />
      );
    }

    // 로그인 O + 닉네임(name) 존재 → 첫 글자 표시
    if (initial) {
      return (
        <View style={[styles.avatarCircle, { backgroundColor: "#E8ECF4" }]}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      );
    }

    // 로그인 O + 닉네임 없음 → 기본 아이콘
    return (
      <View style={[styles.avatarCircle, { backgroundColor: "#EEE" }]}>
        <Ionicons name="person" size={18} color="#999" />
      </View>
    );
  };

  // 로딩 중 처리
  if (isLoading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={goHome}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={clogo} style={styles.logoImage} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.rightContainer}>
          <Ionicons name="search" size={24} color="#ccc" />
          <View style={[styles.avatarCircle, { backgroundColor: "#EEE" }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goHome}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image source={clogo} style={styles.logoImage} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.rightContainer}>
        <TouchableOpacity
          onPress={goSearch}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goAvatar}
          disabled={navPending}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Avatar />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingTop: 25,
    backgroundColor: "#fff",

  },
  logoImage: { width: 100, height: 30 },
  rightContainer: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#EEE",
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 14, fontWeight: "700", color: "#333" },
});
