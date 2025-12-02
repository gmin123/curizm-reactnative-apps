/** ✅ Curizm 결제 페이지 (최신 /api/v1/payment/* 스펙 완전 대응) */
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  confirmPayment,
  createPaymentRequest,
  getPaymentPackages,
  getWalletInfo,
} from "../../api/setting/buycoin";
import { useAuth } from "../context/AuthContext";

/** 코인팩 타입 */
type CoinPack = {
  id: string;
  name: string;
  coins: number;
  priceKRW: number;
  isActive: boolean;
};

export default function BuyCoin() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token ?? "";

  const [balance, setBalance] = useState<number>(0);
  const [packages, setPackages] = useState<CoinPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "fail" | null>(null);

  /** 🔹 데이터 불러오기 */
  const loadData = useCallback(async () => {
    if (!token) return setLoading(false);
    try {
      const walletRes = await getWalletInfo(token);
      const packagesRes = await getPaymentPackages(token);
      setBalance(walletRes.balance ?? 0);
      setPackages(packagesRes ?? []);
    } catch (e) {
      console.warn("[buy-coin] 데이터 로드 실패:", e);
      Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** 🔹 결제 요청 */
  const onBuy = useCallback(
    async (pack: CoinPack) => {
      if (!token) return;
      if (paying) return;
      setPaying(pack.id);
      try {
        const successUrl = "exp+godori://payment/success";
        const failUrl = "exp+godori://payment/fail";

        const res = await createPaymentRequest(
          token,
          pack.id,
          successUrl,
          failUrl
        );
        if (res.checkoutUrl) {
          await WebBrowser.openBrowserAsync(res.checkoutUrl);
        } else {
          Alert.alert("오류", "결제 URL을 불러오지 못했습니다.");
        }
      } catch (e) {
        console.error("[buy-coin] 결제 실패:", e);
        setAlertType("fail");
      } finally {
        setPaying(null);
      }
    },
    [token, paying]
  );

  /** 🔹 1원 테스트 결제 */
  const onTestPay = useCallback(async () => {
    if (!token) {
      Alert.alert("로그인 필요", "로그인 후 테스트 결제를 진행해주세요.");
      return;
    }
    try {
      setPaying("test");
      const testPack = packages.find((p) => p.priceKRW === 1);
      if (!testPack) {
        Alert.alert("테스트용 1원 패키지를 찾을 수 없습니다.");
        return;
      }

      const res = await createPaymentRequest(
        token,
        testPack.id,
        "exp+godori://payment/success",
        "exp+godori://payment/fail"
      );
      if (res.checkoutUrl) {
        await WebBrowser.openBrowserAsync(res.checkoutUrl);
      }
    } catch (err) {
      console.error("❌ [1원 결제 실패]:", err);
      Alert.alert("오류", "1원 결제 테스트 중 오류가 발생했습니다.");
    } finally {
      setPaying(null);
    }
  }, [token, packages]);

  /** 🔹 결제 완료 처리 (딥링크) */
  useEffect(() => {
    const handleRedirect = async ({ url }: { url: string }) => {
      console.log("[Redirect 감지됨]:", url);
      const { path, queryParams } = Linking.parse(url);

      if (path === "payment/success") {
        const paymentKey = queryParams.paymentKey;
        const orderId = queryParams.orderId;
        const amount = Number(queryParams.amount);

        try {
          await confirmPayment(token, paymentKey, orderId, amount);
          setAlertType("success");
          await loadData();
        } catch (err) {
          console.error("결제 확인 실패:", err);
          setAlertType("fail");
        }
      } else if (path === "payment/fail") {
        setAlertType("fail");
      }
    };

    const sub = Linking.addEventListener("url", handleRedirect);
    return () => sub.remove();
  }, [token, loadData]);

  /** 🔹 상단 헤더 */
  const Header = useMemo(
    () => (
      <View style={S.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={S.cancelBtn}
        >
          <Text style={S.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={S.headerTitle}>코인 충전</Text>
      </View>
    ),
    [router]
  );

  /** 🔹 패키지 목록 */
  const renderRow = ({ item }: { item: CoinPack }) => {
    const busy = paying === item.id;
    return (
      <View style={S.packRow}>
        <Text style={S.packTitle}>{item.coins.toLocaleString()} 코인</Text>
        <TouchableOpacity
          style={S.buyBtn}
          disabled={busy}
          onPress={() => onBuy(item)}
        >
          <Text style={S.buyBtnTxt}>₩ {item.priceKRW.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={S.safe}>
        {Header}
        <ActivityIndicator style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.safe}>
      {Header}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={S.balanceBox}>
          <Text style={S.sectionLabel}>보유 코인</Text>
          <Text style={S.balanceValue}>
            {balance.toLocaleString()}{" "}
            <Text style={{ fontWeight: "900" }}>코인</Text>
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[S.sectionLabel, { marginBottom: 8 }]}>충전 코인</Text>
          <FlatList
            data={packages}
            keyExtractor={(it) => it.id}
            renderItem={renderRow}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            scrollEnabled={false}
          />
        </View>

        {/* ✅ 테스트 결제 버튼 */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity style={S.testPayBtn} onPress={onTestPay}>
            <Text style={S.testPayTxt}>💳 1원 테스트 결제하기</Text>
          </TouchableOpacity>
        </View>

        <View style={S.noteWrap}>
          <Text style={S.noteTitle}>코인 충전 유의 사항</Text>
          <Text style={S.noteItem}>
            • 유료 코인은 1코인 당 20원이며, 구매일로부터 1년간 사용 가능합니다.
          </Text>
          <Text style={S.noteItem}>
            • 보너스 코인은 6개월간 유효하며, 기간 만료 시 자동 소멸됩니다.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={!!alertType} transparent animationType="fade">
        <View style={S.alertBackdrop}>
          <View style={S.alertBox}>
            {alertType === "success" ? (
              <>
                <Text style={S.alertTitle}>코인 구매 완료!</Text>
                <Text style={S.alertDesc}>결제가 성공적으로 처리되었습니다.</Text>
                <TouchableOpacity
                  style={S.alertBtnPrimary}
                  onPress={() => setAlertType(null)}
                >
                  <Text style={S.alertBtnTxt}>확인</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={S.alertTitle}>결제 실패</Text>
                <Text style={S.alertDesc}>
                  결제가 취소되었거나 실패했습니다.{"\n"}다시 시도해주세요.
                </Text>
                <TouchableOpacity
                  style={S.alertBtnPrimary}
                  onPress={() => setAlertType(null)}
                >
                  <Text style={S.alertBtnTxt}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ───────────── 스타일 ───────────── */
const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  cancelBtn: { position: "absolute", left: 16, top: 12 },
  cancel: { fontSize: 16, color: "#FF5A4A", fontWeight: "700" },
  sectionLabel: { fontSize: 13, color: "#6B7280", fontWeight: "700" },
  balanceBox: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  balanceValue: { fontSize: 28, fontWeight: "900", color: "#111", marginTop: 6 },
  packRow: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packTitle: { fontSize: 15, fontWeight: "800", color: "#111" },
  buyBtn: {
    height: 32,
    minWidth: 88,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#EFF3F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  buyBtnTxt: { fontSize: 13, fontWeight: "800", color: "#111" },
  testPayBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FF6A3D",
    justifyContent: "center",
    alignItems: "center",
  },
  testPayTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
  noteWrap: { paddingHorizontal: 16, paddingBottom: 24, marginTop: 8 },
  noteTitle: { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 8 },
  noteItem: { fontSize: 12, color: "#6B7280", lineHeight: 18, marginBottom: 4 },
  alertBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  alertTitle: { fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 8 },
  alertDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  alertBtnPrimary: {
    height: 44,
    backgroundColor: "#FF5A4A",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  alertBtnTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
