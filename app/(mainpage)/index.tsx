
import React, { useEffect, useState } from "react";
import { Alert, BackHandler, Button, ScrollView, StyleSheet, Text, View } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
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



const useConsent = () => {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null); // 동의 여부를 null로 초기화

  useEffect(() => {
    const checkConsent = async () => {
      // 테스트용: 항상 동의 모달 표시
      setConsentGiven(false);
      
      // // 저장된 동의 여부 확인 (테스트용 주석처리)
      // const consent = await AsyncStorage.getItem("userConsent");
      // if (consent === "true") {
      //   setConsentGiven(true); // 이미 동의한 경우
      // } else {
      //   setConsentGiven(false); // 동의하지 않은 경우
      // }
    };
    checkConsent();
  }, []);

  const handleConsent = async (isGiven: boolean) => {
    setConsentGiven(isGiven);
    // await AsyncStorage.setItem("userConsent", isGiven ? "true" : "false");
    // 테스트용: AsyncStorage 사용하지 않음

    if (!isGiven) {
      // 동의하지 않으면 앱 종료
      Alert.alert(
        "동의가 필요합니다",
        "개인정보 수집에 동의하지 않으면 앱을 사용할 수 없습니다.",
        [{ text: "앱 종료", onPress: () => BackHandler.exitApp() }],
        { cancelable: false }
      );
    }
  };

  return [consentGiven, handleConsent] as const;
};

export default function Index() {
  const [consentGiven, handleConsent] = useConsent();

  // 동의하지 않으면 동의 창을 계속 띄움
  if (consentGiven === false) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>개인정보 수집 동의</Text>
          <Text style={styles.subtitle}>
            본 앱은 사용자 개인정보를 수집하여 보다 나은 서비스를 제공하려고 합니다. 동의하십니까?
          </Text>
          <View style={styles.buttons}>
            <Button
              title="동의"
              color="#FF6A3D" // 원하는 색상으로 변경
              onPress={() => handleConsent(true)}
            />
            <Button
              title="동의하지 않음"
              color="#D1D5DB" // 회색 버튼으로 처리
              onPress={() => handleConsent(false)}
            />
          </View>
        </View>
      </View>
    );
  }

  // 동의 후 메인 페이지 표시
  return (
    <View style={styles.container}>
      <AudioPlayerProvider>
        <TopNavigation />
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
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#4B5563",
  },
  buttons: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});