import { Stack } from "expo-router";
import { AudioPlayerProvider } from "../store/AudioPlayerContext";
import MiniAudioPlayer from "./(maincontents)/(Exhi)/MiniAudioPlayer";

export default function MainPageLayout() {
  return (
    <AudioPlayerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ❌ index 제거 */}
        {/* <Stack.Screen name="index" /> */}

        <Stack.Screen name="home" />
        <Stack.Screen name="(maincontents)" />
        <Stack.Screen name="(tabbar)" />
        <Stack.Screen name="(Discover)" />
        <Stack.Screen name="(onlineDocent)" />
        <Stack.Screen name="(askquri)" />
        <Stack.Screen name="(footer)" />
        <Stack.Screen name="Homepaidfree" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="userrecommend" />
        <Stack.Screen name="HomeAllExhi" />
      </Stack>

      <MiniAudioPlayer />
    </AudioPlayerProvider>
  );
}

