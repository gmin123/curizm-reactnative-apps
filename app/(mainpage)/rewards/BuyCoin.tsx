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
  confirmCoinOrder,
  createCoinOrder,
  fetchPackages,
  fetchWallet,
} from "../../../api/setting/buycoin";
import { useAuth } from "../../context/AuthContext";

/** 코인팩 타입 (서버에서 받아올 데이터 구조) */
type CoinPack = {
  id: string;
  name: string;
  coins: number;
  priceKRW: number;
  isActive: boolean;
  badge?: "추천" | "인기";
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

  /** 데이터 불러오기 */
  const loadData = useCallback(async () => {
    if (!token) return setLoading(false);
    try {
      const [walletRes, packagesRes] = await Promise.all([
        fetchWallet(token),
        fetchPackages(token),
      ]);

      console.log("[buy-coin] walletRes:", walletRes);
      console.log("[buy-coin] packagesRes:", packagesRes);

      setBalance(walletRes.balance ?? 0);
      setPackages(
        Array.isArray(packagesRes)
          ? packagesRes
          : packagesRes.packages ?? []
      );
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

  /** 결제 요청 */
  const onBuy = useCallback(
    async (pack: CoinPack) => {
      if (!token) return;
      if (paying) return;
      setPaying(pack.id);

      try {
        // 1️⃣ 주문 생성
        const res = await createCoinOrder(token, {
          packageId: pack.id,
          successUrl: "godori://payment/success",
          failUrl: "godori://payment/fail",
        });
        const { orderId, checkoutUrl } = res;

        // 2️⃣ Toss 결제창 열기
        if (checkoutUrl) {
          await WebBrowser.openBrowserAsync(checkoutUrl);
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

  /** 3️⃣ Toss 결제 완료 → 앱으로 복귀 시 처리 */
  useEffect(() => {
    const handleRedirect = async ({ url }: { url: string }) => {
      const { path, queryParams } = Linking.parse(url);
      console.log("[Payment Redirect Detected]", path, queryParams);

      if (path === "payment/success") {
        const paymentKey = queryParams.paymentKey;
        const orderId = queryParams.orderId;
        const amount = Number(queryParams.amount);

        try {
          await confirmCoinOrder(token, paymentKey, orderId, amount);
          setAlertType("success");
          await loadData();
        } catch (err) {
          console.error("결제 확인 실패:", err);
          setAlertType("fail");
        }
      }

      if (path === "payment/fail") {
        setAlertType("fail");
      }
    };

    const sub = Linking.addEventListener("url", handleRedirect);
    return () => sub.remove();
  }, [token, loadData]);

  /** 헤더 */
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

  /** 리스트 렌더 */
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
          <Text style={S.buyBtnTxt}>
            ₩ {item.priceKRW.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /** 로딩 */
  if (loading) {
    return (
      <SafeAreaView style={S.safe}>
        {Header}
        <ActivityIndicator style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  /** 메인 UI */
  return (
    <SafeAreaView style={S.safe}>
      {Header}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.balanceBox}>
          <Text style={S.sectionLabel}>보유 코인</Text>
          <Text style={S.balanceValue}>
            {balance.toLocaleString()}{" "}
            <Text style={{ fontWeight: "900" }}>코인</Text>
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[S.sectionLabel, { marginBottom: 8 }]}>
            충전 코인
          </Text>
          <FlatList
            data={packages}
            keyExtractor={(it) => it.id}
            renderItem={renderRow}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </View>

        {/* 유의사항 */}
        <View style={S.noteWrap}>
          <Text style={S.noteTitle}>코인 충전 유의 사항</Text>
          <Text style={S.noteHeader}>코인 가격 및 유효기간</Text>
          <Text style={S.noteItem}>
            • 유료 코인은 1코인 당 20원이며, 구매일로부터 1년간 사용
            가능합니다.
          </Text>
          <Text style={S.noteItem}>
            • 이벤트 등으로 지급된 보너스 코인은 지급일로부터 6개월간
            사용 가능하며, 유효기간 만료 시 자동 소멸됩니다.
          </Text>
        </View>
      </ScrollView>

      {/* 결제 결과 모달 */}
      <Modal visible={!!alertType} transparent animationType="fade">
        <View style={S.alertBackdrop}>
          <View style={S.alertBox}>
            {alertType === "success" ? (
              <>
                <Text style={S.alertTitle}>코인 구매 완료!</Text>
                <Text style={S.alertDesc}>
                  결제가 성공적으로 처리되었습니다.
                </Text>
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
  cancelBtn: {
    position: "absolute",
    left: 16,
    top: 12,
  },
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
  noteWrap: { paddingHorizontal: 16, paddingBottom: 24, marginTop: 8 },
  noteTitle: { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 8 },
  noteHeader: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
  },
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
  alertTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
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
  alertBtnTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
