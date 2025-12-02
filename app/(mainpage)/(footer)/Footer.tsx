import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Footer() {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>(주) 메시스</Text>

      <TouchableOpacity onPress={toggleExpanded} style={styles.toggleRow}>
        <Text style={styles.toggleText}>
          사업자 정보 {expanded ? "닫기" : "펼쳐보기"}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#666"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedInfo}>
          <Text>대표이사 강의훈</Text>
          <Text>개인정보보호책임자 서현제</Text>
          <Text>사업자 등록번호 504-88-02565</Text>
          <Text>통신판매업 신고번호 제2023-제주이도2-00863호</Text>
          <Text>주소: 제주시 이도이동 217, 제주창조경제혁신센터 3층</Text>
          <Text>대표번호: 02-6406-4789</Text>
          <Text>이메일: contact@curizm.io</Text>
        </View>
      )}

      <View style={styles.links}>
        <Text style={styles.link}>큐리즘 이용약관</Text>
        <Text style={styles.link}>개인정보 처리방침</Text>
        <Text style={styles.link}>커뮤니티 운영 정책</Text>
      </View>

      <Text style={styles.footerCopy}>© Mesis Inc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F9FB",
    padding: 16,
    marginTop: 32,
  },
  companyName: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleText: {
    color: "#555",
    marginRight: 6,
  },
  expandedInfo: {
    marginBottom: 8,
  },
  links: {
    marginTop: 12,
    paddingBottom: 12,
  },
  link: {
    color: "#111",
    fontSize: 13,
    marginBottom: 4,
  },
  footerCopy: {
    color: "#999",
    fontSize: 12,
    marginTop: 12,
  },
});
