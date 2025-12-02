// MyStorage.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // 컨테이너 스타일
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // 상단 바 스타일
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  // 프로필 및 코인 카드 스타일
  profileRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  coinCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    margin: 16,
  },
  coinValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6A3D",
  },
  // 탭 메뉴 스타일
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  tabBtn: {
    paddingVertical: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
  },
  tabTextActive: {
    color: "#FF6A3D",
    fontWeight: "700",
  },
  tabUnderline: {
    width: "100%",
    height: 2,
    backgroundColor: "#FF6A3D",
    marginTop: 5,
  },
  // 보상 받기 및 기타 버튼 스타일
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  rewardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  rewardDesc: {
    fontSize: 14,
    color: "#666",
  },
  rewardBadge: {
    backgroundColor: "#FF6A3D",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rewardBadgeText: {
    color: "#fff",
    fontWeight: "800",
  },
});
