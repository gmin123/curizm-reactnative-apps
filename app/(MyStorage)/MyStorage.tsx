import { getWalletInfo } from "@/api/setting/buycoin";
import { useAuth } from "@/app/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../(mainpage)/(maincontents)/(Exhi)/style/MyStorage.styles";
import FollowedArtists from "./setting/storage/FollowedArtists";
import LikedArtworks from "./setting/storage/LikedArtworks";
import LikedExhibitions from "./setting/storage/LikedExhibitions";

// ===================== 이동 경로 =====================
export const goReward = () => router.push("/(mainpage)/rewards/RewardsPage");
export const goSetting = () => router.push("./MySetting");
export const goCharge = () => router.push("/settings/CoinTopup");
export const goNotification = () => router.push("/(MyStorage)/QuriNotices");
export const goProfile = () => router.push("/(MyStorage)/setting/ProfileManage");

const TAB_LIST = [
  { key: "artwork", label: "작품" },
  { key: "artist", label: "작가" },
  { key: "exhibition", label: "전시" },
  { key: "purchase", label: "구매" },
  { key: "think", label: "생각" },
];

export default function MyStorage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("artwork");
  const [member, setMember] = useState({
    name: "",
    email: "",
    profileImg: "",
  });
  const [coin, setCoin] = useState<number>(0);

  const token = user?.token ?? "";

  // ✅ 사용자 정보 세팅
  useEffect(() => {
    if (user) {
      setMember({
        name: user.name ?? "",
        email: user.email ?? "",
        profileImg: user.profileImg ?? "",
      });
    }
  }, [user]);

  // ✅ 코인 정보 불러오기
  useEffect(() => {
    const loadWallet = async () => {
      if (!token) return;

      try {
        const res = await getWalletInfo(token);
        setCoin(res.balance ?? 0);
      } catch (err) {
        console.error("❌ 코인 불러오기 실패:", err);
      }
    };
    loadWallet();
  }, [token]);

  // ✅ 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (tab) {
      case "artwork":
        return <LikedArtworks data={[]} />;

      case "artist":
        return <FollowedArtists data={[]} onFollowToggle={() => {}} />;

      case "exhibition":
        return <LikedExhibitions data={[]} />;

      case "purchase":
        return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#ABB0BE", fontSize: 14 }}>구매한 작품이 없습니다.</Text>
          </View>
        );

      case "think": // ⭐ 반드시 추가해야 함
        return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#ABB0BE", fontSize: 14 }}>작성된 생각 노트가 없습니다.</Text>
          </View>
        );

      default:
        return null;
    }
  };

  // ===================== UI =====================
  return (
    <SafeAreaView style={{ flex: 1,paddingTop:10, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />

      {/* 상단 */}
      <View style={styles.topRow}>
        <Text style={styles.topTitle}>보관함</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={goNotification}>
            <MaterialIcons name="notifications-none" size={22.5} color="#23242B" style={{ marginRight: 16 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goSetting}>
            <MaterialIcons name="settings" size={21} color="#23242B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 프로필 */}
      <View style={styles.profileRow}>
        <View style={styles.avatarCircle}>
          {member.profileImg ? (
            <Image source={{ uri: member.profileImg }} style={{ width: 42, height: 42, borderRadius: 21 }} />
          ) : (
            <Text style={styles.avatarInitial}>
              {member.name?.[0] ?? member.email?.[0] ?? "?"}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {member.name.trim() || member.email.trim() || "사용자 이름"}
          </Text>

          <TouchableOpacity onPress={goProfile}>
            <Text style={styles.infoManage}>회원 정보 관리 &gt;</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 코인 카드 */}
      <View style={styles.coinCard}>
        <Text style={styles.coinLabel}>보유 코인</Text>

        <View style={styles.coinRow1}>
          <Text style={styles.coinValue}>{coin.toLocaleString()} 코인</Text>

          <TouchableOpacity style={styles.fillBtn} onPress={goCharge}>
            <Text style={styles.fillBtnTxt}>충전하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coinRow2}>
          <TouchableOpacity style={styles.rewardTouch} onPress={goReward}>
            <Text style={styles.rewardLabel}>리워드 받기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rewardGoTouch} onPress={goReward}>
            <Text style={styles.rewardGo}>
              일일 미션 달성하고 코인 받기 <Text style={styles.rewardArrow}>〉</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 탭 */}
      <View style={styles.tabBar}>
        {TAB_LIST.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[
              styles.tabBtn,
              tab === t.key && styles.tabActive,
              { paddingHorizontal: 4 },
            ]}
          >
            <Text style={[styles.tabTxt, tab === t.key && styles.tabActiveTxt]}>
              {t.label}
            </Text>

            {tab === t.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {renderTabContent()}
    </SafeAreaView>
  );
}
