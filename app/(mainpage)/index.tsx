import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopNavigation from "../(top)/TopNavigation";
import { AudioPlayerProvider } from "../store/AudioPlayerContext";
import AskQuri from "./(askquri)/askQuri";
import Footer from "./(footer)/Footer";
import ExhibitionListSwiper from "./(maincontents)/(Exhi)/ExhibitionListSwiper";
import MiniAudioPlayer from "./(maincontents)/(Exhi)/MiniAudioPlayer";
import AnotherNote from "./(maincontents)/AnotherNote";
import ArtistList from "./(maincontents)/ArtistList";
import HomeNavBtn from "./(maincontents)/HomeNavBtn";
import OnlineDocent from "./(onlineDocent)/onlineDocent";
import CustomTabBar from "./(tabbar)/CustomTabBar";
import HomeAllExhi from "./HomeAllExhi";
import RecommendedArtworks from "./RecommendedArtworks";

/* -----------------------------
   개인정보 동의 훅
------------------------------ */
const useConsent = () => {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    // 테스트용: 항상 false
    setConsentGiven(true);
  }, []);

  const handleConsent = (isGiven: boolean) => {
    setConsentGiven(isGiven);

    if (!isGiven) {
      Alert.alert(
        "동의가 필요합니다",
        "개인정보 수집에 동의하지 않으면 앱을 사용할 수 없습니다.",
        [{ text: "앱 종료", onPress: () => BackHandler.exitApp() }],
        { cancelable: false }
      );
    }
  };

  return { consentGiven, handleConsent };
};

/* -----------------------------
   메인 화면
------------------------------ */
export default function Index() {
  const { consentGiven, handleConsent } = useConsent();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AudioPlayerProvider>
        <TopNavigation />

        {/* 🔥 동의 모달 (Overlay 방식) */}
        {consentGiven === false && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>개인정보 수집 동의</Text>
              <Text style={styles.subtitle}>
                본 앱은 사용자 개인정보를 수집하여 보다 나은 서비스를 제공합니다.
                동의하시겠습니까?
              </Text>

              <View style={styles.buttons}>
                <Button
                  title="동의"
                  color="#FF6A3D"
                  onPress={() => handleConsent(true)}
                />
                <Button
                  title="동의하지 않음"
                  color="#D1D5DB"
                  onPress={() => handleConsent(false)}
                />
              </View>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <CustomTabBar />
            <RecommendedArtworks />
            <OnlineDocent />
            <AskQuri />
            <HomeAllExhi />
            <AnotherNote />
            <ExhibitionListSwiper />
            <ArtistList />
            <HomeNavBtn />
          </View>
          <Footer />
        </ScrollView>

        <MiniAudioPlayer />
      </AudioPlayerProvider>
    </SafeAreaView>
  );
}

/* -----------------------------
   스타일
------------------------------ */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    color: "#4B5563",
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
