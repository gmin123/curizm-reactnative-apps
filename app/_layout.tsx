import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import MiniAudioPlayer from "./(mainpage)/(maincontents)/(Exhi)/MiniAudioPlayer";
import { AuthProvider } from "./context/AuthContext";
import { AudioPlayerProvider } from "./store/AudioPlayerContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/PretendardVariable.ttf"),
    "Pretendard-Medium": require("../assets/fonts/PretendardVariable.ttf"),
    "Pretendard-Bold": require("../assets/fonts/PretendardVariable.ttf"),
  });

  if (!fontsLoaded) {
    return null; // 폰트가 로드될 때까지 대기
  }

  return (
    <AuthProvider>
    <AudioPlayerProvider>
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* 메인 페이지 - 기본 라우트 */}
        <Stack.Screen name="(mainpage)" options={{ headerShown: false }} />
        
        {/* 검색 페이지 */}
        <Stack.Screen name="(search)" options={{ headerShown: false }} />
        
        {/* 마이 스토리지 페이지 */}
        <Stack.Screen name="(MyStroage)" options={{ headerShown: false }} />
        
        {/* 로그인 페이지 */}
        <Stack.Screen name="(Login)" options={{ headerShown: false }} />
        
        {/* 홈 페이지 */}
        <Stack.Screen name="home" options={{ headerShown: false }} />
        
        {/* 설정 페이지 */}
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        
        {/* 기본 라우트를 (mainpage)로 설정 */}
        <Stack.Screen name="index" redirect />

      </Stack>
    
        <MiniAudioPlayer />
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
