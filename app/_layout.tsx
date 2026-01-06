import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import MiniAudioPlayer from "./(mainpage)/(maincontents)/(Exhi)/MiniAudioPlayer";
import { AuthProvider } from "./context/AuthContext";
import { AudioPlayerProvider } from "./store/AudioPlayerContext";

export default function RootLayout() {
  // 1️⃣ Hooks는 무조건 최상단
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/PretendardVariable.ttf"),
    "Pretendard-Medium": require("../assets/fonts/PretendardVariable.ttf"),
    "Pretendard-Bold": require("../assets/fonts/PretendardVariable.ttf"),
  });

  useEffect(() => {
    console.log("✅ RootLayout mounted");
  }, []);

  // 2️⃣ return 전에 Hook 더 쓰면 ❌
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 3️⃣ 여기부터는 안전
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 최초 진입 → index.tsx */}
          <Stack.Screen name="index" />

          {/* OAuth redirect */}
          <Stack.Screen name="oauth" />

          {/* 로그인 */}
          <Stack.Screen name="(Login)" />

          {/* 메인 */}
          <Stack.Screen name="(mainpage)" />

          {/* 기타 */}
          <Stack.Screen name="(search)" />
          <Stack.Screen name="(MyStroage)" />
          <Stack.Screen name="home" />
          <Stack.Screen name="settings" />
        </Stack>

        {/* 전역 미니 플레이어 */}
        <MiniAudioPlayer />
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
