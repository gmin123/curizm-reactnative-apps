// app/(mypage)/MySetting.tsx
import { apiGetMe, MeResponse } from "../../api/setting/mymember";
import { apiLogout, apiWithdraw } from "../../api/setting/settingapi";
import { useAuth } from "../context/AuthContext";

import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const CS_EMAIL = "contact@curizm.io";

export default function MySetting() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const token = user?.token || "";

  // ---------------- 프로필(내 정보) ----------------
  const [meLoading, setMeLoading] = useState(true);
  const [me, setMe] = useState<MeResponse>({});

  const loadMe = useCallback(async () => {
    if (!token) {
      setMe({});
      setMeLoading(false);
      return;
    }
    try {
      setMeLoading(true);
      const data = await apiGetMe(token);
      setMe(data || {});
    } catch (e: any) {
      console.warn("loadMe err:", e?.message || e);
    } finally {
      setMeLoading(false);
    }
  }, [token]);

  useEffect(() => { loadMe(); }, [loadMe]);
  useFocusEffect(useCallback(() => { loadMe(); }, [loadMe]));

  const displayEmail = me.email || user?.email || "";
  const displayName  = me.name  || "사용자 이름";
  const avatarUrl    = me.profileImg;

  const initialChar = useMemo(() => {
    const base = (displayName || displayEmail || "?").trim();
    return base ? base[0]?.toUpperCase() : "?";
  }, [displayName, displayEmail]);

  // ---------------- 내비게이션 ----------------
  const goBack = () => router.back();
  const goProfileManage = () => router.push("/(MyStroage)/setting/ProfileManage");
  const goPassword      = () => router.push("/(MyStroage)/setting/PasswordChange");

  const goNotif          = () => router.push("/(MyStroage)/notifications/settings");
  const goCoinHistory    = () => router.push("/rewards/CoinHistory");
  const goReward         = () => router.push("/rewards/RewardsPage");
  const goViewHistory = () =>
    router.push("/(MyStroage)/setting/ViewHistory");
  
  const goActivityNotif  = () => router.push("./(MyStroage)/settings/activity-noti");
  const openNotice       = () => router.push("/(MyStroage)/QuriNotices");
  const openTos          = () => router.push("/setting/RawList");
  const openPrivacy      = () => router.push("/(MyStroage)/setting/PersonRaw");
  const openCommunityPolicy = () => router.push("https://curizm.io/community-policy");
  const goDownloadManage = () => router.push("/(MyStroage)/setting/DownloadManage");
  const copyEmail = async () => {
    await Clipboard.setStringAsync(CS_EMAIL);
    Alert.alert("복사됨", "고객센터 이메일 주소가 복사되었어요.");
  };

  // ---------------- 계정 액션 ----------------
  const onLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            if (token) await apiLogout(token);
          } catch (e: any) {
            console.warn("logout API error:", e?.message || e);
          } finally {
            await logout();
            router.replace("/(mainpage)");
          }
        },
      },
    ]);
  };

  const onWithdraw = () => {
    Alert.alert(
      "탈퇴하기",
      "계정을 삭제하면 보관함, 코인, 활동 내역이 모두 삭제됩니다.\n정말 탈퇴하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) throw new Error("로그인이 필요합니다.");
              await apiWithdraw(token);   // ✅ 여기에서 API 호출
              Alert.alert("탈퇴 완료", "계정이 삭제되었습니다.");
            } catch (e: any) {
              Alert.alert("오류", e?.message || "탈퇴에 실패했습니다.");
              return;
            }
            await logout();
            router.replace("/(mainpage)");
          },
        },
      ]
    );
  };
  

  // ---------------- UI ----------------
  return (
    <SafeAreaView style={s.safe}>
      {/* 상단바 */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={goBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={s.container}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >

    
        {/* 섹션들 */}
        <Section title="계정">
          <Row label="회원 정보 관리" onPress={goProfileManage} />
          <Row label="비밀번호 변경" onPress={goPassword} />
          <Row label="알림 설정" onPress={goNotif} />
        </Section>

        <Section title="코인">
          <Row label="코인 내역" onPress={goCoinHistory} />
          <Row label="리워드 받기" onPress={goReward} />
        </Section>

        <Section title="활동">
        <Row label="다운로드 관리" onPress={goDownloadManage} />
          <Row label="감상 기록" onPress={goViewHistory} />

          <Row label="알림 설정" onPress={goActivityNotif} />
        </Section>

        <Section title="기타">
          <Row label="공지사항" onPress={openNotice} />
          <Row label="큐리즘 이용약관" onPress={openTos} />
          <Row label="개인정보 처리방침" onPress={openPrivacy} />
          <Row label="커뮤니티 운영 정책" onPress={openCommunityPolicy} />

          {/* 고객센터 */}
          <View style={s.csWrap}>
            <Text style={s.csLabel}>고객센터</Text>
            <TouchableOpacity onPress={copyEmail} style={s.copyBtn} activeOpacity={0.8}>
              <Text style={s.copy}>복사</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.csEmail}>{CS_EMAIL}</Text>
        </Section>

        {/* 하단 버튼 */}
        <View style={s.bottomBox}>
          <TouchableOpacity onPress={onLogout} style={s.bottomBtn} activeOpacity={0.8}>
            <Text style={s.bottomTxt}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onWithdraw} style={s.bottomBtn} activeOpacity={0.8}>
            <Text style={[s.bottomTxt, { color: "#EF4444" }]}>탈퇴하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----- 작은 컴포넌트 ----- */
function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  );
}
function Row({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row} activeOpacity={0.8}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.chev}>〉</Text>
    </TouchableOpacity>
  );
}

/* ----- styles ----- */
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  /* 상단바 */
  topbar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  back: {
    width: 24,
    textAlign: "left",fontWeight: "900",
    fontSize: 30,
    color: "#111827",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  /* 프로필 */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B7280",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  profileLink: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  /* 코인 카드 */
  coinCard: {
    backgroundColor: "#F6F7F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
    gap: 10,
  },
  coinTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coinLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  coinValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  chargeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  chargeTxt: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  rewardLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  dot: {
    marginHorizontal: 6,
    color: "#D1D5DB",
  },
  rewardSub: {
    fontSize: 13,
    color: "#6B7280",
  },

  /* 섹션 */
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },

  /* 행 */
  row: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  rowLabel: {
    fontSize: 15,
    color: "#111827",
  },
  chev: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  /* 고객센터 */
  csWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  csLabel: {
    fontSize: 15,
    color: "#111827",
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FFF1F2", // 연한 레드 배경
  },
  copy: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444", // 빨간 '복사'
  },
  csEmail: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: "#6B7280",
  },

  /* 하단 */
  bottomBox: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    gap: 4,
  },
  bottomBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTxt: {
    fontSize: 15,
    color: "#111827",
  },
});
