// app/(mainpage)/rewards/_layout.tsx
import { Stack } from "expo-router";

export default function RewardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RewardsPage" />
      <Stack.Screen name="CoinHistory" />
      <Stack.Screen name="InviteModal" />
      {/* 모달/토스트 페이지가 파일로 있다면 여기에 추가 */}
      {/* <Stack.Screen name="InviteModal" options={{ presentation: "modal" }} /> */}
    </Stack>
  );
}
