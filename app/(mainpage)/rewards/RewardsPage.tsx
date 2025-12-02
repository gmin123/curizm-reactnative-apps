import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  checkDailyLogin,
  claimAllRewards,
  claimReward,
  getDailyLoginStatus,
  getInviteUrls,
  getPendingRewards,
  getRewardStats,
} from "../../../api/coin/rewards"; // ✅ reward.ts 경로 확인!
import { useAuth } from "../../context/AuthContext";

/* ───────────── 미션 목록 정의 ───────────── */
const MISSION_CONFIG = [
  {
    id: "1",
    title: "일일 출석",
    desc: "코인 1개",
    color: "#FB485B",
    icon: <MaterialIcons name="calendar-today" size={26} color="#FB485B" />,
  },
  {
    id: "2",
    title: "주간 연속 출석",
    desc: "코인 10개",
    color: "#FF6A6F",
    icon: <MaterialIcons name="calendar-view-week" size={26} color="#FF6A6F" />,
  },
  {
    id: "3",
    title: "생각 공유하기",
    desc: "코인 5개",
    color: "#72C4A2",
    icon: <Feather name="message-square" size={24} color="#72C4A2" />,
  },
  {
    id: "4",
    title: "친구 초대하기",
    desc: "코인 50개",
    color: "#7AB8FF",
    icon: <MaterialIcons name="person-add-alt-1" size={26} color="#7AB8FF" />,
  },
];

/* ───────────── Circular Progress (SVG 기반 원형 테두리) ───────────── */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularMission = ({
  color,
  progress,
  completed,
  icon,
}: {
  color: string;
  progress: number;
  completed: boolean;
  icon: React.ReactNode;
}) => {
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress >= 1 ? 1.001 : progress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1.001],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E9EBEF" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={completed ? "#D1D1D1" : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View style={{ position: "absolute", justifyContent: "center", alignItems: "center" }}>
        {completed ? <MaterialIcons name="check" size={22} color="#B3B8C2" /> : icon}
      </View>
    </View>
  );
};

