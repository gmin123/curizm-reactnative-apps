import { getCoinLedgers, getWalletInfo } from "@/api/setting/buycoin";
import { useAuth } from "@/app/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ 탭 정의
const TAB_LIST = [
  { key: "all", label: "전체" },
  { key: "charge", label: "적립" },
  { key: "use", label: "사용" },
];

// ✅ 탭 필터 함수
function filterForTab(tab: string, arr: any[]) {
  if (tab === "all") return arr;
  if (tab === "charge") return arr.filter((i: any) => i.amount > 0);
  if (tab === "use") return arr.filter((i: any) => i.amount < 0);
  return arr;
}

const Coinhistory = () => {
  const { user } = useAuth();
  const token = user?.token ?? "";
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const [coinBalance, setCoinBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // ✅ 코인 잔액 + 거래내역 불러오기
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.warn("⚠️ 토큰 없음, 요청 중단");
        return;
      }
      setLoading(true);
      try {
        console.log("📡 [코인 내역] /payment/wallet + /payment/ledger 요청 시작");

        // 1️⃣ 현재 잔액 불러오기
        const wallet = await getWalletInfo(token);
        console.log("✅ [응답] wallet:", wallet);
        setCoinBalance(wallet.balance ?? 0);

        // 2️⃣ 거래 내역 불러오기
        const ledgers = await getCoinLedgers(token);
        console.log("✅ [응답] ledger:", ledgers);

        // 서버 응답을 UI용으로 변환
        const mapped = ledgers.map((item: any, index: number) => {
          const amount =
            item.type?.startsWith("DEBIT") || item.coins < 0
              ? -Math.abs(item.coins)
              : Math.abs(item.coins);
          let title = "기타";
          if (item.type === "CREDIT_PURCHASE") title = "코인 충전";
          else if (item.type === "CREDIT_BONUS") title = "보너스 지급";
          else if (item.type === "DEBIT_EXHIBITION") title = "전시 결제";
          else if (item.type === "CREDIT_REFUND") title = "환불";
          else if (item.type === "CREDIT_REWARD") title = "리워드 보상";

          return {
            id: item.id ?? `${index}`,
            title,
            sub: item.description ?? "",
            amount,
            date: new Date(item.createdAt).toLocaleString("ko-KR", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setTransactions(mapped);
      } catch (err) {
        console.error("❌ [API 오류] 코인 내역 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const filtered = filterForTab(tab, transactions);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6A3D" />
        <Text style={{ marginTop: 10, color: "#777" }}>코인 내역을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 상단바 */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 18, paddingBottom: 7, paddingHorizontal: 15 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={22} color="#181818" />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 2, color: "#232528" }}>코인 내역</Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity style={styles.chargeBtn} onPress={() => router.push("/settings/CoinTopup")}>
            <Text style={styles.chargeBtnText}>충전하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 보유 코인/리워드 안내 */}
      <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
        <View style={styles.titleBox}>
          <Text style={styles.label}>보유 코인</Text>
          <Text style={styles.coinAmount}>
            <Text style={{ fontSize: 28 }}>{coinBalance.toLocaleString()}</Text> 코인
          </Text>
        </View>
        <View style={styles.rewardBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rewardLine1}>오늘의 리워드를 놓치지 마세요!</Text>
            <Text style={styles.rewardLine2}>출석만 해도 코인 즉시 지급</Text>
          </View>
          <Image
            source={require("../../../assets/images/coinhis.png")}
            style={styles.rewardCoinImg}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {TAB_LIST.map((tabEl) => (
          <TouchableOpacity
            key={tabEl.key}
            style={[styles.tabBtn, tab === tabEl.key && styles.tabBtnActive]}
            onPress={() => setTab(tabEl.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabBtnText, tab === tabEl.key && styles.tabBtnTextActive]}
            >
              {tabEl.label}
            </Text>
            {tab === tabEl.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 내역 리스트 */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 5, paddingBottom: 18 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                {item.sub ? <Text style={styles.rowSub}>{item.sub}</Text> : null}
                <Text style={styles.rowDate}>{item.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                <Text
                  style={[
                    styles.rowAmount,
                    item.amount > 0 ? styles.amountPlus : styles.amountMinus,
                  ]}
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount} 코인
                </Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.hr} />}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginVertical: 40 }}>
              <Text style={{ color: "#A3A3A3", fontSize: 16 }}>내역이 없습니다.</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: { color: "#757E8D", fontWeight: "bold", fontSize: 13, marginBottom: 2 },
  chargeBtn: {
    backgroundColor: "#FF6A3D",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  chargeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14, letterSpacing: -0.3 },
  titleBox: { marginTop: 3, marginBottom: 18 },
  coinAmount: { fontWeight: "bold", fontSize: 22, color: "#1D1F26", marginTop: 3 },
  rewardBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  rewardLine1: { color: "#181818", fontWeight: "bold", fontSize: 13.5, marginBottom: 4 },
  rewardLine2: { color: "#888C94", fontSize: 12.5, fontWeight: "600" },
  rewardCoinImg: { width: 44, height: 44, marginLeft: 7 },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 7,
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEEF1",
    marginBottom: -2,
  },
  tabBtn: {
    minWidth: 65,
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 17,
    paddingBottom: 6,
  },
  tabBtnText: { color: "#A2AAB7", fontWeight: "600", fontSize: 15 },
  tabBtnTextActive: { color: "#212428" },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#181926",
    marginHorizontal: "8%",
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 17, backgroundColor: "#fff" },
  rowTitle: { fontWeight: "bold", fontSize: 16, color: "#18181D", marginBottom: 2 },
  rowSub: { fontSize: 13.5, color: "#919191", fontWeight: "600", marginBottom: 1, marginTop: -1 },
  rowDate: { fontSize: 12.5, color: "#BCBDC4", marginTop: 2, fontWeight: "600" },
  rowAmount: { fontWeight: "bold", fontSize: 15.5, marginLeft: 7 },
  amountPlus: { color: "#FF6A3D" },
  amountMinus: { color: "#9EA4B2" },
  hr: { height: 1, backgroundColor: "#F2F3F6", marginLeft: 0 },
});

export default Coinhistory;
