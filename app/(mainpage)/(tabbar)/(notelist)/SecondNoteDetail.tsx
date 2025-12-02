import CustomText from "@/app/components/CustomeText";
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function SecondNoteDetail({ note, bgColor, onClose }) {
  if (!note) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.fullscreen, { backgroundColor: bgColor }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={{ fontSize: 22, color: "white" }}>×</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <CustomText style={styles.title}>이건 두 번째 모달입니다.</CustomText>
          <CustomText style={styles.question}>{note.question}</CustomText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000cc",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  content: {
    marginHorizontal: 24,
    padding: 24,
    backgroundColor: "#222",
    borderRadius: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 12,
  },
  question: {
    color: "#fff",
    fontSize: 16,
  },
});
