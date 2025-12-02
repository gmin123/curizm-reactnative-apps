// app/index.tsx

import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, BackHandler, Button, StyleSheet, Text, View } from "react-native";

const useConsent = () => {
  const [consentGiven, setConsentGiven] = useState(false);

  // 앱 시작 시 동의 여부 확인
  useEffect(() => {
    const checkConsent = async () => {
      const consent = await AsyncStorage.getItem("userConsent");
      if (consent === "true") {
        setConsentGiven(true);
      }
    };
    checkConsent();
  }, []);

  // 동의 상태 처리
  const handleConsent = async (isGiven: boolean) => {
    setConsentGiven(isGiven);
    await AsyncStorage.setItem("userConsent", isGiven ? "true" : "false");

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

  return [consentGiven, handleConsent];
};

export default function Index() {
  const [consentGiven, handleConsent] = useConsent();

  // 동의하지 않으면 동의 창을 계속 띄움
  if (!consentGiven) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>개인정보 수집 동의</Text>
        <Text style={styles.subtitle}>
          본 앱은 사용자 개인정보를 수집하여 보다 나은 서비스를 제공하려고 합니다. 동의하십니까?
        </Text>
        <Button title="동의" onPress={() => handleConsent(true)} />
        <Button title="동의하지 않음" onPress={() => handleConsent(false)} />
      </View>
    );
  }

  // 동의한 후 메인 페이지로 리다이렉트
  return <Redirect href="/(mainpage)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});
