import CustomText from "@/app/components/CustomeText";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function FirstNoteDetail({ note, bgColor, onClose, onAnswerPress }) {
  if (!note) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.fullscreen}>
          {/* 닫기 버튼 */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontSize: 28, color: "white" }}>×</Text>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* ✅ 이미지 영역 */}
            <View style={styles.imageSection}>
              <Image source={{ uri: note.imageUrl }} style={styles.image} />
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0)",
                  `${bgColor}40`,
                  `${bgColor}90`,
                  `${bgColor}FF`,
                ]}
                locations={[0, 0.4, 0.8, 1]}
                style={styles.gradientOverlay}
              />
            </View>

            {/* ✅ 텍스트 영역 (완전 분리된 컬럼) */}
            <View style={[styles.textSection, { backgroundColor: bgColor }]}>
              <CustomText style={styles.label}>{note.label}</CustomText>
              <CustomText style={styles.subLabel}>{note.subLabel}</CustomText>
              <CustomText style={styles.question}>{note.question}</CustomText>

              <View style={styles.metaRow}>
                <CustomText style={styles.user}>{note.user}</CustomText>
                <TouchableOpacity onPress={onAnswerPress}>
                  <CustomText style={styles.answerButton}>Curi 답변 보기 →</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreen: {
    width: width,
    height: height,
    backgroundColor: "#000",
    flexDirection: "column", // ✅ 세로(column) 정렬
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: "column",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  imageSection: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    height: height * 0.15, // ✅ 상단 이미지 비율 줄임
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  textSection: {
    flexDirection: "column",
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  label: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 12,
    color: "white",
    marginBottom: 14,
  },
  question: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 28,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  user: {
    fontSize: 13,
    color: "white",
  },
  answerButton: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
});
