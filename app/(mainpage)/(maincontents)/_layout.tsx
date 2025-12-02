import { Stack } from "expo-router";

export default function MainContentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(Exhi)" />
      <Stack.Screen name="(Artist)" />
      <Stack.Screen name="HomeNavBtn" />
      <Stack.Screen name="AnotherNote" />
      <Stack.Screen name="dropdownbtn" />
      <Stack.Screen name="ExhiAudioPlayer" />
      <Stack.Screen name="MiniAudioPlayer" />
      <Stack.Screen name="ExhiPage" />
      <Stack.Screen name="ExhiArtworks" />
      <Stack.Screen name="ExhiNotes" />
      <Stack.Screen name="ExhiQuri" />
      <Stack.Screen name="ExhiPageModal" />
      <Stack.Screen name="ExhibitionListSwiper" />
      <Stack.Screen name="ExhiArtist" />
      <Stack.Screen name="ArtWorksNotes" />
      <Stack.Screen name="HeaderNavButtons" />
      <Stack.Screen name="ArtistList" />
      <Stack.Screen name="DescriptionModal" />
    </Stack>
  );
}

