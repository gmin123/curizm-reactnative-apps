import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import AuthGate from "../../app/(MyStorage)/AuthGate";

export default function Rewards() {
  const router = useRouter();
  return (
    <AuthGate>
      <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
        <View style={s.top}><Text style={s.title}>리워드 받기</Text></View>
        <View style={s.card}><Text>연속 출석 1일차 보상: 10 코인</Text></View>
        <View style={s.card}><Text>첫 질문 작성 보상: 20 코인</Text></View>
      </SafeAreaView>
    </AuthGate>
  );
}
const s = StyleSheet.create({ top:{ padding:16 }, title:{ fontSize:18, fontWeight:"700" }, card:{ marginHorizontal:16, marginBottom:12, padding:16, borderRadius:12, backgroundColor:"#F7F8FA" }});
  