import { useRouter } from "expo-router"; // ★ 추가
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const navItems = [
  {
    title: "작가",
    icon: require("../../../assets/images/artist.png"),
    route: "../(Discover)/HomeArtist", // 이동할 경로
  },
  {
    title: "작품",
    icon: require("../../../assets/images/artworks.png"),
    route: "../(Discover)/HomeArtworks",
  },
  {
    title: "전시",
    icon: require("../../../assets/images/exhibition.png"),
    route: "../(Discover)/HomeExhi",
  },
];

export default function HomeNavBtn() {
  const router = useRouter(); // ★ 훅 사용

  return (
    <View style={styles.container}>
      <Text style={styles.title}>둘러보기</Text>
      <View style={styles.row}>
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(item.route)} // ★ 경로로 이동
          >
            <Text style={styles.cardText}>{item.title}</Text>
            <Image source={item.icon} style={styles.icon} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#F5F8FB",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});