/* ───────────── RewardsPage ───────────── */
export default function RewardsPage() {
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [inviteData, setInviteData] = useState<any>(null);
  const [missionState, setMissionState] = useState({
    "1": { value: 0, total: 1, status: "doing" },
    "2": { value: 0, total: 7, status: "doing" },
    "3": { value: 0, total: 3, status: "doing" },
    "4": { value: 0, total: 1, status: "invite" },
  });
  const [showInviteModal, setShowInviteModal] = useState(false);

  /* ───────────── 데이터 불러오기 ───────────── */
  const loadRewards = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, pendingRes, inviteRes, loginStatus] = await Promise.all([
        getRewardStats(token),
        getPendingRewards(token),
        getInviteUrls(token),
        getDailyLoginStatus(token),
      ]);

      setStats(statsRes);
      setPending(pendingRes);
      setInviteData(inviteRes);

      setMissionState((prev) => ({
        ...prev,
        "1": { value: loginStatus.canClaim ? 1 : 0, total: 1, status: loginStatus.canClaim ? "claim" : "doing" },
        "2": { value: statsRes.currentStreak ?? 0, total: 7, status: "doing" },
        "3": { value: statsRes.todayShares ?? 0, total: 3, status: "doing" },
        "4": { value: statsRes.totalReferrals ?? 0, total: 1, status: "invite" },
      }));
    } catch (err) {
      console.warn("리워드 데이터 불러오기 실패:", err);
      Alert.alert("오류", "리워드 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [token]);

  /* ───────────── 출석 보상 받기 ───────────── */
  const handleDailyClaim = async () => {
    try {
      const res = await checkDailyLogin(token);
      if (res.dailyReward || res.streakReward) {
        Alert.alert("✅ 출석 완료", `현재 연속 출석 ${res.currentStreak}일!`);
        await loadRewards();
      } else {
        Alert.alert("출석 실패", "오늘 이미 출석하셨습니다.");
      }
    } catch (err) {
      Alert.alert("오류", "출석 체크 중 문제가 발생했습니다.");
    }
  };

  /* ───────────── 개별 보상받기 ───────────── */
  const handleClaim = async (id: string) => {
    const target = pending.find((p) => p.type === "DAILY_LOGIN");
    try {
      if (target) {
        const res = await claimReward(token, target.id);
        Alert.alert("🎉 보상 수령 완료", `${res.description} (+${res.coinsAwarded} 코인)`);
      } else {
        Alert.alert("보상 없음", "받을 수 있는 보상이 없습니다.");
      }
      await loadRewards();
    } catch (err) {
      Alert.alert("오류", "보상받기 실패했습니다.");
    }
  };

  /* ───────────── 전체 보상받기 ───────────── */
  const handleClaimAll = async () => {
    try {
      const res = await claimAllRewards(token);
      if (res.claimedCount > 0) {
        Alert.alert("🎊 전체 보상 수령 완료", `${res.totalCoins} 코인 획득!`);
      } else {
        Alert.alert("보상 없음", "받을 수 있는 보상이 없습니다.");
      }
      await loadRewards();
    } catch (err) {
      Alert.alert("오류", "전체 보상받기 실패했습니다.");
    }
  };

  /* ───────────── 초대 공유하기 ───────────── */
  const handleInviteShare = async () => {
    try {
      if (!inviteData) return;
      await Share.share({
        title: "큐리즘 초대",
        message: `제 초대 코드: ${inviteData.referralCode}\n가입하면 코인 보상!\n${inviteData.directSignupUrl}`,
      });
    } catch (err) {
      console.warn("공유 실패:", err);
    }
  };

  /* ───────────── 로딩 상태 ───────────── */
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FB485B" />
      </View>
    );
  }

  /* ───────────── UI ───────────── */
  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191E28" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리워드 받기</Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <View style={styles.coinBox}>
            <MaterialIcons name="monetization-on" size={18} color="#FF5858" />
            <Text style={styles.coinText}>{stats?.totalEarned ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* 오늘의 미션 */}
      <View style={styles.todayReward}>
        <Text>
          오늘의 미션 참여하고{" "}
          <Text style={styles.coinHighlight}>{pending.length * 5}코인</Text> 받아가세요!
        </Text>
      </View>

      {/* 미션 목록 */}
      <Text style={styles.sectionTitle}>미션 목록</Text>
      <View>
        {MISSION_CONFIG.map((config) => {
          const state = missionState[config.id];
          const percent = state.value / state.total;
          const completed = state.status === "done";

          return (
            <View key={config.id} style={styles.missionRow}>
              <CircularMission
                color={config.color}
                progress={percent}
                completed={completed}
                icon={config.icon}
              />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.missionName}>{config.title}</Text>
                <Text style={styles.missionDesc}>
                  {config.desc}{" "}
                  <Text style={{ color: config.color, fontWeight: "bold" }}>
                    {config.id === "2" || config.id === "3" ? `${state.value}/${state.total}` : ""}
                  </Text>
                </Text>
              </View>
              {config.id === "1" && (
                <TouchableOpacity style={styles.missionButton} onPress={handleDailyClaim}>
                  <Text style={[styles.buttonLabel, { color: "#fff" }]}>출석하기</Text>
                </TouchableOpacity>
              )}
              {config.id === "4" && (
                <TouchableOpacity
                  style={[styles.missionButton, { backgroundColor: "#7AB8FF" }]}
                  onPress={() => setShowInviteModal(true)}
                >
                  <Text style={[styles.buttonLabel, { color: "#fff" }]}>초대코드</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* 전체 보상받기 */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleClaimAll}>
        <Text style={styles.shareBtnText}>전체 보상받기</Text>
      </TouchableOpacity>

      {/* 유의사항 */}
      <Text style={styles.sectionTitle}>리워드 받기 유의 사항</Text>
      <View style={styles.infoBox}>
        <Text style={styles.desc}>
          • 일일 출석은 매일 자정에 초기화됩니다. {"\n"}
          • 주간 연속 출석은 7일 연속 출석 시 보상이 지급됩니다. {"\n"}
          • 생각 공유는 다른 사용자에게 공개된 생각만 카운트됩니다. {"\n"}
          • 추천 보상은 신규 가입자가 회원가입을 완료할 때 지급됩니다. {"\n"}
          • 모든 보상은 지급 후 취소할 수 없습니다. {"\n"}• 부정한 방법으로
          보상을 획득한 경우 계정이 제재될 수 있습니다.
        </Text>
      </View>

      {/* 초대코드 모달 */}
      <Modal visible={showInviteModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowInviteModal(false)}
            >
              <MaterialIcons name="close" size={22} color="#B0B1B9" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>친구 초대</Text>
            <Text style={styles.inviteText}>
              친구에게 이 코드를 공유하세요.{"\n"}
              친구가 회원가입할 때 이 코드를 입력하면{"\n"}
              <Text style={{ color: "#FB485B", fontWeight: "700" }}>코인 50개</Text>를 받을 수 있어요.
            </Text>
            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCode}>{inviteData?.referralCode ?? "-"}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleInviteShare}>
              <Text style={styles.shareBtnText}>공유하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ───────────── 스타일 ───────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 42 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  headerTitle: { fontWeight: "bold", fontSize: 21, marginLeft: 3, color: "#232528" },
  coinBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F6FA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 18,
  },
  coinText: { marginLeft: 3, fontWeight: "bold", fontSize: 15, color: "#FB485B" },
  todayReward: { backgroundColor: "#F8F6FA", borderRadius: 12, padding: 20, marginBottom: 22 },
  coinHighlight: { color: "#FB485B", fontWeight: "bold" },
  sectionTitle: { fontWeight: "bold", color: "#232528", fontSize: 16, marginBottom: 11, marginTop: 17 },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomColor: "#EFEFF2",
    borderBottomWidth: 1,
  },
  missionName: { fontWeight: "bold", fontSize: 15, color: "#24252B", marginBottom: 3 },
  missionDesc: { fontSize: 13, color: "#868A99" },
  missionButton: {
    minWidth: 68,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#FB485B",
    marginLeft: 8,
  },
  buttonLabel: { fontWeight: "bold", fontSize: 14 },
  infoBox: { marginTop: 8, backgroundColor: "#F8F6FA", borderRadius: 10, padding: 18 },
  desc: { fontSize: 13, color: "#858899", lineHeight: 19 },
  shareBtn: {
    backgroundColor: "#FB485B",
    borderRadius: 8,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
  },
  shareBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: "rgba(32,32,37,0.22)", alignItems: "center", justifyContent: "center" },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "85%",
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  modalCloseBtn: { position: "absolute", right: 14, top: 14, zIndex: 3, padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: "bold", alignSelf: "flex-start", marginBottom: 7, color: "#232528" },
  inviteText: {
    fontSize: 14,
    color: "#606985",
    marginTop: -2,
    marginBottom: 17,
    alignSelf: "flex-start",
    lineHeight: 20,
    fontWeight: "500",
  },
  inviteCodeBox: {
    backgroundColor: "#F6F8FB",
    borderRadius: 7,
    width: "90%",
    paddingVertical: 13,
    marginBottom: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteCode: { fontSize: 20, letterSpacing: 6, color: "#232528", fontWeight: "bold" },
});
