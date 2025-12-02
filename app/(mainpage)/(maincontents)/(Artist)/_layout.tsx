import { Stack } from "expo-router";

export default function ArtistLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ArtistDetail" />
      <Stack.Screen name="style" />
    </Stack>
  );
}
