import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AuthGate from "../../app/(MyStorage)/AuthGate";

export default function SettingsHome() {
  const router = useRouter();
  const Row = ({ label, to }: { label: string; to: string }) => (
    <TouchableOpacity style={s.row} onPress={() => router.push(to)}>
      <Text style={s.rowText}>{label}</Text>
      <Text>〉</Text>
    </TouchableOpacity>
  );

  return (
    <AuthGate>
      <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
        <StatusBar barStyle="dark-content" />
        <View style={s.header}><Text style={s.headerTitle}>설정</Text></View>
        <Row label="회원 정보 관리" to="/(settings)/ProfileManage" />
        <Row label="리워드 받기" to="/(settings)/Rewards" />
        <Row label="코인 충전" to="/(settings)/CoinTopup" />
        <Row label="약관 및 개인정보" to="/(settings)/Terms" />
      </SafeAreaView>
    </AuthGate>
  );
}
const s = StyleSheet.create({
  header:{ paddingHorizontal:16, paddingVertical:12 }, headerTitle:{ fontSize:20, fontWeight:"700" },
  row:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:16, borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:"#eee" },
  rowText:{ fontSize:16 },
});
