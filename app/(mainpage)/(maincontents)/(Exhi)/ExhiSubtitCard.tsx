import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export interface Artwork {
  title: string;
  artist: string;
  thumbnail: string;
}

export default function ExhiSubtitCard({
  artwork,
  subtitleLines,
}: { artwork?: Artwork; subtitleLines?: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!artwork) {
    // 빈 상태 카드 (기본 안내)
    return (
      <View style={styles.cardOuter}>
        <Image source={require("../../../../assets/images/clogo.png")} style={styles.thumbnail} />
        <Text style={styles.title}>전시 제목 또는 작품 제목</Text>
        <Text style={styles.artist}>전시 장소 또는 작가 이름</Text>
        <Text style={styles.emptyGuide}>작품 정보 없음</Text>
      </View>
    );
  }

  const thumbnailSource =
    artwork.thumbnail && typeof artwork.thumbnail === "string"
      ? { uri: artwork.thumbnail }
      : require("../../../../assets/images/clogo.png");

  return (
    <View style={styles.cardOuter}>
      <View style={styles.headerRow}>
        <Image source={thumbnailSource} style={styles.thumbnail} />

        <View style={styles.headerTextBox}>
          <Text style={styles.title}>{artwork.title ?? "전시 제목 또는 작품 제목"}</Text>
          <Text style={styles.artist}>{artwork.artist ?? "전시 장소 또는 작가 이름"}</Text>
        </View>

        <TouchableOpacity style={styles.playBtn} onPress={() => setExpanded(true)}>
          <Text style={{ fontWeight: "bold", fontSize: 20, color: "#fff" }}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* 해설 카드 내부 */}
      <View style={styles.summaryBox}>
        {(subtitleLines ?? []).map((line, idx) => (
          <Text
            key={idx}
            style={
              line.match(/중앙/) // 특정 키워드 강조
                ? styles.detailEmphasized
                : styles.detail
            }
          >
            {line}
          </Text>
        ))}
      </View>

      {/* 모달형 전체 해설 */}
      <Modal visible={expanded} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.fullCard}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setExpanded(false)}
            >
              <Text style={styles.closeTxt}>전시 해설 전문 {'<'}</Text>
            </TouchableOpacity>
            {(subtitleLines ?? []).map((line, idx) => (
              <Text key={idx} style={styles.detail}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    margin: 18,
    elevation: 3
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eee",
    marginRight: 18
  },
  headerTextBox: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#232323",
    marginBottom: 2
  },
  artist: {
    fontSize: 12,
    color: "#9398A8",
    marginBottom: 2
  },
  playBtn: {
    backgroundColor: "#3E4F83",
    borderRadius: 17,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginLeft: 8
  },
  summaryBox: {
    marginTop: 12
  },
  detail: {
    fontSize: 15,
    color: "#232323",
    marginVertical: 5,
    lineHeight: 24
  },
  detailEmphasized: {
    fontSize: 15,
    color: "#232323",
    marginVertical: 5,
    lineHeight: 24,
    fontWeight: "bold"
  },
  emptyGuide: {
    color: "#9699A1",
    fontSize: 15,
    marginTop: 18,
    textAlign: "center"
  },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(36,45,56,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    minWidth: 270,
    maxWidth: 400,
    elevation: 5
  },
  closeBtn: { marginBottom: 12 },
  closeTxt: { fontWeight: "600", fontSize: 14, color: "#232323", marginBottom: 9 },
});
